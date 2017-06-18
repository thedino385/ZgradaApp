using iTextSharp.text;
using iTextSharp.text.pdf;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;

namespace ZgradaApp
{
    public class PRUplatniceRacuniGeneretor
    {
        public PRUplatniceRacuniGeneretor()
        {

        }


        public bool PRUplatniceRacuniGeneretorGenerate(List<PricuvaRezijeMjesec_Uplatnice> uplatnice, Zgrade zgrada, Kompanije company, string path, int mjesec, int godina)
        {
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
                    //string pdf = Guid.NewGuid().ToString() + ".pdf";
                    //if (item.Uplatnica == null)
                    string pdf = item.PdfUrl;
                    var output = new FileStream(Path.Combine(path2, pdf), FileMode.Create);
                    var writer = PdfWriter.GetInstance(doc, output);

                    doc.Open();

                    var titleFont = FontFactory.GetFont("Arial", 13, Font.BOLD);
                    var subTitleFont = FontFactory.GetFont("Arial", 12, Font.BOLD);
                    var boldTableHeaderFont = FontFactory.GetFont("Arial", 8, Font.BOLD);
                    var boldTableFont = FontFactory.GetFont("Arial", 10, Font.BOLD);
                    var cellTableFont = FontFactory.GetFont("Arial", 10, Font.NORMAL);
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
                    // uplatnica
                }
            }


            return true;

        }
    }
}