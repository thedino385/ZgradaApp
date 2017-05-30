using iTextSharp.text;
using iTextSharp.text.pdf;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace ZgradaApp.Controllers
{
    public class PdfController : Controller
    {
        private readonly ZgradaDbEntities _db = new ZgradaDbEntities();

        #region karticaPosebnogDijela
        [HttpPost]
        public async Task<ActionResult> genPdfKarticePd(PdfParamsPosebniDio obj)
        {
            try
            {
                var zgrada = await _db.Zgrade.FirstOrDefaultAsync(p => p.Id == obj.master.ZgradaId);

                #region pdfCreation
                var doc = new Document(PageSize.A4, 30, 30, 25, 25);
                //var physicalPath = Path.Combine(System.Web.Hosting.HostingEnvironment.MapPath("~/Content/download"), "PosebniDio-1223.pdf");
                //PdfWriter writer = PdfWriter.GetInstance(doc, new FileStream(physicalPath, FileMode.Create));
                var output = new MemoryStream();
                var writer = PdfWriter.GetInstance(doc, output);

                doc.Open();

                var titleFont = FontFactory.GetFont("Arial", 16, Font.BOLD);
                var subTitleFont = FontFactory.GetFont("Arial", 12, Font.BOLD);
                var boldTableFont = FontFactory.GetFont("Arial", 10, Font.BOLD);
                var cellTableFont = FontFactory.GetFont("Arial", 10, Font.NORMAL);
                var boldTableHeaderFont = FontFactory.GetFont("Arial", 8, Font.BOLD);
                //var endingMessageFont = FontFactory.GetFont("Arial", 10, Font.ITALIC);
                //var bodyFont = FontFactory.GetFont("Arial", 12, Font.NORMAL);

                doc.Add(new Paragraph("Kartica posebnih dijelova", titleFont));
                doc.Add(new Paragraph("Posebni dio: " + obj.master.Naziv, subTitleFont));
                doc.Add(new Paragraph("Godina : " + obj.godina, subTitleFont));
                doc.Add(new Paragraph("Zgrada : " + zgrada.Naziv + ", " + zgrada.Adresa + ", " + zgrada.Mjesto, subTitleFont));
                doc.Add(new Paragraph(" "));

                PdfPTable tbl = new PdfPTable(6);
                tbl.HorizontalAlignment = 0;
                tbl.WidthPercentage = 100;
                //tbl.SpacingBefore = 10;
                //tbl.SpacingAfter = 10;
                tbl.DefaultCell.Border = 0;
                //tbl.SetWidths(new int[] { 1, 3, 1, 1, 1, 1 });

                BaseColor backColorGray = new BaseColor(252, 252, 252);
                BaseColor backColorGrayUkupno = new BaseColor(245, 245, 245);
                BaseColor borderColor = new BaseColor(230, 230, 230);

                // rb
                PdfPCell cell = new PdfPCell(new Phrase("Rb", boldTableFont));
                //cell.BackgroundColor = new iTextSharp.text.BaseColor(0, 150, 0);
                cell.BorderColor = borderColor;
                cell.HorizontalAlignment = Element.ALIGN_CENTER;
                tbl.AddCell(cell);

                // Mjesec
                cell = new PdfPCell(new Phrase("Mjesec", boldTableFont));
                //cell.BackgroundColor = new iTextSharp.text.BaseColor(0, 150, 0);
                cell.BorderColor = borderColor;
                cell.HorizontalAlignment = Element.ALIGN_CENTER;
                tbl.AddCell(cell);

                cell = new PdfPCell(new Phrase("Datum", boldTableFont));
                cell.HorizontalAlignment = Element.ALIGN_CENTER;
                cell.BorderColor = borderColor;
                tbl.AddCell(cell);

                cell = new PdfPCell(new Phrase("Uplata", boldTableFont));
                cell.HorizontalAlignment = Element.ALIGN_RIGHT;
                cell.BorderColor = borderColor;
                tbl.AddCell(cell);

                cell = new PdfPCell(new Phrase("Zaduženje", boldTableFont));
                cell.BorderColor = borderColor;
                cell.HorizontalAlignment = Element.ALIGN_RIGHT;
                tbl.AddCell(cell);

                cell = new PdfPCell(new Phrase(" ", boldTableFont));
                cell.HorizontalAlignment = Element.ALIGN_RIGHT;
                cell.BorderColor = borderColor;
                tbl.AddCell(cell);

                //cell = new PdfPCell(new Phrase("Dug/Pretplata", boldTableFont));
                //cell.HorizontalAlignment = Element.ALIGN_RIGHT;
                //cell.BorderColor = borderColor;
                //tbl.AddCell(cell);

                List<int> mjeseci = obj.mjeseci;
                mjeseci.Sort();

                foreach (var mj in mjeseci)
                {
                    var recMjeseci = obj.tBodyList.Where(p => p.mjesec == mj);
                    foreach (var rec in recMjeseci)
                    {
                        cell = new PdfPCell(new Phrase(rec.rb.ToString() + ".", cellTableFont));
                        cell.BorderColor = borderColor;
                        cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                        cell.HorizontalAlignment = Element.ALIGN_CENTER;
                        tbl.AddCell(cell);

                        cell = new PdfPCell(new Phrase(rec.mjesec.ToString() + ".", cellTableFont));
                        cell.HorizontalAlignment = Element.ALIGN_CENTER;
                        cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                        cell.BorderColor = borderColor;
                        tbl.AddCell(cell);

                        cell = new PdfPCell(new Phrase(rec.datum.ToString("dd.MM.yyyy."), cellTableFont));
                        cell.HorizontalAlignment = 2; // 0 -left, 1 - center, 2 - right
                        cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                        cell.BorderColor = borderColor;
                        tbl.AddCell(cell);

                        cell = new PdfPCell(new Phrase(rec.showUplata == true ? String.Format("{0:0.00}", rec.prihod)  : " ", cellTableFont));
                        cell.HorizontalAlignment = 2; // 0 -left, 1 - center, 2 - right
                        cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                        cell.BorderColor = borderColor;
                        tbl.AddCell(cell);

                        cell = new PdfPCell(new Phrase(rec.showZaduzenje ? String.Format("{0:0.00}", rec.zaduzenje) : " ", cellTableFont));
                        cell.HorizontalAlignment = 2; // 0 -left, 1 - center, 2 - right
                        cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                        cell.BorderColor = borderColor;
                        tbl.AddCell(cell);

                        cell = new PdfPCell(new Phrase("", cellTableFont));
                        cell.HorizontalAlignment = 2; // 0 -left, 1 - center, 2 - right
                        cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                        cell.BorderColor = borderColor;
                        tbl.AddCell(cell);

                        // BEGIN vlasnici
                        //cell = new PdfPCell(new Phrase("", cellTableFont));
                        //cell.BorderColor = borderColor;
                        //tbl.AddCell(cell);

                        //cell = new PdfPCell(new Phrase("Vlasnici", cellTableFont));
                        //cell.BackgroundColor = backColorGray;
                        //cell.BorderColor = borderColor;
                        //tbl.AddCell(cell);

                        //var vlasnici = "";
                        //foreach (var v in rec.vlasnici)
                        //{
                        //    vlasnici += v.imePrezime;
                        //}
                        //cell = new PdfPCell(new Phrase(vlasnici, cellTableFont));
                        //cell.BorderColor = borderColor;
                        //cell.BackgroundColor = backColorGray;
                        //cell.Colspan = 4;
                        //tbl.AddCell(cell);
                        // END OF vlasnici

                        // BEGIN PosebiDijelovi
                        //cell = new PdfPCell(new Phrase("", cellTableFont));
                        //cell.BorderColor = borderColor;
                        //tbl.AddCell(cell);

                        //cell = new PdfPCell(new Phrase("Posebni dijelovi", cellTableFont));
                        //cell.BorderColor = borderColor;
                        //cell.BackgroundColor = backColorGray;
                        //tbl.AddCell(cell);

                        //var pdChildren = "";
                        //foreach (var pd in mjesec.posDijelovi)
                        //{
                        //    pdChildren += pd.naziv;
                        //}
                        //cell = new PdfPCell(new Phrase(pdChildren, cellTableFont));
                        //cell.BorderColor = borderColor;
                        //cell.BackgroundColor = backColorGray;
                        //cell.Colspan = 4;
                        //tbl.AddCell(cell);
                        // END OF PosebiDijelovi

                        if (rec.displayTotal)
                        {
                            cell = new PdfPCell(new Phrase(" ", boldTableFont));
                            cell.BorderColor = borderColor;
                            cell.BackgroundColor = backColorGrayUkupno;
                            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                            cell.Colspan = 2;
                            cell.FixedHeight = 30;
                            tbl.AddCell(cell);

                            cell = new PdfPCell(new Phrase("Ukupno", boldTableFont));
                            cell.BorderColor = borderColor;
                            cell.BackgroundColor = backColorGrayUkupno;
                            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                            cell.HorizontalAlignment = Element.ALIGN_LEFT;
                            cell.FixedHeight = 30;
                            tbl.AddCell(cell);

                            cell = new PdfPCell(new Phrase(String.Format("{0:0.00}", rec.ukupnoUplata), boldTableFont));
                            cell.BorderColor = borderColor;
                            cell.BackgroundColor = backColorGrayUkupno;
                            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                            cell.HorizontalAlignment = Element.ALIGN_RIGHT;
                            tbl.AddCell(cell);

                            cell = new PdfPCell(new Phrase(String.Format("{0:0.00}", rec.ukupnoZaduzenje), boldTableFont));
                            cell.BorderColor = borderColor;
                            cell.BackgroundColor = backColorGrayUkupno;
                            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                            cell.HorizontalAlignment = Element.ALIGN_RIGHT;
                            tbl.AddCell(cell);

                            cell = new PdfPCell(new Phrase(String.Format("{0:0.00}", rec.ukupno), boldTableFont));
                            cell.BorderColor = borderColor;
                            cell.BackgroundColor = backColorGrayUkupno;
                            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                            cell.HorizontalAlignment = Element.ALIGN_RIGHT;
                            tbl.AddCell(cell);

                            //cell = new PdfPCell(new Phrase(mjesec.ukupnoDugPretplata.ToString(), boldTableFont));
                            //cell.BorderColor = borderColor;
                            //cell.BackgroundColor = backColorGrayUkupno;
                            //cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                            //tbl.AddCell(cell);

                            // empty row
                            //cell = new PdfPCell(new Phrase("  ", boldTableFont));
                            //cell.BorderColor = borderColor;
                            //tbl.AddCell(cell);
                            //cell = new PdfPCell(new Phrase("", boldTableFont));
                            //cell.BorderColor = borderColor;
                            //cell.Colspan = 5;
                            //tbl.AddCell(cell);
                        }
                    }



                    

                }
                doc.Add(tbl);

                PdfPTable tblFooter = new PdfPTable(2);
                tblFooter.HorizontalAlignment = 0;
                tblFooter.WidthPercentage = 100;
                tblFooter.DefaultCell.Border = 0;
                tblFooter.DefaultCell.BorderColor = BaseColor.WHITE;
                tblFooter.SetWidths(new int[] { 3, 1 });

                PdfPCell cellFooterEmpty = new PdfPCell(new Phrase(" ", boldTableHeaderFont));
                cellFooterEmpty.FixedHeight = 35;
                cellFooterEmpty.Colspan = 2;
                cellFooterEmpty.BorderColor = BaseColor.WHITE;
                tblFooter.AddCell(cellFooterEmpty);

                //PdfPCell cellFooter10 = new PdfPCell(new Phrase("", boldTableHeaderFont));
                //cellFooter10.BorderColor = BaseColor.WHITE;
                //tblFooter.AddCell(cellFooter10);

                //PdfPCell cellFooter11 = new PdfPCell(new Phrase("", boldTableHeaderFont));
                //cellFooter11.BorderColor = BaseColor.WHITE;
                //cellFooter11.HorizontalAlignment = Element.ALIGN_RIGHT;
                //var logo = iTextSharp.text.Image.GetInstance(Server.MapPath("~/Content/images/logo.png"));
                //cellFooter11.AddElement(logo);
                //tblFooter.AddCell(cellFooter11);

                PdfPCell cellFooter20 = new PdfPCell(new Phrase("", boldTableHeaderFont));
                cellFooter20.BorderColor = BaseColor.WHITE;
                tblFooter.AddCell(cellFooter20);

                PdfPCell cellFooter21 = new PdfPCell(new Phrase("__________________________", boldTableHeaderFont));
                cellFooter21.BorderColor = BaseColor.WHITE;
                cellFooter21.HorizontalAlignment = Element.ALIGN_CENTER;
                tblFooter.AddCell(cellFooter21);

                PdfPCell cellFooter30 = new PdfPCell(new Phrase("", boldTableHeaderFont));
                cellFooter30.BorderColor = BaseColor.WHITE;
                tblFooter.AddCell(cellFooter30);

                PdfPCell cellFooter31 = new PdfPCell(new Phrase("Upravitelj", boldTableHeaderFont));
                cellFooter31.BorderColor = BaseColor.WHITE;
                cellFooter31.HorizontalAlignment = Element.ALIGN_CENTER;
                tblFooter.AddCell(cellFooter31);

                doc.Add(tblFooter);

                doc.Close();
                writer.Close();
                output.Close();
                SessionObj session = new SessionObj { Pdf = output.ToArray(), Naziv = obj.master.Naziv + ".pdf" };
                Session["PdfPosebniDio"] = session;


                doc.Close();
                writer.Close();

                //System.Web.Hosting.HostingEnvironment.

                #endregion
                return new HttpStatusCodeResult(200);
                //Response.StatusCode = 200;
                //return Content("link");
            }
            catch (Exception ex) { return new HttpStatusCodeResult(500);  }

        }

        public FileResult GetPdfPosebniDio()
        {
            var o = (SessionObj)Session["PdfPosebniDio"];
            Response.AddHeader("Content-Disposition", string.Format("attachment;filename={0}", o.Naziv));
            return File((byte[])o.Pdf, "application/pdf");
        }
        #endregion


        #region DnevnikRada

        [HttpPost]
        public async Task<ActionResult> genDnevnik(PdfParamsDnevnik obj)
        {
            try
            {
                var zgrada = await _db.Zgrade.FirstOrDefaultAsync(p => p.Id == obj.zgradaId);
                var dnevnikStavke = await _db.Zgrade_DnevnikRada.Where(p => p.ZgradaId == obj.zgradaId && p.Godina == obj.godina).ToListAsync();

                #region pdfCreation
                var doc = new Document(PageSize.A4, 30, 30, 25, 25);
                var output = new MemoryStream();
                var writer = PdfWriter.GetInstance(doc, output);

                doc.Open();

                var titleFont = FontFactory.GetFont("Arial", 16, Font.BOLD);
                var subTitleFont = FontFactory.GetFont("Arial", 12, Font.BOLD);
                var boldTableHeaderFont = FontFactory.GetFont("Arial", 8, Font.BOLD);
                var boldTableFont = FontFactory.GetFont("Arial", 10, Font.BOLD);
                var cellTableFont = FontFactory.GetFont("Arial", 10, Font.NORMAL);
                //var endingMessageFont = FontFactory.GetFont("Arial", 10, Font.ITALIC);
                //var bodyFont = FontFactory.GetFont("Arial", 12, Font.NORMAL);

                doc.Add(new Paragraph("Dnevnik izvršenih radova", titleFont));
                doc.Add(new Paragraph("Zgrada : " + zgrada.Naziv + ", " + zgrada.Adresa + ", " + zgrada.Mjesto, subTitleFont));
                doc.Add(new Paragraph("Godina : " + obj.godina, subTitleFont));
                
                doc.Add(new Paragraph(" "));

                PdfPTable tbl = new PdfPTable(6);
                tbl.HorizontalAlignment = 0;
                tbl.WidthPercentage = 100;
                //tbl.SpacingBefore = 10;
                //tbl.SpacingAfter = 10;
                tbl.DefaultCell.Border = 0;
                tbl.SetWidths(new int[] { 1, 1, 1, 3, 1, 1 });

                BaseColor backColorGray = new BaseColor(252, 252, 252);
                BaseColor backColorGrayUkupno = new BaseColor(245, 245, 245);
                BaseColor borderColor = new BaseColor(230, 230, 230);

                PdfPCell cell = new PdfPCell(new Phrase("Mj", boldTableHeaderFont));
                cell.BorderColor = borderColor;
                cell.HorizontalAlignment = Element.ALIGN_CENTER;
                tbl.AddCell(cell);

                cell = new PdfPCell(new Phrase("Rb.", boldTableHeaderFont));
                cell.HorizontalAlignment = Element.ALIGN_CENTER;
                cell.BorderColor = borderColor;
                tbl.AddCell(cell);

                cell = new PdfPCell(new Phrase("Datum", boldTableHeaderFont));
                cell.HorizontalAlignment = Element.ALIGN_CENTER;
                cell.BorderColor = borderColor;
                tbl.AddCell(cell);

                cell = new PdfPCell(new Phrase("Izvršeni rad", boldTableHeaderFont));
                cell.BorderColor = borderColor;
                cell.HorizontalAlignment = Element.ALIGN_CENTER;
                tbl.AddCell(cell);

                cell = new PdfPCell(new Phrase("Status", boldTableHeaderFont));
                cell.HorizontalAlignment = Element.ALIGN_CENTER;
                cell.BorderColor = borderColor;
                tbl.AddCell(cell);

                cell = new PdfPCell(new Phrase("Kreirao", boldTableHeaderFont));
                cell.HorizontalAlignment = Element.ALIGN_RIGHT;
                cell.BorderColor = borderColor;
                tbl.AddCell(cell);

                List<int> mjeseci = obj.mjeseci;
                mjeseci.Sort();
                foreach (var mj in mjeseci)
                {
                    // mjesec
                    cell = new PdfPCell(new Phrase(mj.ToString() + ".", boldTableFont));
                    cell.BorderColor = borderColor;
                    cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                    cell.HorizontalAlignment = Element.ALIGN_CENTER;
                    cell.Rowspan = dnevnikStavke.Where(p => p.Mjesec == mj).Count() * 3;
                    tbl.AddCell(cell);
                    int index = 1;
                    foreach (var stavka in dnevnikStavke.Where(p => p.Mjesec == mj))
                    {
                        // rb
                        cell = new PdfPCell(new Phrase(index.ToString() + ".", cellTableFont));
                        cell.BorderColor = borderColor;
                        cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                        cell.HorizontalAlignment = Element.ALIGN_CENTER;
                        tbl.AddCell(cell);

                        // datum
                        cell = new PdfPCell(new Phrase(stavka.Datum.ToString("dd.MM.yyyy."), cellTableFont));
                        cell.BorderColor = borderColor;
                        cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                        cell.HorizontalAlignment = Element.ALIGN_CENTER;
                        tbl.AddCell(cell);

                        // naslov
                        cell = new PdfPCell(new Phrase(stavka.Naslov.ToString(), cellTableFont));
                        cell.BorderColor = borderColor;
                        cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                        cell.HorizontalAlignment = Element.ALIGN_CENTER;
                        tbl.AddCell(cell);

                        // odradjeno
                        string odradjeno = stavka.Odradjeno == true ? "Zatvoren" : "Otvoren";
                        cell = new PdfPCell(new Phrase(odradjeno, cellTableFont));
                        cell.BorderColor = borderColor;
                        cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                        cell.HorizontalAlignment = Element.ALIGN_CENTER;
                        tbl.AddCell(cell);

                        // kreirao
                        var user = await _db.KompanijeUseri.FirstOrDefaultAsync(p => p.Id == stavka.UserId);
                        cell = new PdfPCell(new Phrase(user.Ime + " " + user.Prezime, cellTableFont));
                        cell.BorderColor = borderColor;
                        cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                        cell.HorizontalAlignment = Element.ALIGN_RIGHT;
                        tbl.AddCell(cell);

                        //opis
                        var emptCell = new PdfPCell(new Phrase("", cellTableFont));
                        emptCell.BorderColor = borderColor;
                        emptCell.VerticalAlignment = Element.ALIGN_MIDDLE;
                        emptCell.VerticalAlignment = Element.ALIGN_RIGHT;
                        tbl.AddCell(emptCell);

                        cell = new PdfPCell(new Phrase(stavka.Opis, cellTableFont));
                        cell.Colspan = 4;
                        cell.BorderColor = borderColor;
                        cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                        cell.VerticalAlignment = Element.ALIGN_LEFT;
                        tbl.AddCell(cell);

                        // prazan red nakon opisa
                        emptCell = new PdfPCell(new Phrase(" ", cellTableFont));
                        emptCell.BorderColor = borderColor;
                        tbl.AddCell(emptCell);

                        cell = new PdfPCell(new Phrase(" ", cellTableFont));
                        cell.Colspan = 4;
                        cell.BorderColor = borderColor;
                        tbl.AddCell(cell);

                        index++;
                    }
                    // prazan red nakon opisa
                    var emptRow = new PdfPCell(new Phrase(" ", cellTableFont));
                    emptRow.Colspan = 6;
                    emptRow.BorderColor = borderColor;
                    tbl.AddCell(emptRow);
                }
                doc.Add(tbl);

                PdfPTable tblFooter = new PdfPTable(2);
                tblFooter.HorizontalAlignment = 0;
                tblFooter.WidthPercentage = 100;
                tblFooter.DefaultCell.Border = 0;
                tblFooter.DefaultCell.BorderColor = BaseColor.WHITE;
                tblFooter.SetWidths(new int[] { 3, 1 });

                PdfPCell cellFooterEmpty = new PdfPCell(new Phrase(" ", boldTableHeaderFont));
                cellFooterEmpty.FixedHeight = 35;
                cellFooterEmpty.Colspan = 2;
                cellFooterEmpty.BorderColor = BaseColor.WHITE;
                tblFooter.AddCell(cellFooterEmpty);

                PdfPCell cellFooter20 = new PdfPCell(new Phrase("", boldTableHeaderFont));
                cellFooter20.BorderColor = BaseColor.WHITE;
                tblFooter.AddCell(cellFooter20);

                PdfPCell cellFooter21 = new PdfPCell(new Phrase("__________________________", boldTableHeaderFont));
                cellFooter21.BorderColor = BaseColor.WHITE;
                cellFooter21.HorizontalAlignment = Element.ALIGN_CENTER;
                tblFooter.AddCell(cellFooter21);

                PdfPCell cellFooter30 = new PdfPCell(new Phrase("", boldTableHeaderFont));
                cellFooter30.BorderColor = BaseColor.WHITE;
                tblFooter.AddCell(cellFooter30);

                PdfPCell cellFooter31 = new PdfPCell(new Phrase("Upravitelj", boldTableHeaderFont));
                cellFooter31.BorderColor = BaseColor.WHITE;
                cellFooter31.HorizontalAlignment = Element.ALIGN_CENTER;
                tblFooter.AddCell(cellFooter31);

                doc.Add(tblFooter);

                doc.Close();
                writer.Close();
                output.Close();
                SessionObj session = new SessionObj { Pdf = output.ToArray(), Naziv = "DnevnikRadova-" + obj.godina + ".pdf" };
                Session["PdfDnevnik"] = session;

                #endregion
                return new HttpStatusCodeResult(200);
                //Response.StatusCode = 200;
                //return Content("link");
            }
            catch (Exception ex) { return new HttpStatusCodeResult(500); }

        }

        public FileResult GetPdfDnevnik()
        {
            var o = (SessionObj)Session["PdfDnevnik"];
            Response.AddHeader("Content-Disposition", string.Format("attachment;filename=Receipt-{0}.pdf", o.Naziv));
            return File((byte[])o.Pdf, "application/pdf");
        }

        #endregion


        //public static byte[] ConvertStreamToByteArr(Stream input)
        //{
        //    byte[] buffer = new byte[16 * 1024];
        //    using (MemoryStream ms = new MemoryStream())
        //    {
        //        int read;
        //        while ((read = input.Read(buffer, 0, buffer.Length)) > 0)
        //        {
        //            ms.Write(buffer, 0, read);
        //        }
        //        return ms.ToArray();
        //    }
        //}
    }

    public class SessionObj
    {
        public byte[] Pdf { get; set; }
        public string Naziv { get; set; }
    }

    
}