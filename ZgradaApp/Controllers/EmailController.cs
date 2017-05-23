using iTextSharp.text;
using iTextSharp.text.pdf;
using Microsoft.AspNet.Identity;
using QRCoder;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using System.Net.Security;
using System.Security.Claims;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace ZgradaApp.Controllers
{
    [Authorize]
    public class EmailController : Controller
    {
        private ZgradaDbEntities _db = new ZgradaDbEntities();
        string _physicalPathDir = System.Web.Hosting.HostingEnvironment.MapPath("~/Content/download");

        string Opis = "Placanje rashodi";
        string Poruka = "text za pozdravnu poruku";
        string Platitelj = "";
        string IBANPrimatelj = "";
        decimal Iznos = 0;
        Kompanije _tvrtka = null;
        Zgrade _zgrada = null;

        public async Task<JsonResult> SendRashodi(List<UplatniceRashodi> list)
        {
            if (list == null)
                return Json(new { success = false });

            if (list.Count == 0)
                return Json(new { success = false });


            var identity = (ClaimsIdentity)User.Identity;
            var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
            var tvrtka = await _db.Kompanije.FirstOrDefaultAsync(p => p.Id == companyId);
            _tvrtka = tvrtka;
            IBANPrimatelj = tvrtka.IBAN;

            // za svaki master, kreiraj uplatnicu (pdf), qr kod, nadji kome se salje i posalji
            IEnumerable<int> masteri = list.Where(p => p.poslano != true).Select(p => p.masterId).Distinct();

            if (masteri.Count() == 0)
                return Json(new { success = false });

          

            //int godina = (await _db.PrihodiRashodi.FirstOrDefaultAsync(p => p.Id == list[0].prihodiRashodiGodId)).Godina;
            int godina = list[0].godina;
            int zgradaId = list[0].zgradaId;
            int mjesec = list[0].mjesec;


            string email = "";
            var zgradaObj = await _db.Zgrade.FirstOrDefaultAsync(p => p.Id == zgradaId);
            _zgrada = zgradaObj;

            List<UplatniceRashodiPopis> uplatniceList = new List<UplatniceRashodiPopis>();

            foreach (var zgradaMasterId in masteri)
            {
                //var priRezGodina = await _db.PricuvaRezijeGodina.FirstOrDefaultAsync(p => p.ZgradaId == zgradaId && p.Godina == godina);
                //var priRezMjesec = priRezGodina.PricuvaRezijeMjesec.FirstOrDefault(p => p.Mjesec == mjesec);
                //var master = priRezMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == zgradaMasterId);
                //var vlasnik = master.PricuvaRezijePosebniDioMasterVlasnici.FirstOrDefault(p => p.PricuvaRezijePosebniDioMasterId == master.Id);
                //var vlasnikObj = await _db.Zgrade_Stanari.FirstOrDefaultAsync(p => p.Id == vlasnik.VlasnikId);

                var vlasniciPeriod = await _db.Zgrade_PosebniDijeloviMaster_VlasniciPeriod.FirstOrDefaultAsync(p => p.PosebniDioMasterId == zgradaMasterId && p.Zatvoren != true);
                // period nije zatvoren!
                var vlasnici = vlasniciPeriod.Zgrade_PosebniDijeloviMaster_VlasniciPeriod_Vlasnici.Where(p => p.VlasniciPeriodId == vlasniciPeriod.Id);
                var vlasnik = vlasnici.FirstOrDefault(p => p.UplatnicaGlasiNaVlasnika == true); // uzeo prvog
                if (vlasnik == null)
                    return Json(new { success = false });
                var vlasnikObj = await _db.Zgrade_Stanari.FirstOrDefaultAsync(p => p.Id == vlasnik.StanarId);
                Platitelj = vlasnikObj.Ime + " " + vlasnikObj.Prezime;
                string PozivNaBroj = "987654321";
                Iznos = list.Where(p => p.masterId == zgradaMasterId && p.godina == godina).Sum(p => p.iznos);

                var zgradaMaster = await _db.Zgrade_PosebniDijeloviMaster.FirstOrDefaultAsync(p => p.Id == zgradaMasterId);
                email = (await _db.Zgrade_Stanari.FirstOrDefaultAsync(p => p.Id == zgradaMaster.UplatnicaStanarId)).Email;

                var u = new UplatniceRashodiPopis
                {
                    Email = email,
                    PdfFileName = UplatnicaPdf(Opis, Platitelj, zgradaObj.Adresa, zgradaObj.Mjesto, IBANPrimatelj, PozivNaBroj, Iznos),
                    ZgradaMasterId = zgradaMasterId
                };
                uplatniceList.Add(u);
            }

            var ret = await SendMail(uplatniceList, Opis, Poruka);
            foreach (var r in ret)
            {
                var targetGod = await _db.PrihodiRashodi.FirstOrDefaultAsync(p => p.Godina == godina && p.ZgradaId == zgradaId);
                var targetRashodi = targetGod.PrihodiRashodi_Rashodi.Where(p => p.Mjesec == mjesec);
                foreach (var t in targetRashodi)
                {
                    if (t.PosebniDioMasterId == r.ZgradaMasterId)
                    {
                        t.PoslanoZaMjesec = r.Poslano;
                        t.StatusSlanja = r.StatusText;
                        t.DatumSlanja = DateTime.Now;
                        t.PdfFileName = r.PdfFileName;

                        //list.FirstOrDefault(p => p.masterId == t.PosebniDioMasterId).datumSlanja = t.DatumSlanja;
                        //list.FirstOrDefault(p => p.masterId == t.PosebniDioMasterId).poslano = r.Poslano;
                        //list.FirstOrDefault(p => p.masterId == t.PosebniDioMasterId).statusSlanja = r.StatusText;
                        foreach (var item in list.Where(p => p.masterId == t.PosebniDioMasterId && p.isUkupnoRow != true))
                        {
                            item.datumSlanja = t.DatumSlanja;
                            item.poslano = r.Poslano;
                            item.statusSlanja = r.StatusText;
                            item.PdfFileName = r.PdfFileName;
                        }
                    }
                }
            }
            await _db.SaveChangesAsync();
            //return new HttpStatusCodeResult(200, list.ToString());
            return Json(new { success = true, response = list });
            // kome se salje - pise u pdMasteru u zgradi - email
        }

        public async Task<ActionResult> CreateUplatnicaManually(int masterId, int godina, int mjesec, int zgradaId = 0)
        {
            try
            {
                var vlasniciPeriod = await _db.Zgrade_PosebniDijeloviMaster_VlasniciPeriod.FirstOrDefaultAsync(p => p.PosebniDioMasterId == masterId && p.Zatvoren != true);
                // period nije zatvoren!
                var vlasnici = vlasniciPeriod.Zgrade_PosebniDijeloviMaster_VlasniciPeriod_Vlasnici.Where(p => p.VlasniciPeriodId == vlasniciPeriod.Id);
                var vlasnik = vlasnici.FirstOrDefault(); // uzeo prvog
                var vlasnikObj = await _db.Zgrade_Stanari.FirstOrDefaultAsync(p => p.Id == vlasnik.StanarId);
                Platitelj = vlasnikObj.Ime + " " + vlasnikObj.Prezime;
                string PozivNaBroj = "987654321";
                var god = await _db.PrihodiRashodi.FirstOrDefaultAsync(p => p.Godina == godina);
                var mj = god.PrihodiRashodi_Rashodi.Where(p => p.Mjesec == mjesec && p.PosebniDioMasterId == masterId);
                Iznos = (decimal)mj.Where(p => p.PosebniDioMasterId == masterId).Sum(p => p.Iznos);
                var zgradaObj = await _db.Zgrade.FirstOrDefaultAsync(p => p.Id == zgradaId);
                _zgrada = zgradaObj;

                var identity = (ClaimsIdentity)User.Identity;
                var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
                var tvrtka = await _db.Kompanije.FirstOrDefaultAsync(p => p.Id == companyId);

                _tvrtka = tvrtka;
                var newGuid = UplatnicaPdf(Opis, Platitelj, zgradaObj.Adresa, zgradaObj.Mjesto, tvrtka.IBAN, PozivNaBroj, Iznos);

                foreach (var item in mj)
                {
                    item.PdfFileName = newGuid;
                }
                await _db.SaveChangesAsync();
                return Json(new { success = true });
            }
            catch
            {
                return Json(new { success = false });
            }
            
        }


        public string UplatnicaPdf(string Opis, string Platitelj, string PlatiteljAdresa, string PlatiteljMjesto, string IBANPrimatelj, string PozivNaBroj, decimal Iznos)
        {
            var doc = new Document(PageSize.A4, 30, 30, 25, 25);
            var guid = Guid.NewGuid();
            string path = Path.Combine(_physicalPathDir, guid.ToString() + ".pdf");
            PdfWriter writer = PdfWriter.GetInstance(doc, new FileStream(path, FileMode.Create));
            //var writer = PdfWriter.GetInstance(doc, output);
            doc.Open();

            var titleFont = FontFactory.GetFont("Arial", 16, Font.BOLD);
            //doc.Add(new Paragraph("Kartica posebnih dijelova", titleFont));
            //var boldRed = FontFactory.GetFont("Arial", 8, Font.BOLD, BaseColor.RED);
            var normalBlackSamll = FontFactory.GetFont("Arial", 8, Font.NORMAL, BaseColor.BLACK);
            var normalBlackLarge = FontFactory.GetFont("Arial", 10, Font.NORMAL, BaseColor.BLACK);
            var normalRed = FontFactory.GetFont("Arial", 7, Font.NORMAL, BaseColor.RED);
            int paddingLeft = 7;

            var backColorTamna = new BaseColor(255, 185, 181);
            var backColorSvijetla = new BaseColor(252, 200, 196);
            var borderColor = new BaseColor(175, 105, 100); ;



            PdfPTable tbl = new PdfPTable(8); // lijeva tablica
            tbl.HorizontalAlignment = 0;
            tbl.WidthPercentage = 100;
            tbl.DefaultCell.Border = 0;
            tbl.SetWidths(new int[] { 6, 1, 2, 2, 3, 3, 3, 7 });

            #region gornjiSegment
            PdfPCell cell = new PdfPCell(new Phrase("PLATITELJ (naziv/ime i adresa)", normalRed));
            cell.BorderColor = borderColor;
            cell.PaddingLeft = paddingLeft;
            cell.HorizontalAlignment = Element.ALIGN_LEFT;
            cell.VerticalAlignment = Element.ALIGN_TOP;
            tbl.AddCell(cell);

            // empty cell
            cell = new PdfPCell(new Phrase(" ", normalRed));
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.BorderColor = borderColor;
            cell.BackgroundColor = backColorTamna;
            tbl.AddCell(cell);

            cell = new PdfPCell(new Phrase("Hitno", normalRed));
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.BorderColor = borderColor;
            cell.BackgroundColor = backColorTamna;
            tbl.AddCell(cell);

            cell = new PdfPCell(new Phrase(" ", normalRed));
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);

            cell = new PdfPCell(new Phrase("Valuta plaćanja", normalRed));
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.BorderColor = borderColor;
            cell.BackgroundColor = backColorTamna;
            tbl.AddCell(cell);

            cell = new PdfPCell(new Phrase("HRK", normalBlackLarge));
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);

            cell = new PdfPCell(new Phrase("Iznos", normalRed));
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.BorderColor = borderColor;
            cell.BackgroundColor = backColorTamna;
            tbl.AddCell(cell);

            cell = new PdfPCell(new Phrase("=" + (String.Format("{0:0.00}", Iznos.ToString())), normalBlackLarge));
            cell.HorizontalAlignment = Element.ALIGN_RIGHT;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.PaddingRight = 7;
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);

            // drugi red
            cell = new PdfPCell(new Phrase(Platitelj + "\n" + PlatiteljAdresa + "\n" + PlatiteljMjesto, normalBlackSamll));
            cell.Rowspan = 3;
            cell.HorizontalAlignment = Element.ALIGN_LEFT;
            cell.PaddingLeft = paddingLeft;
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);
            // empty cell
            cell = new PdfPCell(new Phrase(" ", normalRed));
            cell.BackgroundColor = backColorSvijetla;
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);

            cell = new PdfPCell(new Phrase("IBAN ili broj računa platitelja ", normalRed));
            cell.Colspan = 3;
            cell.BackgroundColor = backColorSvijetla;
            cell.HorizontalAlignment = Element.ALIGN_LEFT;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);

            cell = new PdfPCell(new Phrase(" ", normalRed));
            cell.Colspan = 3;
            cell.HorizontalAlignment = Element.ALIGN_LEFT;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);

            // teci red
            // empty cell
            cell = new PdfPCell(new Phrase(" ", normalRed));
            cell.BackgroundColor = backColorSvijetla;
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);

            cell = new PdfPCell(new Phrase("Model ", normalRed));
            cell.BackgroundColor = backColorSvijetla;
            cell.Colspan = 3;
            cell.HorizontalAlignment = Element.ALIGN_LEFT;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);

            cell = new PdfPCell(new Phrase("Poziv na broj platitelja", normalRed));
            cell.BackgroundColor = backColorSvijetla;
            cell.Colspan = 3;
            cell.HorizontalAlignment = Element.ALIGN_LEFT;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);

            // 4 red
            // empty cell
            cell = new PdfPCell(new Phrase(" ", normalRed));
            cell.BackgroundColor = backColorSvijetla;
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);

            cell = new PdfPCell(new Phrase(" ", normalBlackLarge)); // model
            cell.Colspan = 3;
            cell.HorizontalAlignment = Element.ALIGN_RIGHT;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);

            cell = new PdfPCell(new Phrase(" ", normalBlackLarge)); // Poziv na broj platitelja
            cell.Colspan = 3;
            cell.HorizontalAlignment = Element.ALIGN_RIGHT;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);

            // 5 red
            cell = new PdfPCell(new Phrase(" ", normalRed));
            cell.BackgroundColor = backColorSvijetla;
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);
            // empty cell
            cell = new PdfPCell(new Phrase(" ", normalRed));
            cell.BackgroundColor = backColorSvijetla;
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);

            cell = new PdfPCell(new Phrase("IBAN ili broj računa primatelja", normalRed));
            cell.BackgroundColor = backColorSvijetla;
            cell.Colspan = 3;
            cell.HorizontalAlignment = Element.ALIGN_LEFT;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);

            cell = new PdfPCell(new Phrase(IBANPrimatelj, normalBlackLarge));
            cell.Colspan = 3;
            cell.HorizontalAlignment = Element.ALIGN_LEFT;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.PaddingLeft = 10;
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);
            #endregion

            #region srednjiSegment
            cell = new PdfPCell(new Phrase("PRIMATELJ (naziv/ime i adresa)", normalRed));
            cell.BorderColor = borderColor;
            cell.PaddingLeft = paddingLeft;
            cell.HorizontalAlignment = Element.ALIGN_LEFT;
            cell.VerticalAlignment = Element.ALIGN_TOP;
            tbl.AddCell(cell);

            // empty cell
            cell = new PdfPCell(new Phrase(" ", normalBlackLarge));
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.BorderColor = borderColor;
            cell.BackgroundColor = backColorSvijetla;
            tbl.AddCell(cell);

            cell = new PdfPCell(new Phrase("Model", normalRed));
            cell.Colspan = 2;
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.BorderColor = borderColor;
            cell.BackgroundColor = backColorSvijetla;
            tbl.AddCell(cell);

            cell = new PdfPCell(new Phrase("Poziv na broj primatelja", normalRed));
            cell.Colspan = 4;
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.BorderColor = borderColor;
            cell.BackgroundColor = backColorSvijetla;
            tbl.AddCell(cell);

            // drugi red
            cell = new PdfPCell(new Phrase(_tvrtka.Naziv + "\n" + _tvrtka.Adresa + "\n" + _tvrtka.Mjesto, normalBlackSamll));
            cell.Rowspan = 5;
            cell.HorizontalAlignment = Element.ALIGN_LEFT;
            cell.PaddingLeft = paddingLeft;
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);
            // empty cell
            cell = new PdfPCell(new Phrase(" ", normalRed));
            cell.BackgroundColor = backColorSvijetla;
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);


            cell = new PdfPCell(new Phrase("HR01", normalBlackLarge)); // model
            cell.Colspan = 2;
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);

            cell = new PdfPCell(new Phrase("20088704", normalBlackLarge));
            cell.Colspan = 4;
            cell.HorizontalAlignment = Element.ALIGN_LEFT;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.BorderColor = borderColor;
            cell.PaddingLeft = 7;
            tbl.AddCell(cell);

            // sifra namjene row
            cell = new PdfPCell(new Phrase(" ", normalBlackLarge));
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.BorderColor = borderColor;
            cell.BackgroundColor = backColorSvijetla;
            tbl.AddCell(cell);

            cell = new PdfPCell(new Phrase("Sifram namjene", normalRed));
            cell.Colspan = 2;
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.BorderColor = borderColor;
            cell.BackgroundColor = backColorSvijetla;
            tbl.AddCell(cell);


            cell = new PdfPCell(new Phrase("Opis placanja", normalRed));
            cell.Colspan = 1;
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.BorderColor = borderColor;
            cell.BackgroundColor = backColorSvijetla;
            tbl.AddCell(cell);

            cell = new PdfPCell(new Phrase("opis", normalRed));
            cell.Colspan = 4;
            cell.Rowspan = 4;
            cell.HorizontalAlignment = Element.ALIGN_LEFT;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);

            // sifra namjene row - unos
            // empty cell
            cell = new PdfPCell(new Phrase(" ", normalRed));
            cell.BackgroundColor = backColorSvijetla;
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);

            cell = new PdfPCell(new Phrase("OTLC", normalBlackLarge)); // model
            cell.Colspan = 2;
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);
            // empty cell
            cell = new PdfPCell(new Phrase(" ", normalBlackLarge));
            cell.BackgroundColor = backColorSvijetla;
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);

            // teci red
            // empty cell
            cell = new PdfPCell(new Phrase(" ", normalRed));
            cell.BackgroundColor = backColorSvijetla;
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);

            cell = new PdfPCell(new Phrase("Datum izvrsenja ", normalRed));
            cell.Colspan = 3;
            cell.BackgroundColor = backColorSvijetla;
            cell.HorizontalAlignment = Element.ALIGN_LEFT;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);

            // 4 red
            // empty cell
            cell = new PdfPCell(new Phrase(" ", normalRed));
            cell.BackgroundColor = backColorSvijetla;
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);

            cell = new PdfPCell(new Phrase(" ", normalBlackSamll)); // datum izvrsenja
            cell.Colspan = 2;
            cell.HorizontalAlignment = Element.ALIGN_RIGHT;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);

            // empty cell
            cell = new PdfPCell(new Phrase(" ", normalBlackSamll));
            cell.BackgroundColor = backColorSvijetla;
            cell.BorderColor = borderColor;
            tbl.AddCell(cell);

            #endregion

            #region donjiSegment

            // bar code
            //var code = iTextSharp.text.Image.GetInstance(Server.MapPath("~/Images/4guysfromrolla.gif"));
            var code = iTextSharp.text.Image.GetInstance(ImageToByte(GenQr(Platitelj, PlatiteljAdresa, PlatiteljMjesto)));
            //code.SetAbsolutePosition(440, 800);
            cell.PaddingBottom = 2;
            cell.PaddingLeft = 2;
            cell.PaddingRight = 2;
            cell.PaddingTop = 2;
            cell = new PdfPCell(code);
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.BorderColor = borderColor;
            cell.FixedHeight = 70;
            cell.Colspan = 3;
            cell.Rowspan = 2;
            tbl.AddCell(cell);

            // pecat
            cell = new PdfPCell(new Phrase("Pecat korisnika PU", normalRed));
            cell.HorizontalAlignment = Element.ALIGN_LEFT;
            cell.VerticalAlignment = Element.ALIGN_TOP;
            cell.BorderColor = borderColor;
            cell.Colspan = 3;
            tbl.AddCell(cell);

            // potpis
            cell = new PdfPCell(new Phrase("Potpis korisnika PU", normalRed));
            cell.HorizontalAlignment = Element.ALIGN_LEFT;
            cell.VerticalAlignment = Element.ALIGN_TOP;
            cell.BorderColor = borderColor;
            cell.Colspan = 3;
            tbl.AddCell(cell);

            // pecat
            cell = new PdfPCell(new Phrase(" ", normalBlackLarge));
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.BorderColor = borderColor;
            cell.FixedHeight = 70;
            cell.Colspan = 3;
            tbl.AddCell(cell);

            // potpis
            cell = new PdfPCell(new Phrase(" ", normalBlackLarge));
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.BorderColor = borderColor;
            cell.FixedHeight = 70;
            cell.Colspan = 2;
            tbl.AddCell(cell);

            #endregion


            doc.Add(tbl);
            //doc.Add(tblMain);
            doc.Close();
            writer.Close();
            //output.Close();

            // Response.AddHeader("Content-Disposition", string.Format("attachment;filename=Receipt-{0}.pdf", "Uplatnica.pdf"));
            //return File((byte[])output.ToArray(), "application/pdf");
            //return output.ToArray();



            return guid.ToString() + ".pdf";
        }

        public System.Drawing.Bitmap GenQr(string Platitelj, string PlatiteljAdresa, string PlatiteljMjesto)
        {
            QRCodeGenerator qrGenerator = new QRCodeGenerator();
            string q = "HRVHUB30\n";
            q += "HRK\n";
            q += "000000000018144\n";
            q += Platitelj + "\n";  //q += "Madjar Josipa by Dino\n";
            q += PlatiteljAdresa + "\n";  //q += "Kninska 3A\n";
            q += PlatiteljMjesto + "\n"; //q += "31000 Osijek\n";
            q += "Račun SZP\n";
            q += _tvrtka.Adresa + "\n";//q += "Kninska 3A\n";
            q += _tvrtka.Mjesto + "\n"; //q += "31000 Osijek\n";
            q += _tvrtka.IBAN + "\n"; //q += "HR7523900011300026568\n";
            q += "HR00\n";
            q += "011012016\n";
            q += "OTHR\n";
            q += Opis; //q += "Pričuva za 01 / 17, stan 11, G6 dospijeće 20.01.2016.stanje 31.12.16. = 0kn";


            QRCodeData qrCodeData = qrGenerator.CreateQrCode(q, QRCodeGenerator.ECCLevel.Q);
            QRCode qrCode = new QRCode(qrCodeData);
            System.Drawing.Bitmap qrCodeImage = qrCode.GetGraphic(20, System.Drawing.Color.Black, System.Drawing.Color.White, false);
            qrCodeImage.Save(Path.Combine(Server.MapPath("~/Content"), "qrH.png"));
            return qrCodeImage;
        }

        public static byte[] ImageToByte(System.Drawing.Image img)
        {
            System.Drawing.ImageConverter converter = new System.Drawing.ImageConverter();
            return (byte[])converter.ConvertTo(img, typeof(byte[]));
        }

        public async Task<List<UplatniceRashodiPopis>> SendMail(List<UplatniceRashodiPopis> Popis, string Naslov, string Poruka)
        {
            string server = System.Configuration.ConfigurationManager.AppSettings["SmtpServer"];
            string port = System.Configuration.ConfigurationManager.AppSettings["SmtpPort"];
            string from = System.Configuration.ConfigurationManager.AppSettings["SmtpFrom"];
            string auth = System.Configuration.ConfigurationManager.AppSettings["SmtpAuth"];
            string SmtpUname = System.Configuration.ConfigurationManager.AppSettings["SmtpUname"];
            string SmtpPass = System.Configuration.ConfigurationManager.AppSettings["SmtpPass"];
            string EnableSSL = System.Configuration.ConfigurationManager.AppSettings["EnableSSL"];
            //string ret = String.Empty;

            foreach (var item in Popis)
            {
                try
                {
                    // _______________________________________________________
                    //          WARNING, do we trust certificate?
                    // _______________________________________________________
                    ServicePointManager.ServerCertificateValidationCallback =
                        delegate (object s, X509Certificate certificate,
                                 X509Chain chain, SslPolicyErrors sslPolicyErrors)
                        { return true; };


                    System.Net.Mail.MailMessage message = new System.Net.Mail.MailMessage(from, item.Email, Naslov, Poruka);
                    message.IsBodyHtml = true;
                    SmtpClient emailClient = new SmtpClient(server, Convert.ToInt32(port));
                    if (EnableSSL == "True")
                        emailClient.EnableSsl = true;
                    if (auth == "True")
                        emailClient.Credentials = new System.Net.NetworkCredential(SmtpUname, SmtpPass);
                    //message.Attachments.Add(new Attachment(item.Uplatnica, "uplatnica.pdf"));
                    string uplatnicaPath = Path.Combine(_physicalPathDir, item.PdfFileName);
                    //if (item.UplatnicaPath != null)
                    if (System.IO.File.Exists(uplatnicaPath))
                    {
                        Attachment attachment = new Attachment(uplatnicaPath, MediaTypeNames.Application.Octet);
                        ContentDisposition disposition = attachment.ContentDisposition;
                        //disposition.CreationDate = File.GetCreationTime(attachmentFilename);
                        //disposition.ModificationDate = File.GetLastWriteTime(attachmentFilename);
                        //disposition.ReadDate = File.GetLastAccessTime(attachmentFilename);
                        disposition.FileName = Path.GetFileName("Rashodi.pdf");
                        //disposition.Size = new FileInfo(item.Uplatnica).Length;
                        disposition.DispositionType = DispositionTypeNames.Attachment;
                        message.Attachments.Add(attachment);

                        await emailClient.SendMailAsync(message);
                        //var path = Path.Combine(_physicalPathDir, item.UplatnicaPath);
                        //if (System.IO.File.Exists(path))
                        //    System.IO.File.Delete(path);
                        item.Poslano = true;
                        item.StatusText = "Poslano";
                    }
                    else
                    {
                        item.Poslano = false;
                        item.StatusText = "Uplatnica nije kreirana";
                    }
                }
                catch (Exception ex)
                {
                    //ret = item.Email + ":  " + ex.Message + "\n";
                    item.Poslano = false;
                    item.StatusText = ex.Message;
                }
            }
            return Popis;
        }

        public async Task<ActionResult> getUplatnicaRashod(int godina, int mjesec, int masterId)
        {
            var identity = (ClaimsIdentity)User.Identity;
            var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
            var god = await _db.PrihodiRashodi.FirstOrDefaultAsync(p => p.Godina == godina);
            var target = god.PrihodiRashodi_Rashodi.FirstOrDefault(p => p.Mjesec == mjesec && p.PosebniDioMasterId == masterId);

            //return Redirect(Server.MapPath("~/Content/download/" + target.PdfLink));
            return Redirect(GetBaseUrl() + "/Content/download/" + target.PdfFileName);
        }


        public string GetBaseUrl()
        {
            var appUrl = HttpRuntime.AppDomainAppVirtualPath;

            if (appUrl != "/")
                appUrl = "/" + appUrl;

            var baseUrl = string.Format("{0}://{1}{2}", Request.Url.Scheme, Request.Url.Authority, appUrl);

            return baseUrl;
        }
    }


    public class UplatniceRashodi
    {
        public int zgradaId { get; set; }
        public int rashodId { get; set; }
        public int prihodiRashodiGodId { get; set; }
        public int mjesec { get; set; }
        public int godina { get; set; }
        public int masterId { get; set; }
        public string masterNaziv { get; set; }
        public string rashod { get; set; }
        public decimal iznos { get; set; }
        public DateTime? datum { get; set; }
        public bool placeno { get; set; }
        public bool poslano { get; set; }
        public string statusSlanja { get; set; }
        public DateTime? datumSlanja { get; set; }
        public bool isUkupnoRow { get; set; }
        public string bold { get; set; }
        public string PdfFileName { get; set; }
    }

    public class UplatniceRashodiPopis
    {
        public string Email { get; set; }
        public string PdfFileName { get; set; }
        public int ZgradaMasterId { get; set; }
        public bool Poslano { get; set; }
        public string StatusText { get; set; }
    }

}