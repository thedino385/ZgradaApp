using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace ZgradaApp.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        private ZgradaDbEntities _db = new ZgradaDbEntities();
        [Authorize(Roles = "Voditelj")]
        public async Task<ActionResult> Index()
        {
            var userId = User.Identity.GetUserId();
            var user = await _db.KompanijeUseri.FirstOrDefaultAsync(p => p.UserGuid == userId);
            if (user.Stanarid != null)
            {
                ViewData["userType"] = "stanar";
                return RedirectToAction("StanarView", "Home");
            }

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
            var identity = (ClaimsIdentity)User.Identity;
            var userGuid = identity.GetUserId();
            var stanar = await _db.Zgrade_Stanari.FirstOrDefaultAsync(p => p.UserGuid == userGuid);
            var user = await _db.KompanijeUseri.FirstOrDefaultAsync(p => p.Stanarid == stanar.Id);
            var zgrada = await _db.Zgrade.FirstOrDefaultAsync(p => p.Id == stanar.ZgradaId);
            ViewBag.ImePrezime = user.Ime + " " + user.Prezime;
            ViewBag.ZgradaInfo = "Zgrada: " + zgrada.Naziv + ", adresa: " + zgrada.Adresa + ", " + zgrada.Mjesto;

            ViewData["userType"] = "stanar";
            ViewBag.UserId = user.Id;
            ViewBag.DnevnikRada = stanar.DnevnikRada ?? false;
            ViewBag.ShowBtn = stanar.OglasnaPloca ?? false;
            return View();
        }


        public async Task<ActionResult> GetStanarDashBoardDataOglasna()
        {
            var identity = (ClaimsIdentity)User.Identity;
            var userGuid = identity.GetUserId();
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
                var identity = (ClaimsIdentity)User.Identity;
                var userGuid = identity.GetUserId();
                var stanar = await _db.Zgrade_Stanari.FirstOrDefaultAsync(p => p.UserGuid == userGuid);
                var user = await _db.KompanijeUseri.FirstOrDefaultAsync(p => p.Stanarid == stanar.Id);
                var zgrada = await _db.Zgrade.FirstOrDefaultAsync(p => p.Id == user.ZgradaId);
                if (oglasObj.Id == 0)
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

        public async Task<ActionResult> GetStanarDashBoardDataDnevnik()
        {
            var identity = (ClaimsIdentity)User.Identity;
            var userGuid = identity.GetUserId();
            var stanar = await _db.Zgrade_Stanari.FirstOrDefaultAsync(p => p.UserGuid == userGuid);
            var zgrada = await _db.Zgrade.FirstOrDefaultAsync(p => p.Id == stanar.ZgradaId);
            //var obj = new StanarHomeModel();
            var GodineDnevnik = await _db.Zgrade_DnevnikRada.Where(p => p.ZgradaId == zgrada.Id).Select(p => p.Godina).Distinct().ToListAsync();

            var Dnevnik = await _db.vDnevnikRada.Where(p => p.ZgradaId == zgrada.Id).ToListAsync();
            //var DnevnikDetails = await _db.vDnevnikRadaDetails.Where(p => p.ZgradaId == zgrada.Id).ToListAsync();

            var listDetails = new List<vDnevnikRadaDetails>();
            foreach (var d in Dnevnik)
            {
                var det = _db.vDnevnikRadaDetails.FirstOrDefault(p => p.DnevnikRadaId == d.Id);
                if (det != null)
                    listDetails.Add(det);
            }
            return Json(new { godine = GodineDnevnik, dnevnik = Dnevnik, dnevnikDetails = listDetails }, JsonRequestBehavior.AllowGet);
        }

        public async Task<ActionResult> NovaPorukaDnevnik(Zgrade_DnevnikRadaDetails poruka)
        {
            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                var userGuid = identity.GetUserId();
                var stanar = await _db.Zgrade_Stanari.FirstOrDefaultAsync(p => p.UserGuid == userGuid);
                var user = await _db.KompanijeUseri.FirstOrDefaultAsync(p => p.Stanarid == stanar.Id);
                poruka.UserId = user.Id;

                _db.Zgrade_DnevnikRadaDetails.Add(poruka);
                await _db.SaveChangesAsync();
                return Json(new { success = true, msg = "" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, msg = ex.Message });
            }
        }

        public ActionResult Uplatnice()
        {
            return View();
        }

        public async Task<ActionResult> GetUplatnice()
        {
            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                var userGuid = identity.GetUserId();
                var stanar = await _db.Zgrade_Stanari.FirstOrDefaultAsync(p => p.UserGuid == userGuid);
                var user = await _db.KompanijeUseri.FirstOrDefaultAsync(p => p.Stanarid == stanar.Id);
                var zgrada = await _db.Zgrade.FirstOrDefaultAsync(p => p.Id == stanar.ZgradaId);

                // rashodi
                var obracuni = await _db.PricuvaRezijeGodina.Where(p => p.ZgradaId == zgrada.Id).ToListAsync();
                var posebniDijeloviZgrada = await _db.Zgrade_PosebniDijeloviMaster.Where(p => p.ZgradaId == zgrada.Id).ToListAsync();
                var prihodiRashodiMaster = await _db.PrihodiRashodi.Where(p => p.ZgradaId == zgrada.Id).ToListAsync();
                List<Uplatnice> list = new List<Uplatnice>();
                foreach (var obrGod in obracuni)
                {
                    for (int i = 1; i <= 12; i++)
                    {
                        var up = new Uplatnice();
                        up.Godina = obrGod.Godina;
                        up.Mjesec = i;
                        var obrMjesec = obrGod.PricuvaRezijeMjesec.FirstOrDefault(p => p.Mjesec == i);
                        if (obrMjesec != null)
                        {
                            var masteri = obrMjesec.PricuvaRezijePosebniDioMasteri.Where(p => p.PricuvaRezijeMjesecId == obrMjesec.Id);
                            List<UplatnicaMaster> UplatnicaMaster = new List<UplatnicaMaster>();
                            foreach (var master in masteri)
                            {
                                if (master.PricuvaRezijePosebniDioMasterVlasnici.FirstOrDefault(p => p.VlasnikId == stanar.Id) != null)
                                {
                                    // ok stanar je u master.PosebniDioMasterId
                                    var pdNaziv = posebniDijeloviZgrada.FirstOrDefault(p => p.Id == master.PosebniDioMasterId).Naziv;
                                    var prihodiRashodiZaGodinu = prihodiRashodiMaster.FirstOrDefault(p => p.Godina == obrGod.Godina);
                                    var pdMasterRashod = prihodiRashodiZaGodinu.PrihodiRashodi_Rashodi.FirstOrDefault(p => p.Mjesec == i && p.PosebniDioMasterId == master.PosebniDioMasterId);

                                    UplatnicaMaster.Add(new UplatnicaMaster
                                    {
                                        PosebniDioId = (int)master.PosebniDioMasterId,
                                        PosebniDio = pdNaziv,
                                        Url = pdMasterRashod != null ? GetBaseUrl() + "/Content/download/" + pdMasterRashod.PdfFileName : ""
                                    });

                                }
                            }
                            up.UplatnicePosebniDijeloviMaster = UplatnicaMaster;

                        }
                        list.Add(up);
                    }
                    
                }
                ViewData["userType"] = "stanar";
                return Json(new { success = true, list = list, msg = "" });
                //return View(list);
            }
            catch (Exception ex)
            {
                return Json(new { success = false, list = new List<Uplatnice>(), msg = ex.Message });
                //return View(new List<Uplatnice>());
            }
        }

        public string GetBaseUrl()
        {
            var appUrl = HttpRuntime.AppDomainAppVirtualPath;

            if (appUrl != "/")
                appUrl = "/" + appUrl;

            var baseUrl = string.Format("{0}://{1}{2}", Request.Url.Scheme, Request.Url.Authority, appUrl);

            return baseUrl;
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

    public class Uplatnice
    {
        public int Godina { get; set; }
        public int Mjesec { get; set; }
        public List<UplatnicaMaster> UplatnicePosebniDijeloviMaster { get; set; }
    }

    public class UplatnicaMaster
    {
        public int PosebniDioId { get; set; }
        public string PosebniDio { get; set; }
        public string Url { get; set; }
    }
}
