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
                var user = await db.KompanijeUseri.FirstOrDefaultAsync(p => p.UserGuid == userId);
                var company = await db.Kompanije.FirstOrDefaultAsync(p => p.Id == user.CompanyId);
                ViewBag.ImePrezime = String.Join(" ", new[] { user.Ime, user.Prezime });
                ViewBag.Company = company.Naziv;

                string expGrace = ((DateTime)company.ExpirationDate).AddDays(14).ToShortDateString();

                TimeSpan ts = ((DateTime)company.ExpirationDate).Date - DateTime.Today.Date;
                if (ts.Days <= 31 && ts.Days > 0)
                {
                    string d = ts.Days.ToString().EndsWith("1") && ts.Days != 11 ? " dan" : " dana";
                    ViewBag.ExpMsg = "Vaš korisnički račun istiće za " + ts.Days.ToString() + d;
                    ViewBag.ExpDays = ts.Days;
                }
                else if (ts.Days < 0)
                {

                    ViewBag.ExpMsg = "Vaš korisnički račun je istekao"; 
                    ViewBag.ExpMsgGrace = "Molimo, podmirite vaš račun do " + expGrace; 
                    ViewBag.ExpDays = ts.Days;
                }

                if (company.ExpirationDate > DateTime.Today.AddDays(14))
                {
                    RedirectToAction("LogOffExpired", "Account");
                }

                // ima li notifikacija za uredjaje?
                var today = DateTime.Today.AddDays(-3);
                var tommorow = today.AddDays(10);
                var uredjaji = await db.Zgrade_PopisUredjaja.Where(p => p.Notifikacija_dt >= today && p.Notifikacija_dt < tommorow && p.NotifikacijaProcitana != true && p.NotifikacijaText.Length > 0).ToListAsync();
                if(uredjaji.Count > 0)
                {
                    List<NotificationList> list = new List<NotificationList>();
                    foreach (var item in uredjaji)
                    {
                        list.Add(new NotificationList { Datum = ((DateTime)item.Notifikacija_dt).ToShortDateString(), Text = item.NotifikacijaText, Domena = "uredjaji", Id = item.Id, id = "uredjaji" + "_" + item.Id });
                    }
                    ViewData["notifikacije"] = list;
                }
            }
            return View();
        }

        public async Task<ActionResult> TurnOffNotification(string domena, int id)
        {
            bool success = false;
            try
            {
                using (ZgradaDbEntities db = new ZgradaApp.ZgradaDbEntities())
                {
                    if (domena == "uredjaji")
                    {
                        var u = await db.Zgrade_PopisUredjaja.FirstOrDefaultAsync(p => p.Id == id);
                        u.NotifikacijaProcitana = true;
                    }

                    await db.SaveChangesAsync();
                    success = true;
                }
            }
            catch (Exception ex)
            {

            }

            return Json(new { success = success });
        }

        public ActionResult Expired()
        {
            return View();
        }
    }

    public class NotificationList
    {
        public string Datum { get; set; }
        public string Text { get; set; }
        public string Domena { get; set; }
        public int Id { get; set; }
        public string id { get; set; }
    }
}