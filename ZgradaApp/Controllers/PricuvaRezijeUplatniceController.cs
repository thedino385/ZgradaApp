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

namespace ZgradaApp.Controllers
{
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
    }
}