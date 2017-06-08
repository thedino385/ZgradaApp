using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.IO;
using System.Security.Claims;
using Microsoft.AspNet.Identity;
using System.Threading.Tasks;
using System.Data.Entity;
using iTextSharp.text;
using iTextSharp.text.pdf;

namespace ZgradaApp.Controllers
{
    [Authorize]
    public class PricuvaRezijeUplatniceController : Controller
    {

        private ZgradaDbEntities _db = new ZgradaDbEntities();
        string _physicalPathDir = System.Web.Hosting.HostingEnvironment.MapPath("~/Content/uplatnice");

        string Opis = "Placanje rashodi";
        string Poruka = "text za pozdravnu poruku";
        string Platitelj = "";
        string IBANPrimatelj = "";
        decimal Iznos = 0;
        Kompanije _tvrtka = null;
        Zgrade _zgrada = null;

        public async Task<ActionResult> GenUplatnite(int zgradaId, int godina, int mjesec)
        {

            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
                var zgrada = await _db.Zgrade.FirstOrDefaultAsync(p => p.Id == zgradaId && p.CompanyId == companyId);
                if (zgrada == null)
                    return Json(new { success = false, err = "Not authorized" });


                if (!Directory.Exists(_physicalPathDir))
                    Directory.CreateDirectory(_physicalPathDir);

                //foreach (var master in zgrada.Zgrade_PosebniDijeloviMaster)
                //{
                //    var path = Path.Combine(_physicalPathDir, master.Naziv.Replace(" ", "_").Replace(",", "_"));
                //    if (!Directory.Exists(path))
                //        Directory.CreateDirectory(path);

                //    var pathGod = Path.Combine(path, godina.ToString());
                //}






            }
            catch (Exception ex) { return View(); }



            return View();
        }

        //[HttpPost]
        //public async Task<ActionResult> genRacun([System.Web.Http.FromBody] )
        //{
        //    try
        //    {
        //        var identity = (ClaimsIdentity)User.Identity;
        //        var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));

        //        var company = await _db.Kompanije.FirstOrDefaultAsync(p => p.Id == companyId);

        //        string path = Server.MapPath("~/Content/download/racuni");
        //        if (!System.IO.Directory.Exists(path))
        //            System.IO.Directory.CreateDirectory(path);

        //        var doc = new Document(PageSize.A4, 30, 30, 25, 25);
        //        string pdf = Guid.NewGuid().ToString() + ".pdf";
        //        var output = new FileStream(Path.Combine(path, pdf), FileMode.Create);
        //        var writer = PdfWriter.GetInstance(doc, output);

        //        doc.Open();

        //        var titleFont = FontFactory.GetFont("Arial", 13, Font.BOLD);
        //        var subTitleFont = FontFactory.GetFont("Arial", 12, Font.BOLD);
        //        var boldTableHeaderFont = FontFactory.GetFont("Arial", 8, Font.BOLD);
        //        var boldTableFont = FontFactory.GetFont("Arial", 10, Font.BOLD);
        //        var cellTableFont = FontFactory.GetFont("Arial", 10, Font.NORMAL);
        //        //var endingMessageFont = FontFactory.GetFont("Arial", 10, Font.ITALIC);
        //        //var bodyFont = FontFactory.GetFont("Arial", 12, Font.NORMAL);

        //        PdfPTable tbl = new PdfPTable(2);
        //        tbl.HorizontalAlignment = 0;
        //        tbl.WidthPercentage = 60;
        //        //tbl.SpacingBefore = 10;
        //        //tbl.SpacingAfter = 10;
        //        tbl.DefaultCell.Border = 0;
        //        //tbl.SetWidths(new int[] { 2, 1, 2 });

        //        var logo = iTextSharp.text.Image.GetInstance(Server.MapPath("~/Content/logo/logo.png"));
        //        //logo.SetAbsolutePosition(440, 800);
        //        //document.Add(logo);

        //        PdfPCell cell = new PdfPCell(logo, true);
        //        cell.Rowspan = 5;
        //        cell.BorderColor = BaseColor.WHITE;
        //        cell.HorizontalAlignment = Element.ALIGN_CENTER;
        //        tbl.AddCell(cell);

        //        cell = new PdfPCell(new Phrase(company.Naziv, boldTableFont));
        //        cell.PaddingLeft = 30;
        //        cell.HorizontalAlignment = Element.ALIGN_CENTER;
        //        cell.BorderColor = BaseColor.WHITE;
        //        tbl.AddCell(cell);

        //        cell = new PdfPCell(new Phrase(company.Adresa + ", " + company.Mjesto, cellTableFont));
        //        cell.PaddingLeft = 30;
        //        cell.HorizontalAlignment = Element.ALIGN_CENTER;
        //        cell.BorderColor = BaseColor.WHITE;
        //        tbl.AddCell(cell);

        //        cell = new PdfPCell(new Phrase("OIB: " + company.OIB, cellTableFont));
        //        cell.PaddingLeft = 30;
        //        cell.HorizontalAlignment = Element.ALIGN_CENTER;
        //        cell.BorderColor = BaseColor.WHITE;
        //        tbl.AddCell(cell);

        //        cell = new PdfPCell(new Phrase("tel: " + company.Telefon, cellTableFont));
        //        cell.PaddingLeft = 30;
        //        cell.HorizontalAlignment = Element.ALIGN_CENTER;
        //        cell.BorderColor = BaseColor.WHITE;
        //        tbl.AddCell(cell);

        //        cell = new PdfPCell(new Phrase("www.novoprojekt.net" + company.Telefon, cellTableFont));
        //        cell.PaddingLeft = 30;
        //        cell.HorizontalAlignment = Element.ALIGN_CENTER;
        //        cell.BorderColor = BaseColor.WHITE;
        //        tbl.AddCell(cell);

        //        doc.Close();
        //        writer.Close();
        //        output.Close();
        //        //Response.AddHeader("Content-Disposition", string.Format("attachment;filename=Receipt-{0}.pdf", o.Naziv));
        //        //return File((byte[])o.Pdf, "application/pdf");
        //        return new HttpStatusCodeResult(200, pdf);
        //    }
        //    catch (Exception ex)
        //    {
        //        return new HttpStatusCodeResult(500);
        //    }
        //}
    }

    
}
