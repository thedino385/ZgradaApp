using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using iTextSharp.text;
using iTextSharp.text.pdf;
using System.IO;
using System.Data.Entity;

namespace ZgradaApp.Controllers
{
    [Authorize]
    public class PdfGeneratorController : ApiController
    {
        private readonly ZgradaDbEntities _db = new ZgradaDbEntities();

        [HttpPost]
        [Route("api/pdfgenerator/genPdfKarticePd")]
        public async Task<IHttpActionResult> GenPdfKarticePd(PdfParamsPosebniDio obj)
        {
            try
            {
                var zgrada = await _db.Zgrade.FirstOrDefaultAsync(p => p.Id == obj.master.ZgradaId);

                #region pdfCreation
                var doc = new Document(PageSize.A4, 30, 30, 25, 25);
                var physicalPath = Path.Combine(System.Web.Hosting.HostingEnvironment.MapPath("~/Content/download"), "PosebniDio-1223.pdf");
                PdfWriter writer = PdfWriter.GetInstance(doc, new FileStream(physicalPath, FileMode.Create));
                doc.Open();

                var titleFont = FontFactory.GetFont("Arial", 16, Font.BOLD);
                var subTitleFont = FontFactory.GetFont("Arial", 12, Font.BOLD);
                var boldTableFont = FontFactory.GetFont("Arial", 10, Font.BOLD);
                var cellTableFont = FontFactory.GetFont("Arial", 10, Font.NORMAL);
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
                tbl.SetWidths(new int[] { 1, 3, 1, 1, 1, 1 });

                BaseColor backColorGray = new BaseColor(252, 252, 252);
                BaseColor backColorGrayUkupno = new BaseColor(245, 245, 245); 
                BaseColor borderColor = new BaseColor(230, 230, 230);

                PdfPCell cell = new PdfPCell(new Phrase("Mj", boldTableFont));
                //cell.BackgroundColor = new iTextSharp.text.BaseColor(0, 150, 0);
                cell.BorderColor = borderColor;
                cell.HorizontalAlignment = Element.ALIGN_CENTER;
                tbl.AddCell(cell);

                cell = new PdfPCell(new Phrase("Prihodi", boldTableFont));
                cell.HorizontalAlignment = Element.ALIGN_CENTER;
                cell.BorderColor = borderColor;
                tbl.AddCell(cell);

                cell = new PdfPCell(new Phrase("Početno stanje", boldTableFont));
                cell.HorizontalAlignment = Element.ALIGN_RIGHT;
                cell.BorderColor = borderColor;
                tbl.AddCell(cell);

                cell = new PdfPCell(new Phrase("Prošli mjesec", boldTableFont));
                cell.BorderColor = borderColor;
                cell.HorizontalAlignment = Element.ALIGN_RIGHT;
                tbl.AddCell(cell);

                cell = new PdfPCell(new Phrase("Zaduženje", boldTableFont));
                cell.HorizontalAlignment = Element.ALIGN_RIGHT;
                cell.BorderColor = borderColor;
                tbl.AddCell(cell);

                cell = new PdfPCell(new Phrase("Dug/Pretplata", boldTableFont));
                cell.HorizontalAlignment = Element.ALIGN_RIGHT;
                cell.BorderColor = borderColor;
                tbl.AddCell(cell);

                List<int> mjeseci = obj.mjeseci;
                mjeseci.Sort();

                foreach (var mj in mjeseci)
                {
                    var mjesec = obj.tBodyList.FirstOrDefault(p => p.mjesec == mj);
                    cell = new PdfPCell(new Phrase(mjesec.mjesec.ToString() + ".", cellTableFont));
                    cell.BorderColor = borderColor;
                    cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                    tbl.AddCell(cell);

                    // prihodi
                    PdfPTable tblPrihodi = new PdfPTable(2);
                    tblPrihodi.DefaultCell.Border = 0;
                    //tbl.DefaultCell.BackgroundColor = BaseColor.GRAY;
                    foreach (var prihod in mjesec.prihodi)
                    {
                        tblPrihodi.AddCell(new Phrase(prihod.naziv, cellTableFont));
                        tblPrihodi.AddCell(new Phrase(prihod.iznos.ToString(), cellTableFont));
                    }
                    tbl.AddCell(tblPrihodi);

                    cell = new PdfPCell(new Phrase(mjesec.pocStanje.ToString(), cellTableFont));
                    cell.HorizontalAlignment = 2; // 0 -left, 1 - center, 2 - right
                    cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                    cell.BorderColor = borderColor;
                    tbl.AddCell(cell);

                    cell = new PdfPCell(new Phrase(mjesec.stanjeOd.ToString(), cellTableFont));
                    cell.HorizontalAlignment = 2; // 0 -left, 1 - center, 2 - right
                    cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                    cell.BorderColor = borderColor;
                    tbl.AddCell(cell);

                    cell = new PdfPCell(new Phrase(mjesec.zaduzenje.ToString(), cellTableFont));
                    cell.HorizontalAlignment = 2; // 0 -left, 1 - center, 2 - right
                    cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                    cell.BorderColor = borderColor;
                    tbl.AddCell(cell);

                    cell = new PdfPCell(new Phrase(mjesec.dugPretplata.ToString(), cellTableFont));
                    cell.HorizontalAlignment = 2; // 0 -left, 1 - center, 2 - right
                    cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                    cell.BorderColor = borderColor;
                    tbl.AddCell(cell);


                    // BEGIN vlasnici
                    cell = new PdfPCell(new Phrase("", cellTableFont));
                    //cell.BorderColorBottom = BaseColor.WHITE;
                    cell.BorderColor = borderColor;
                    tbl.AddCell(cell);

                    

                    cell = new PdfPCell(new Phrase("Vlasnici", cellTableFont));
                    cell.BackgroundColor = backColorGray;
                    cell.BorderColor = borderColor;
                    tbl.AddCell(cell);

                    var vlasnici = "";
                    foreach (var v in mjesec.vlasnici)
                    {
                        vlasnici += v.imePrezime;
                    }
                    cell = new PdfPCell(new Phrase(vlasnici, cellTableFont));
                    cell.BorderColor = borderColor;
                    cell.BackgroundColor = backColorGray;
                    cell.Colspan = 4;
                    tbl.AddCell(cell);
                    // END OF vlasnici

                    // BEGIN PosebiDijelovi
                    cell = new PdfPCell(new Phrase("", cellTableFont));
                    cell.BorderColor = borderColor;
                    tbl.AddCell(cell);

                    cell = new PdfPCell(new Phrase("Posebni dijelovi", cellTableFont));
                    cell.BorderColor = borderColor;
                    cell.BackgroundColor = backColorGray;
                    tbl.AddCell(cell);

                    var pdChildren = "";
                    foreach (var pd in mjesec.posDijelovi)
                    {
                        pdChildren += pd.naziv;
                    }
                    cell = new PdfPCell(new Phrase(pdChildren, cellTableFont));
                    cell.BorderColor = borderColor;
                    cell.BackgroundColor = backColorGray;
                    cell.Colspan = 4;
                    tbl.AddCell(cell);
                    // END OF PosebiDijelovi

                    if (mjesec.displayTotal)
                    {
                        //cell = new PdfPCell(new Phrase("", boldTableFont));
                        //tbl.AddCell(cell);

                        cell = new PdfPCell(new Phrase("Ukupno", boldTableFont));
                        cell.BorderColor = borderColor;
                        cell.BackgroundColor = backColorGrayUkupno;
                        cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                        cell.FixedHeight = 30;
                        tbl.AddCell(cell);

                        cell = new PdfPCell(new Phrase(mjesec.ukupnoPrihodi.ToString(), boldTableFont));
                        cell.BorderColor = borderColor;
                        cell.BackgroundColor = backColorGrayUkupno;
                        cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                        tbl.AddCell(cell);

                        cell = new PdfPCell(new Phrase("", boldTableFont));
                        cell.BorderColor = borderColor;
                        cell.BackgroundColor = backColorGrayUkupno;
                        cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                        cell.Colspan = 2;
                        tbl.AddCell(cell);

                        cell = new PdfPCell(new Phrase(mjesec.ukupnoZaduzenje.ToString(), boldTableFont));
                        cell.BorderColor = borderColor;
                        cell.BackgroundColor = backColorGrayUkupno;
                        cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                        tbl.AddCell(cell);

                        cell = new PdfPCell(new Phrase(mjesec.ukupnoDugPretplata.ToString(), boldTableFont));
                        cell.BorderColor = borderColor;
                        cell.BackgroundColor = backColorGrayUkupno;
                        cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                        tbl.AddCell(cell);

                        // empty row
                        cell = new PdfPCell(new Phrase("  ", boldTableFont));
                        cell.BorderColor = borderColor;
                        tbl.AddCell(cell);
                        cell = new PdfPCell(new Phrase("", boldTableFont));
                        cell.BorderColor = borderColor;
                        cell.Colspan = 5;
                        tbl.AddCell(cell);
                    }

                }






                //var tbl = new PdfPTable(6);
                //tbl.HorizontalAlignment = 0;
                //tbl.SpacingBefore = 10;
                //tbl.SpacingAfter = 10;
                //tbl.DefaultCell.Border = 0;
                //tbl.SetWidths(new int[] { 1, 4 });

                //PdfPCell cell = new PdfPCell();
                //cell.Phrase = new Phrase("header", boldTableFont);
                //cell.HorizontalAlignment = 0;
                //cell.Colspan = 6;
                //tbl.AddCell(cell);

                //cell = new PdfPCell();
                //cell.Phrase = new Phrase("Mjesec", boldTableFont);
                ////cell.Colspan = 2;
                //cell.HorizontalAlignment = 0;
                //tbl.AddCell(cell);

                //cell = new PdfPCell();
                //cell.Phrase = new Phrase("Iznos prihoda", boldTableFont);
                ////cell.Colspan = 2;
                //cell.HorizontalAlignment = 0;
                //tbl.AddCell(cell);

                //cell = new PdfPCell();
                //cell.Phrase = new Phrase("Početno stanje", boldTableFont);
                //cell.HorizontalAlignment = 0;
                //tbl.AddCell(cell);

                //cell = new PdfPCell();
                //cell.Phrase = new Phrase("Stanje iz prošlog mjeseca", boldTableFont);
                //cell.HorizontalAlignment = 0;
                //tbl.AddCell(cell);

                //cell = new PdfPCell();
                //cell.Phrase = new Phrase("Zaduženje", boldTableFont);
                //cell.HorizontalAlignment = 0;
                //tbl.AddCell(cell);

                //cell = new PdfPCell();
                //cell.Phrase = new Phrase("Dug/pretplata", boldTableFont);
                //cell.HorizontalAlignment = 0;
                //tbl.AddCell(cell);

                doc.Add(tbl);
                doc.Close();
                writer.Close();
                
                
               
                #endregion
                return Ok("link");
            }
            catch (Exception ex) { return InternalServerError(); }
        }


    }
}
