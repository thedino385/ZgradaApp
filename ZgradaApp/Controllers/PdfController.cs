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
                    cell = new PdfPCell(new Phrase(mjesec.mjesec.ToString() + ".", boldTableFont));
                    cell.BorderColor = borderColor;
                    cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                    tbl.AddCell(cell);

                    // prihodi
                    PdfPTable tblPrihodi = new PdfPTable(2);
                    tblPrihodi.DefaultCell.Border = 0;
                    foreach (var prihod in mjesec.prihodi)
                    {
                        tblPrihodi.AddCell(new Phrase(prihod.naziv, cellTableFont));
                        tblPrihodi.AddCell(new Phrase(prihod.iznos.ToString(), cellTableFont));
                    }
                    tbl.AddCell(tblPrihodi);

                    cell = new PdfPCell(new Phrase(mjesec.pocStanje.ToString(), cellTableFont));
                    cell.HorizontalAlignment = Element.ALIGN_RIGHT;
                    cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                    cell.BorderColor = borderColor;
                    tbl.AddCell(cell);

                    cell = new PdfPCell(new Phrase(mjesec.stanjeOd.ToString(), cellTableFont));
                    cell.HorizontalAlignment = Element.ALIGN_RIGHT;
                    cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                    cell.BorderColor = borderColor;
                    tbl.AddCell(cell);

                    cell = new PdfPCell(new Phrase(mjesec.zaduzenje.ToString(), cellTableFont));
                    cell.HorizontalAlignment = Element.ALIGN_RIGHT;
                    cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                    cell.BorderColor = borderColor;
                    tbl.AddCell(cell);

                    cell = new PdfPCell(new Phrase(mjesec.dugPretplata.ToString(), cellTableFont));
                    cell.HorizontalAlignment = Element.ALIGN_RIGHT;
                    cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                    cell.BorderColor = borderColor;
                    tbl.AddCell(cell);

                    // BEGIN vlasnici
                    cell = new PdfPCell(new Phrase("", cellTableFont));
                    cell.BorderColor = borderColor;
                    tbl.AddCell(cell);

                    cell = new PdfPCell(new Phrase("Vlasnici", cellTableFont));
                    cell.FixedHeight = 20;
                    cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                    cell.BackgroundColor = backColorGray;
                    cell.BorderColor = borderColor;
                    tbl.AddCell(cell);

                    var vlasnici = "";
                    foreach (var v in mjesec.vlasnici)
                    {
                        vlasnici += v.imePrezime;
                    }
                    cell = new PdfPCell(new Phrase(vlasnici, cellTableFont));
                    cell.VerticalAlignment = Element.ALIGN_MIDDLE;
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
                    cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                    cell.FixedHeight = 20;
                    cell.BorderColor = borderColor;
                    cell.BackgroundColor = backColorGray;
                    tbl.AddCell(cell);

                    var pdChildren = "";
                    foreach (var pd in mjesec.posDijelovi)
                    {
                        pdChildren += pd.naziv;
                    }
                    cell = new PdfPCell(new Phrase(pdChildren, cellTableFont));
                    cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                    cell.BorderColor = borderColor;
                    cell.BackgroundColor = backColorGray;
                    cell.Colspan = 4;
                    tbl.AddCell(cell);
                    // END OF PosebiDijelovi

                    if (mjesec.displayTotal)
                    {
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

                        if(mjesec.mjesec != mjeseci[mjeseci.Count() - 1])
                        {
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
                }
                doc.Add(tbl);
                doc.Close();
                writer.Close();
                output.Close();
                SessionObj session = new SessionObj { Pdf = output.ToArray(), Naziv = obj.master.Naziv + ".pdf" };
                Session["PdfPosebniDio"] = session;

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
            Response.AddHeader("Content-Disposition", string.Format("attachment;filename=Receipt-{0}.pdf", o.Naziv));
            return File((byte[])o.Pdf, "application/pdf");
        }

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