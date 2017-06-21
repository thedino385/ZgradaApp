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

            string path = Server.MapPath("~/Content/download/racuni");
            if (!System.IO.Directory.Exists(path))
                System.IO.Directory.CreateDirectory(path);

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
            var user = await _db.KompanijeUseri.FirstOrDefaultAsync(p => p.UserGuid == userGuid);
            var stanar = await _db.Zgrade_Stanari.FirstOrDefaultAsync(p => p.Id == user.Stanarid);
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
            var user = await _db.KompanijeUseri.FirstOrDefaultAsync(p => p.UserGuid == userGuid);
            var stanar = await _db.Zgrade_Stanari.FirstOrDefaultAsync(p => p.Id == user.Stanarid);
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
                var user = await _db.KompanijeUseri.FirstOrDefaultAsync(p => p.UserGuid == userGuid);
                var stanar = await _db.Zgrade_Stanari.FirstOrDefaultAsync(p => p.Id == user.Stanarid);
                var zgrada = await _db.Zgrade.FirstOrDefaultAsync(p => p.Id == stanar.ZgradaId);
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
            var user = await _db.KompanijeUseri.FirstOrDefaultAsync(p => p.UserGuid == userGuid);
            var stanar = await _db.Zgrade_Stanari.FirstOrDefaultAsync(p => p.Id == user.Stanarid);
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
                var user = await _db.KompanijeUseri.FirstOrDefaultAsync(p => p.UserGuid == userGuid);
                var stanar = await _db.Zgrade_Stanari.FirstOrDefaultAsync(p => p.Id == user.Stanarid);
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
                var user = await _db.KompanijeUseri.FirstOrDefaultAsync(p => p.UserGuid == userGuid);
                var stanar = await _db.Zgrade_Stanari.FirstOrDefaultAsync(p => p.Id == user.Stanarid);

                var zgrada = await _db.Zgrade.FirstOrDefaultAsync(p => p.Id == stanar.ZgradaId);
                var company = await _db.Kompanije.FirstOrDefaultAsync(p => p.Id == zgrada.CompanyId);

                // rashodi
                var prGod = await _db.PricuvaRezijeGodina.Where(p => p.ZgradaId == zgrada.Id).ToListAsync();
                var posebniDijeloviZgrada = await _db.Zgrade_PosebniDijeloviMaster.Where(p => p.ZgradaId == zgrada.Id).ToListAsync();
                //var prihodiRashodiMaster = await _db.PrihodiRashodi.Where(p => p.ZgradaId == zgrada.Id).ToListAsync();
                List<Uplatnice_Godina> listGodine = new List<Uplatnice_Godina>();
                foreach (var god in prGod.OrderByDescending(p => p.Id))
                {
                    
                   
                    //row.Uplatnice_Mjesec = new List<Uplatnice_Mjesec>();
                    foreach (var mj in god.PricuvaRezijeMjesec)
                    {
                        // mjesec, stan
                        //var pdNaziv = zgrada.Zgrade_PosebniDijeloviMaster.FirstOrDefault(p => p.Id == mj.po)
                        var m = mj.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PricuvaRezijeMjesecId == mj.Id);
                        var pdNaziv = zgrada.Zgrade_PosebniDijeloviMaster.FirstOrDefault(p => p.Id == m.PosebniDioMasterId).Naziv;

                        //rowMjesec.Uplatnice_Mjesec_Data = new List<Uplatnice_Mjesec_Data>();

                        var mVlasniciPeriod = m.PricuvaRezijePosebniDioMasterVlasnici.Where(p => p.PeriodId == m.PeriodId);
                        var check = mVlasniciPeriod.FirstOrDefault(p => p.VlasnikId == stanar.Id);
                        if (check != null)
                        {
                            // ok, stanar je u periodu, moze dalje
                            // imePrezime, vrstaDUga (rezije/pricuva) url
                            foreach (var uplata in mj.PricuvaRezijeMjesec_Uplatnice)
                            {
                                var ime = zgrada.Zgrade_Stanari.FirstOrDefault(p => p.Id == uplata.PlatiteljId);
                                if (ime != null)
                                {
                                    var row = new Uplatnice_Godina();
                                    row.Godina = god.Godina;
                                    row.Mjesec = (int)mj.Mjesec;
                                    row.PosebniDioNaziv = pdNaziv;
                                    row.ImePrezime = ime.Ime + " " + ime.Prezime;
                                    row.TipZaduzenja = (uplata.TipDuga == "r" ? "Režije" : "Pričuva");
                                    row.Url = "/Content/download/racuniUplatnice/" + company.Id + "/" + god.Godina + "/" + mj.Mjesec + "/" + uplata.PdfUrl;
                                    //var rowMjesec = new Uplatnice_Mjesec
                                    //{
                                    //    Mjesec = (int)mj.Mjesec,
                                    //    PosebniDioNaziv = pdNaziv,
                                    //    ImePrezime = ime.Ime + " " + ime.Prezime,
                                    //    TipZaduzenja = (uplata.TipDuga == "r" ? "Režije" : "Pričuva"),
                                    //    Url = "/Content/download/racuniUplatnice/" + company.Id + "/" + god.Godina + "/" + mj.Mjesec + "/" + uplata.PdfUrl
                                    //};
                                    listGodine.Add(row);
                                    //row.Uplatnice_Mjesec.Add(rowMjesec);
                                }
                            }
                        }
                    }
                    
                }
                ViewData["userType"] = "stanar";
                return Json(new { success = true, list = listGodine, msg = "" });
                //return View(list);
            }
            catch (Exception ex)
            {
                return Json(new { success = false, list = new List<Uplatnice_Godina>(), msg = ex.Message });
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

    public class Uplatnice_Godina
    {
        public int Godina { get; set; }
        public int Mjesec { get; set; }
        //public int PosebniDioMasterId { get; set; }
        public string PosebniDioNaziv { get; set; }
        public string ImePrezime { get; set; }
        public string TipZaduzenja { get; set; }
        public string Url { get; set; }
    }

   

    //public class Uplatnice_Mjesec_Data
    //{
    //    public string ImePrezime { get; set; }
    //    public string TipZaduzenja { get; set; }
    //    public string Url { get; set; }
    //}
    //public class UplatnicaMaster
    //{
    //    public int PosebniDioId { get; set; }
    //    public string PosebniDio { get; set; }
    //    public string Url { get; set; }
    //}
}
