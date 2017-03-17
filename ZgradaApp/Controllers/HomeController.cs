using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace ZgradaApp.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        public async Task<ActionResult> Index()
        {
            using (ZgradaDbEntities db = new ZgradaApp.ZgradaDbEntities())
            {
                var userId = User.Identity.GetUserId();
                var user = await db.Korisnici.FirstOrDefaultAsync(p => p.UserGuid == userId);
                var company = await db.Kompanije.FirstOrDefaultAsync(p => p.Id == user.CompanyId);
                ViewBag.ImePrezime = String.Join(" ", new[] { user.Ime, user.Prezime });
                ViewBag.Company = company.Naziv;

                TimeSpan ts = ((DateTime)company.ExpirationDate).Date - DateTime.Today.Date;
                if (ts.Days <= 31)
                {
                    string d = ts.Days.ToString().EndsWith("1") && ts.Days != 11 ? " dan" : " dana";
                    ViewBag.ExpMsg = "Vaš korisnički račun istiće za " + ts.Days.ToString() + d;
                    ViewBag.ExpDays = ts.Days;
                }
                    

                if(company.ExpirationDate > DateTime.Today.AddDays(14))
                {
                    RedirectToAction("LogOffExpired", "Account");
                }
            }
            return View();
        }

        public ActionResult Expired()
        {
            return View();
        }
    }
}