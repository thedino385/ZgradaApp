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
        private ZgradaDbEntities _db = new ZgradaDbEntities();
        public async Task<ActionResult> Index()
        {
            var userId = User.Identity.GetUserId();
            var user = await _db.KompanijeUseri.FirstOrDefaultAsync(p => p.UserGuid == userId);
            if (user == null)
                RedirectToAction("LogOffExpired", "Account");
            var company = await _db.Kompanije.FirstOrDefaultAsync(p => p.Id == user.CompanyId);
            ViewBag.ImePrezime = String.Join(" ", new[] { user.Ime, user.Prezime });
            ViewBag.Company = company.Naziv;
            ViewBag.MasterAcc = user.MasterAcc;

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
            var uredjaji = await _db.Zgrade_PopisUredjaja.Where(p => p.Notifikacija_dt >= today && p.Notifikacija_dt < tommorow && p.NotifikacijaProcitana != true && p.NotifikacijaText.Length > 0).ToListAsync();
            if (uredjaji.Count > 0)
            {
                List<NotificationList> list = new List<NotificationList>();
                foreach (var item in uredjaji)
                {
                    list.Add(new NotificationList { Datum = ((DateTime)item.Notifikacija_dt).ToShortDateString(), Text = item.NotifikacijaText, Domena = "uredjaji", Id = item.Id, id = "uredjaji" + "_" + item.Id });
                }
                ViewData["notifikacije"] = list;
            }
            ViewData["userType"] = "voditelj";
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

        public async Task<ActionResult> StanarView()
        {
            var userGuid = User.Identity.GetUserId();
            var stanar = await _db.Zgrade_Stanari.FirstOrDefaultAsync(p => p.UserGuid == userGuid);
            var user = await _db.KompanijeUseri.FirstOrDefaultAsync(p => p.Stanarid == stanar.Id);
            var zgrada = await _db.Zgrade.FirstOrDefaultAsync(p => p.Id == stanar.ZgradaId);
            ViewBag.ImePrezime = user.Ime + " " + user.Prezime;
            ViewBag.ZgradaInfo = "Zgrada: " + zgrada.Naziv + ", adresa: " + zgrada.Adresa + ", " + zgrada.Mjesto;

            ViewData["userType"] = "stanar";
            ViewBag.UserId = user.Id;
            ViewBag.ShowBtn = stanar.OglasnaPloca ?? false;
            return View();
        }


        public async Task<ActionResult> GetStanarDashBoardDataOglasna()
        {
            var userGuid = User.Identity.GetUserId();
            var stanar = await _db.Zgrade_Stanari.FirstOrDefaultAsync(p => p.UserGuid == userGuid);
            var zgrada = await _db.Zgrade.FirstOrDefaultAsync(p => p.Id == stanar.ZgradaId);
            //var obj = new StanarHomeModel();
            //var GodineDnevnik = await _db.Zgrade_DnevnikRada.Where(p => p.ZgradaId == zgrada.Id).Select(p => p.Godina).Distinct().ToListAsync();

            //obj.Dnevnik = await _db.Zgrade_DnevnikRada.Where(p => p.ZgradaId == zgrada.Id).ToListAsync();
            var Oglasna = await _db.vOglasnaPloca.Where(p => p.ZgradaId == zgrada.Id).OrderByDescending(p => p.Id).ToListAsync();
            return Json(new { oglasna = Oglasna }, JsonRequestBehavior.AllowGet);
        }

        [ValidateInput(false)]
        public async Task<ActionResult> PredajOglas(Zgrade_OglasnaPloca oglasObj)
        {
            try
            {
                var userGuid = User.Identity.GetUserId();
                var stanar = await _db.Zgrade_Stanari.FirstOrDefaultAsync(p => p.UserGuid == userGuid);
                var user = await _db.KompanijeUseri.FirstOrDefaultAsync(p => p.Stanarid == stanar.Id);
                var zgrada = await _db.Zgrade.FirstOrDefaultAsync(p => p.Id == user.ZgradaId);
                if(oglasObj.Id == 0)
                {
                    oglasObj.UserId = user.Id;
                    oglasObj.Datum = DateTime.Now;
                    oglasObj.ZgradaId = zgrada.Id;
                    _db.Zgrade_OglasnaPloca.Add(oglasObj);
                }
                else
                {
                    _db.Zgrade_OglasnaPloca.Attach(oglasObj);
                    _db.Entry(oglasObj).State = EntityState.Modified;
                }
                
                await _db.SaveChangesAsync();
                return Json(new { success = true, msg = "" });

            }
            catch (Exception ex) { return Json(new { success = false, msg = ex.Message }); }
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

    public class StanarHomeModel
    {
        public List<int> GodineDnevnik { get; set; }
        public List<vOglasnaPloca> Oglasna { get; set; }
        public List<Zgrade_DnevnikRada> Dnevnik { get; set; }
    }
}