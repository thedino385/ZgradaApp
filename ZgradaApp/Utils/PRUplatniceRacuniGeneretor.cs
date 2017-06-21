using iTextSharp.text;
using iTextSharp.text.pdf;
using QRCoder;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;

namespace ZgradaApp
{
    public class PRUplatniceRacuniGeneretor
    {
        public PRUplatniceRacuniGeneretor()
        {

        }

        Zgrade _zgrada;

        public async Task<bool> PRUplatniceRacuniGeneretorGenerate(List<PricuvaRezijeMjesec_Uplatnice> uplatnice, Zgrade zgrada, Kompanije company, string path, int mjesec, int godina, ZgradaDbEntities db)
        {
            _zgrada = zgrada;
            // primatelj je IBAN zgrade


            if (!System.IO.Directory.Exists(path))
                System.IO.Directory.CreateDirectory(path);
            string path1 = Path.Combine(path, zgrada.CompanyId.ToString());
            if (!Directory.Exists(path1))
                System.IO.Directory.CreateDirectory(path1);
            string path11 = Path.Combine(path1, godina.ToString());
            if (!Directory.Exists(path11))
                System.IO.Directory.CreateDirectory(path11);
            string path2 = Path.Combine(path11, mjesec.ToString());
            if (!Directory.Exists(path2))
                System.IO.Directory.CreateDirectory(path2);

            foreach (var item in uplatnice)
            {
                if(item.TipPlacanja == "r")
                {
                    #region racun
                    var doc = new Document(PageSize.A4, 30, 30, 25, 25);
                    FileStream output;
                    if (!item.PdfUrl.Contains("/"))
                        output = new FileStream(Path.Combine(path2, item.PdfUrl), FileMode.Create);
                    else
                        output = new FileStream(item.PdfUrl, FileMode.Create);
                    var writer = PdfWriter.GetInstance(doc, output);

                    doc.Open();

                    BaseFont bf = BaseFont.CreateFont(BaseFont.HELVETICA, BaseFont.CP1250, false);
                    Font titleFont = new Font(bf, 13, Font.BOLD);
                    Font subTitleFont = new Font(bf, 12, Font.BOLD);
                    Font boldTableHeaderFont = new Font(bf, 8, Font.BOLD, BaseColor.BLACK);
                    Font boldTableFont = new Font(bf, 10, Font.BOLD, BaseColor.BLACK);
                    Font cellTableFont = new Font(bf, 10, Font.NORMAL, BaseColor.BLACK);

                    //var titleFont = FontFactory.GetFont("Arial", 13, Font.BOLD);
                    //var subTitleFont = FontFactory.GetFont("Arial", 12, Font.BOLD);
                    //var boldTableHeaderFont = FontFactory.GetFont("Arial", 8, Font.BOLD);
                    //var boldTableFont = FontFactory.GetFont("Arial", 10, Font.BOLD);
                    //var cellTableFont = FontFactory.GetFont("Arial", 10, Font.NORMAL);
                    //var endingMessageFont = FontFactory.GetFont("Arial", 10, Font.ITALIC);
                    //var bodyFont = FontFactory.GetFont("Arial", 12, Font.NORMAL);

                    #region tablica1
                    PdfPTable tbl = new PdfPTable(2);
                    tbl.HorizontalAlignment = 0;
                    tbl.WidthPercentage = 60;
                    //tbl.SpacingBefore = 10;
                    //tbl.SpacingAfter = 10;
                    tbl.DefaultCell.Border = 0;
                    //tbl.SetWidths(new int[] { 2, 1, 2 });

                    //var logo = iTextSharp.text.Image.GetInstance(System.Web.Hosting.HostingEnvironment.MapPath("~/Content/logo/logo.png"));
                   

                    var logo = iTextSharp.text.Image.GetInstance(System.Web.Hosting.HostingEnvironment.MapPath("~/Content/download/logo/") + company.Logo);

                    PdfPCell cell = new PdfPCell(logo, true);
                    cell.Rowspan = 5;
                    cell.BorderColor = BaseColor.WHITE;
                    cell.HorizontalAlignment = Element.ALIGN_LEFT;
                    tbl.AddCell(cell);

                    cell = new PdfPCell(new Phrase(company.Naziv, boldTableFont));
                    cell.PaddingLeft = 30;
                    cell.HorizontalAlignment = Element.ALIGN_LEFT;
                    cell.BorderColor = BaseColor.WHITE;
                    tbl.AddCell(cell);

                    cell = new PdfPCell(new Phrase(company.Adresa + ", " + company.Mjesto, cellTableFont));
                    cell.PaddingLeft = 30;
                    cell.HorizontalAlignment = Element.ALIGN_LEFT;
                    cell.BorderColor = BaseColor.WHITE;
                    tbl.AddCell(cell);

                    cell = new PdfPCell(new Phrase("OIB: " + company.OIB, cellTableFont));
                    cell.PaddingLeft = 30;
                    cell.HorizontalAlignment = Element.ALIGN_LEFT;
                    cell.BorderColor = BaseColor.WHITE;
                    tbl.AddCell(cell);

                    cell = new PdfPCell(new Phrase("tel: " + company.Telefon, cellTableFont));
                    cell.PaddingLeft = 30;
                    cell.HorizontalAlignment = Element.ALIGN_LEFT;
                    cell.BorderColor = BaseColor.WHITE;
                    tbl.AddCell(cell);

                    cell = new PdfPCell(new Phrase(company.Website, cellTableFont));
                    cell.PaddingLeft = 30;
                    cell.HorizontalAlignment = Element.ALIGN_LEFT;
                    cell.BorderColor = BaseColor.WHITE;
                    tbl.AddCell(cell);
                    #endregion

                    #region tablica2
                    PdfPTable tbl1 = new PdfPTable(3);
                    tbl1.HorizontalAlignment = 0;
                    tbl1.WidthPercentage = 100;
                    //tbl.SpacingBefore = 10;
                    //tbl.SpacingAfter = 10;
                    tbl1.DefaultCell.Border = 0;
                    tbl1.SetWidths(new int[] { 1, 1, 3 });

                    // prvi red
                    PdfPCell cell1 = new PdfPCell(new Phrase("Broj računa", boldTableFont));
                    cell1.HorizontalAlignment = Element.ALIGN_LEFT;
                    cell1.BorderColor = BaseColor.WHITE;
                    tbl1.AddCell(cell1);

                    cell1 = new PdfPCell(new Phrase(item.BrojRacuna));
                    cell1.HorizontalAlignment = Element.ALIGN_LEFT;
                    cell1.BorderColor = BaseColor.WHITE;
                    tbl1.AddCell(cell1);

                    // tko placa, RH - Id == -1,za ostale, adresa je zgrada
                    string platitelj = "Državne nekretnine d.o.o.";
                    string platiteljAddr = "Dežmanova 6, HR-10000 Zagreb";
                    string platiteljOIB = "OIB: 79058504140";
                    if(item.PlatiteljId != -1)
                    {
                        // onda je netko tko je unesen
                        var platiteljObj = zgrada.Zgrade_Stanari.FirstOrDefault(p => p.Id == item.PlatiteljId);
                        platitelj = platiteljObj.Ime + " " + platiteljObj.Prezime;
                        platiteljAddr = zgrada.Adresa + " " + zgrada.Mjesto;
                        platiteljOIB = platiteljObj.OIB;
                    }


                    cell1 = new PdfPCell(new Phrase(platitelj, boldTableFont));
                    cell1.Rowspan = 2;
                    cell1.HorizontalAlignment = Element.ALIGN_CENTER;
                    cell1.BorderColor = BaseColor.WHITE;
                    tbl1.AddCell(cell1);

                    // drugi red
                    cell1 = new PdfPCell(new Phrase("Datum računa", boldTableFont));
                    cell1.HorizontalAlignment = Element.ALIGN_LEFT;
                    cell1.BorderColor = BaseColor.WHITE;
                    tbl1.AddCell(cell1);

                    cell1 = new PdfPCell(new Phrase(((DateTime)item.DatumRacuna).ToShortDateString(), cellTableFont));
                    cell1.HorizontalAlignment = Element.ALIGN_LEFT;
                    cell1.BorderColor = BaseColor.WHITE;
                    tbl1.AddCell(cell1);

                    // treci red
                    cell1 = new PdfPCell(new Phrase("Datum isporuke", boldTableFont));
                    cell1.HorizontalAlignment = Element.ALIGN_LEFT;
                    cell1.BorderColor = BaseColor.WHITE;
                    tbl1.AddCell(cell1);

                    cell1 = new PdfPCell(new Phrase(((DateTime)item.DatumIsporuke).ToShortDateString(), cellTableFont));
                    cell1.HorizontalAlignment = Element.ALIGN_LEFT;
                    cell1.BorderColor = BaseColor.WHITE;
                    tbl1.AddCell(cell1);

                    cell1 = new PdfPCell(new Phrase(platiteljAddr, boldTableFont));
                    cell1.HorizontalAlignment = Element.ALIGN_CENTER;
                    cell1.BorderColor = BaseColor.WHITE;
                    tbl1.AddCell(cell1);

                    // 4 red
                    cell1 = new PdfPCell(new Phrase("Datum Dospijeća", boldTableFont));
                    cell1.HorizontalAlignment = Element.ALIGN_LEFT;
                    cell1.BorderColor = BaseColor.WHITE;
                    tbl1.AddCell(cell1);

                    cell1 = new PdfPCell(new Phrase(((DateTime)item.DatumDospijeca).ToShortDateString(), cellTableFont));
                    cell1.HorizontalAlignment = Element.ALIGN_LEFT;
                    cell1.BorderColor = BaseColor.WHITE;
                    tbl1.AddCell(cell1);

                    cell1 = new PdfPCell(new Phrase(platiteljOIB, boldTableFont));
                    cell1.HorizontalAlignment = Element.ALIGN_CENTER;
                    cell1.BorderColor = BaseColor.WHITE;
                    tbl1.AddCell(cell1);
                    #endregion

                    #region tablicaStavke
                    PdfPTable tbl2 = new PdfPTable(6);
                    tbl2.HorizontalAlignment = 0;
                    tbl2.WidthPercentage = 100;
                    //tbl.SpacingBefore = 10;
                    //tbl.SpacingAfter = 10;
                    //tbl2.DefaultCell.Border = 0;
                    tbl2.SetWidths(new int[] { 1, 2, 4, 1, 1, 1 });

                    // 1 red
                    var cell2 = new PdfPCell(new Phrase("r.b.", boldTableFont));
                    cell2.HorizontalAlignment = Element.ALIGN_CENTER;
                    //cell2.BorderColor = BaseColor.WHITE;
                    tbl2.AddCell(cell2);

                    cell2 = new PdfPCell(new Phrase("jed.mj.", boldTableFont));
                    cell2.HorizontalAlignment = Element.ALIGN_CENTER;
                    //cell2.BorderColor = BaseColor.WHITE;
                    tbl2.AddCell(cell2);

                    cell2 = new PdfPCell(new Phrase("Opis", boldTableFont));
                    cell2.HorizontalAlignment = Element.ALIGN_CENTER;
                    //cell2.BorderColor = BaseColor.WHITE;
                    tbl2.AddCell(cell2);

                    cell2 = new PdfPCell(new Phrase("jed.cijena\n[kn]", boldTableFont));
                    cell2.HorizontalAlignment = Element.ALIGN_CENTER;
                    //cell2.BorderColor = BaseColor.WHITE;
                    tbl2.AddCell(cell2);

                    cell2 = new PdfPCell(new Phrase("količina", boldTableFont));
                    cell2.HorizontalAlignment = Element.ALIGN_CENTER;
                    //cell2.BorderColor = BaseColor.WHITE;
                    tbl2.AddCell(cell2);

                    cell2 = new PdfPCell(new Phrase("ukupno[kn]", boldTableFont));
                    cell2.HorizontalAlignment = Element.ALIGN_CENTER;
                    //cell2.BorderColor = BaseColor.WHITE;
                    tbl2.AddCell(cell2);

                    // 2. red
                    cell2 = new PdfPCell(new Phrase("1.", cellTableFont));
                    cell2.HorizontalAlignment = Element.ALIGN_CENTER;
                    //cell2.BorderColor = BaseColor.WHITE;
                    tbl2.AddCell(cell2);

                    cell2 = new PdfPCell(new Phrase(item.JedMjera, cellTableFont));
                    cell2.HorizontalAlignment = Element.ALIGN_CENTER;
                    //cell2.BorderColor = BaseColor.WHITE;
                    tbl2.AddCell(cell2);

                    cell2 = new PdfPCell(new Phrase(item.Opis, cellTableFont));
                    cell2.HorizontalAlignment = Element.ALIGN_CENTER;
                    //cell2.BorderColor = BaseColor.WHITE;
                    tbl2.AddCell(cell2);

                    cell2 = new PdfPCell(new Phrase(item.JedCijena.ToString(), cellTableFont));
                    cell2.HorizontalAlignment = Element.ALIGN_CENTER;
                    //cell2.BorderColor = BaseColor.WHITE;
                    tbl2.AddCell(cell2);

                    cell2 = new PdfPCell(new Phrase(item.Kolicina.ToString(), cellTableFont));
                    cell2.HorizontalAlignment = Element.ALIGN_CENTER;
                    //cell2.BorderColor = BaseColor.WHITE;
                    tbl2.AddCell(cell2);

                    cell2 = new PdfPCell(new Phrase(item.Ukupno.ToString(), cellTableFont));
                    cell2.HorizontalAlignment = Element.ALIGN_CENTER;
                    //cell2.BorderColor = BaseColor.WHITE;
                    tbl2.AddCell(cell2);

                    #endregion

                    doc.Add(tbl);
                    doc.Add(new Paragraph("\n\n"));
                    doc.Add(tbl1);
                    doc.Add(new Paragraph("\n\n"));
                    doc.Add(tbl2);
                    doc.Add(new Paragraph("\n\n"));

                    Paragraph napomenaParag = new Paragraph();
                    item.Napomena = item.Napomena.Replace("<p>", "<br>");
                    item.Napomena = item.Napomena.Replace("</p>", "");

                    foreach (var row in Regex.Split(item.Napomena, "<br>"))
                    {
                        string chunk = "";
                        if (!row.Contains("<b>") && !row.Contains("</b>"))
                            napomenaParag.Add(new Chunk(row, cellTableFont));
                        else
                        {
                            foreach (var c in Regex.Split(row, "<b>"))
                            {
                                napomenaParag.Add(new Chunk(row.Replace("<b>", "").Replace("</b>", ""), boldTableFont));
                            }
                        }
                        napomenaParag.Add(new Chunk("\n", cellTableFont));
                    }
                    doc.Add(napomenaParag);
                    doc.Close();
                    writer.Close();
                    output.Close();
                    #endregion
                }
                else
                {
                    #region uplatnica

                    var doc = new Document(PageSize.A4, 30, 30, 25, 25);
                    FileStream output;
                    if (!item.PdfUrl.Contains("/"))
                        output = new FileStream(Path.Combine(path2, item.PdfUrl), FileMode.Create);
                    else
                        output = new FileStream(item.PdfUrl, FileMode.Create);
                    var writer = PdfWriter.GetInstance(doc, output);
                    doc.Open();

                    BaseFont bf = BaseFont.CreateFont(BaseFont.HELVETICA, BaseFont.CP1250, false);
                    Font titleFont = new Font(bf, 16, Font.BOLD);
                    Font normalBlackSamll = new Font(bf, 8, Font.NORMAL, BaseColor.BLACK);
                    Font normalBlackLarge = new Font(bf, 10, Font.NORMAL, BaseColor.BLACK);
                    Font normalRed = new Font(bf, 7, Font.NORMAL, BaseColor.BLACK);

                    //var titleFont = FontFactory.GetFont("Arial", 16, Font.BOLD);
                    //var normalBlackSamll = FontFactory.GetFont("Arial", 8, Font.NORMAL, BaseColor.BLACK);
                    //var normalBlackLarge = FontFactory.GetFont("Arial", 10, Font.NORMAL, BaseColor.BLACK);
                    //var normalRed = FontFactory.GetFont("Arial", 7, Font.NORMAL, BaseColor.RED);
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

                    cell = new PdfPCell(new Phrase("=" + (String.Format("{0:0.00}", item.UplatnicaZaPlatiti.ToString())), normalBlackLarge));
                    cell.HorizontalAlignment = Element.ALIGN_RIGHT;
                    cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                    cell.PaddingRight = 7;
                    cell.BorderColor = borderColor;
                    tbl.AddCell(cell);

                    // platitelj je stanar/korisnik, da ga jebes
                    var platitelj = await db.Zgrade_Stanari.FirstOrDefaultAsync(p => p.Id == item.PlatiteljId);
                    // primatelj je uvijek IBAN zgrade


                    // drugi red
                    cell = new PdfPCell(new Phrase(platitelj.Ime + " " + platitelj.Prezime + "\n" + zgrada.Adresa + "\n" + zgrada.Mjesto, normalBlackSamll));
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

                    cell = new PdfPCell(new Phrase(zgrada.IBAN, normalBlackLarge));
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
                    cell = new PdfPCell(new Phrase(zgrada.Naziv + "\n" + zgrada.Adresa + "\n" + zgrada.Mjesto, normalBlackSamll));
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


                    cell = new PdfPCell(new Phrase(item.UplatnicaModel, normalBlackLarge)); // model
                    cell.Colspan = 2;
                    cell.HorizontalAlignment = Element.ALIGN_CENTER;
                    cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                    cell.BorderColor = borderColor;
                    tbl.AddCell(cell);

                    cell = new PdfPCell(new Phrase(item.UplatnicaPozivNaBroj, normalBlackLarge));
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

                    cell = new PdfPCell(new Phrase("Sifra namjene", normalRed));
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

                    cell = new PdfPCell(new Phrase(item.UplatnicaOpis, normalRed));
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

                    cell = new PdfPCell(new Phrase(item.UplatnicaSifraNamjene, normalBlackLarge)); // model
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
                    var code = iTextSharp.text.Image.GetInstance(ImageToByte(GenQr(platitelj.Ime + " " + platitelj.Prezime, zgrada.Adresa, zgrada.Mjesto, item.UplatnicaModel, item.UplatnicaPozivNaBroj, item.UplatnicaSifraNamjene, item.UplatnicaOpis)));
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
                    doc.Close();
                    writer.Close();
                    output.Close();

                    #endregion
                }
            }


            return true;

        }

        public System.Drawing.Bitmap GenQr(string Platitelj, string PlatiteljAdresa, string PlatiteljMjesto, string model, string pozivNaBroj, string sifraNamjene, string opis)
        {
            QRCodeGenerator qrGenerator = new QRCodeGenerator();
            string q = "HRVHUB30\n";
            q += "HRK\n";
            q += "000000000018144\n";
            q += Platitelj + "\n";  //q += "Madjar Josipa by Dino\n";
            q += PlatiteljAdresa + "\n";  //q += "Kninska 3A\n";
            q += PlatiteljMjesto + "\n"; //q += "31000 Osijek\n";
            q += "Račun SZP\n";
            q += _zgrada.Adresa + "\n";//q += "Kninska 3A\n";
            q += _zgrada.Mjesto + "\n"; //q += "31000 Osijek\n";
            q += _zgrada.IBAN + "\n"; //q += "HR7523900011300026568\n";
            q += model + "\n";
            q += pozivNaBroj + "\n";
            q += sifraNamjene + "\n";
            q += opis; //q += "Pričuva za 01 / 17, stan 11, G6 dospijeće 20.01.2016.stanje 31.12.16. = 0kn";


            QRCodeData qrCodeData = qrGenerator.CreateQrCode(q, QRCodeGenerator.ECCLevel.Q);
            QRCode qrCode = new QRCode(qrCodeData);
            System.Drawing.Bitmap qrCodeImage = qrCode.GetGraphic(20, System.Drawing.Color.Black, System.Drawing.Color.White, false);
            //qrCodeImage.Save(Path.Combine(Server.MapPath("~/Content"), "qrH.png"));
            return qrCodeImage;
        }

        public static byte[] ImageToByte(System.Drawing.Image img)
        {
            System.Drawing.ImageConverter converter = new System.Drawing.ImageConverter();
            return (byte[])converter.ConvertTo(img, typeof(byte[]));
        }
    }
}