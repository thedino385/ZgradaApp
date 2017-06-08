using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace ZgradaApp.Controllers
{
    [Authorize]
    public class UploadController : Controller
    {
        private ZgradaDbEntities _db = new ZgradaDbEntities();

        [HttpPost]
        public async Task<ActionResult> CompanyLogo()
        {
            var identity = (ClaimsIdentity)User.Identity;
            var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));

            string path = Server.MapPath("~/Content/download/logo");
            if (!System.IO.Directory.Exists(path))
                System.IO.Directory.CreateDirectory(path);

            var company = await _db.Kompanije.FirstOrDefaultAsync(p => p.Id == companyId);
            string logoNaziv = "";
            if (company.Logo != null)
                logoNaziv = company.Logo;
            else
                logoNaziv = Guid.NewGuid().ToString() + ".pdf";


            foreach (var fileKey in Request.Files.AllKeys)
            {
                var file = Request.Files[fileKey];
                try
                {
                    file.SaveAs(Path.Combine(path, logoNaziv));
                    company.Logo = logoNaziv;
                    await _db.SaveChangesAsync();
                    //string ext = Path.GetExtension(file.FileName);
                    //if (ext == ".jpg" || ext == ".jpeg" || ext == ".bmp" || ext == ".png")
                    //    Session["Logo"] = ConvertUploadedFile(file);
                    //else
                    //    Session["Cert"] = ConvertUploadedFile(file);
                }
                catch (Exception ex)
                {
                    return Json(new { Message = "" });
                }
            }
            return Json(new { logoNaziv });
        }

        public byte[] ConvertUploadedFile(HttpPostedFileBase uploadedFile)
        {
            var buf = new byte[uploadedFile.InputStream.Length];
            uploadedFile.InputStream.Read(buf, 0, (int)uploadedFile.InputStream.Length);
            return buf;
        }
    }
}