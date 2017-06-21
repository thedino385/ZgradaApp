using iTextSharp.text;
using iTextSharp.text.pdf;
using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web.Http;

namespace ZgradaApp.Controllers
{
    [Authorize(Roles = "Voditelj")]
    public class DataController : ApiController
    {
        private readonly ZgradaDbEntities _db = new ZgradaDbEntities();

        [HttpGet]
        [Route("api/data/getzgrade")]
        public async Task<IHttpActionResult> GetZgrade()
        {
            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
                var zgrade = await _db.vZgrade.Where(p => p.CompanyId == companyId).ToListAsync();
                return Ok(zgrade);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }


        [HttpGet]
        [Route("api/data/getzgrada")]
        public async Task<IHttpActionResult> GetZgrada(int Id, bool prenesiRashodeuTekuciMjesec = false, bool prenesiDnevnikuTekuciMjesec = false)
        {
            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));

                if (prenesiRashodeuTekuciMjesec)
                    // prenesi iz proslog mjeseca u tekuci
                    await new RashodiPrebaciNeplacene(_db, DateTime.Today.Month).Prebaci();

                if (prenesiDnevnikuTekuciMjesec)
                    await new PrebaciOtvoreneStavkeDnevnika().Prebaci(_db, Id);

                var zgrada = await _db.Zgrade.FirstOrDefaultAsync(p => p.Id == Id && p.CompanyId == companyId);
                // useri 
                //var useri = await _db.KompanijeUseri.Where(p => p.CompanyId == companyId).ToListAsync();
                var useri = await _db.vUseriSvi.Where(p => p.CompanyId == companyId).ToListAsync();
                return Ok(new ZgradaUseri { Zgrada = zgrada, Useri = useri, userId = useri.FirstOrDefault(p => p.UserGuid == identity.GetUserId()).Id });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }



        [HttpPost]
        [Route("api/data/zgradaCreateOrUpdate")]
        public async Task<IHttpActionResult> ZgradaCreateOrUpdate(Zgrade zgrada)
        {
            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
                if (zgrada.Id == 0)
                {
                    zgrada.CompanyId = companyId;
                    _db.Zgrade.Add(zgrada);
                }
                else
                {
                    var target = await _db.Zgrade.FirstOrDefaultAsync(p => p.Id == zgrada.Id);
                    target.Mjesto = zgrada.Mjesto;
                    target.Adresa = zgrada.Adresa;
                    target.CompanyId = companyId;
                    target.Napomena = zgrada.Napomena;
                    target.Naziv = zgrada.Naziv;
                    target.IBAN = zgrada.IBAN;
                    foreach (var item in zgrada.Zgrade_Stanari)
                    {
                        switch (item.Status)
                        {
                            case "a":
                                _db.Zgrade_Stanari.Add(item);
                                break;
                            case "u":
                                _db.Zgrade_Stanari.Attach(item);
                                _db.Entry(item).State = EntityState.Modified;
                                break;
                        }

                    }

                    // ovo se snima iz posebnih dijelova
                    //foreach (var item in zgrada.Zgrade_PosebniDijeloviMaster)
                    //{
                    //    switch (item.Status)
                    //    {
                    //        case "a":
                    //            _db.Zgrade_PosebniDijeloviMaster.Add(item);
                    //            break;
                    //        case "u":
                    //            _db.Zgrade_PosebniDijeloviMaster.Attach(item);
                    //            _db.Entry(item).State = EntityState.Modified;
                    //            break;
                    //    }
                    //}
                }
                await _db.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return InternalServerError();
            }
        }

        [HttpPost]
        [Route("api/data/posebniDioChildrenCreateOrUpdate")]
        public async Task<IHttpActionResult> PosebniDioMasterCreateOrUpdate(Zgrade_PosebniDijeloviMaster master)
        {
            // masterPosebniDio se u biti ne snima, on sadrzi povrsine i pripadke
            try
            {
                if (master.Id == 0)
                    _db.Zgrade_PosebniDijeloviMaster.Add(master);
                else
                {
                    var dbMater = await _db.Zgrade_PosebniDijeloviMaster.FirstOrDefaultAsync(p => p.Id == master.Id);
                    dbMater.OpisRacun = master.OpisRacun;
                    dbMater.Naziv = master.Naziv;
                    dbMater.Broj = master.Broj;
                    dbMater.Napomena = master.Napomena;
                    dbMater.VrijediOdGodina = master.VrijediOdGodina;
                    dbMater.VrijediOdMjesec = master.VrijediOdMjesec;
                    foreach (var povrsina in master.Zgrade_PosebniDijeloviMaster_Povrsine)
                    {
                        povrsina.PosebniDioMasterId = master.Id;
                        switch (povrsina.Status)
                        {
                            case "a":
                                _db.Zgrade_PosebniDijeloviMaster_Povrsine.Add(povrsina);
                                break;
                            case "u":
                                _db.Zgrade_PosebniDijeloviMaster_Povrsine.Attach(povrsina);
                                _db.Entry(povrsina).State = EntityState.Modified;
                                break;
                        }
                    }
                    // pripadci - child posebnogDijelaChilda
                    foreach (var prip in master.Zgrade_PosebniDijeloviMaster_Pripadci)
                    {
                        prip.ZgradaPosDioMasterId = master.Id;
                        switch (prip.Status)
                        {
                            case "a":
                                _db.Zgrade_PosebniDijeloviMaster_Pripadci.Add(prip);
                                break;
                            case "u":
                                _db.Zgrade_PosebniDijeloviMaster_Pripadci.Attach(prip);
                                _db.Entry(prip).State = EntityState.Modified;
                                break;
                        }
                    }
                    foreach (var period in master.Zgrade_PosebniDijeloviMaster_VlasniciPeriod)
                    {
                        switch (period.Status)
                        {
                            case "a":
                                _db.Zgrade_PosebniDijeloviMaster_VlasniciPeriod.Add(period);
                                break;
                            case "u":
                                var target = await _db.Zgrade_PosebniDijeloviMaster_VlasniciPeriod.FirstOrDefaultAsync(p => p.Id == period.Id);
                                target.Zatvoren = period.Zatvoren;
                                target.Napomena = period.Napomena;
                                target.VrijediDoGodina = period.VrijediDoGodina;
                                target.VrijediDoMjesec = period.VrijediDoMjesec;
                                target.VrijediOdGodina = period.VrijediOdGodina;
                                target.VrijediOdMjesec = period.VrijediOdMjesec;
                                foreach (var vlasnik in period.Zgrade_PosebniDijeloviMaster_VlasniciPeriod_Vlasnici)
                                {
                                    vlasnik.VlasniciPeriodId = period.Id;
                                    if (vlasnik.Status == "a")
                                        _db.Zgrade_PosebniDijeloviMaster_VlasniciPeriod_Vlasnici.Add(vlasnik);
                                    else
                                    {
                                        _db.Zgrade_PosebniDijeloviMaster_VlasniciPeriod_Vlasnici.Attach(vlasnik);
                                        _db.Entry(vlasnik).State = EntityState.Modified;
                                    }
                                }
                                break;
                        }
                    }
                }
                await _db.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex) { return InternalServerError(); }
        }

        [HttpGet]
        [Route("api/data/getSifarnikRashoda")]
        public async Task<IHttpActionResult> GetSifarnikRashoda()
        {
            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
                return Ok(await _db.SifarnikRashoda.Where(p => p.CompanyId == companyId && p.Active != false).ToListAsync());
            }
            catch (Exception ex) { return InternalServerError(); }
        }

        [HttpPost]
        [Route("api/data/sifarnikRashodaCrateOrUpdate")]
        public async Task<IHttpActionResult> SifarnikRashodaCrateOrUpdate(List<SifarnikRashoda> list)
        {
            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
                foreach (var item in list)
                {
                    item.CompanyId = companyId;
                    switch (item.Status)
                    {
                        case "a":
                            _db.SifarnikRashoda.Add(item);
                            break;
                        case "u":
                            _db.SifarnikRashoda.Attach(item);
                            _db.Entry(item).State = EntityState.Modified;
                            break;
                        case "d":
                            var target = await _db.SifarnikRashoda.FirstOrDefaultAsync(p => p.Id == item.Id);
                            target.Active = false;
                            break;
                    }
                }
                await _db.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex) { return InternalServerError(); }
        }

        [HttpPost]
        [Route("api/data/prihodiRashodiCreateOrUpdate")]
        public async Task<IHttpActionResult> PrihodiRashodiCreateOrUpdate(Zgrade zgradaObj)
        {
            try
            {
                // zanima nas master - ako je status 'a', insert, inace ne diraj
                // PrihodiRashodi_Prihodi
                // PrihodiRashodi_Rashodi

                foreach (var prihodRashod in zgradaObj.PrihodiRashodi)
                {
                    prihodRashod.ZgradaId = zgradaObj.Id;
                    if (prihodRashod.Status == "a")
                    {
                        _db.PrihodiRashodi.Add(prihodRashod);
                    }
                    else
                    {
                        foreach (var pr in prihodRashod.PrihodiRashodi_Prihodi)
                        {
                            pr.PrihodiRashodiGodId = prihodRashod.Id;
                            if (pr.Status == "a")
                                _db.PrihodiRashodi_Prihodi.Add(pr);
                            else if (pr.Status == "d")
                            {
                                var target = await _db.PrihodiRashodi_Prihodi.FirstOrDefaultAsync(p => p.Id == pr.Id);
                                if (target != null)
                                    _db.PrihodiRashodi_Prihodi.Remove(target);
                            }
                            else
                            {
                                // Status = 'u'
                                _db.PrihodiRashodi_Prihodi.Attach(pr);
                                _db.Entry(pr).State = EntityState.Modified;
                            }
                        }
                        foreach (var ra in prihodRashod.PrihodiRashodi_Rashodi)
                        {
                            ra.PrihodiRashodiGodId = prihodRashod.Id;
                            if (ra.Status == "a")
                                _db.PrihodiRashodi_Rashodi.Add(ra);
                            else if (ra.Status == "d")
                            {
                                var target = await _db.PrihodiRashodi_Rashodi.FirstOrDefaultAsync(p => p.Id == ra.Id);
                                if (target != null)
                                    _db.PrihodiRashodi_Rashodi.Remove(target);
                            }
                            else
                            {
                                // Status = 'u'
                                _db.PrihodiRashodi_Rashodi.Attach(ra);
                                _db.Entry(ra).State = EntityState.Modified;
                            }
                        }
                    }
                }
                await _db.SaveChangesAsync();
                return Ok(zgradaObj);
            }
            catch (Exception ex) { return InternalServerError(); }
        }


        //[HttpGet]
        //[Route("api/data/prebaciNeplaceniRashod")]
        //public async Task<IHttpActionResult> PrebaciNeplaceniRashod(int mjesecZaKojiSeRadiObracun, int godina)
        //{
        //        if (await new RashodiPrebaciNeplacene(_db, mjesecZaKojiSeRadiObracun, godina).Prebaci())
        //            return Ok();
        //        else
        //            return InternalServerError();
        //}

        [HttpGet]
        [Route("api/data/praznaPricuvaRezijeCreate")]
        public async Task<IHttpActionResult> PraznaPricuvaRezijeCreate(int zgradaId, int godina)
        {
            return Ok(new PricuvaRezijeGodina { ZgradaId = zgradaId, Godina = godina, Status = "a", PricuvaRezijeGodina_StanjeOd = new List<PricuvaRezijeGodina_StanjeOd>() });
        }

        [HttpGet]
        [Route("api/data/pricuvaZaMjesecCreate")]
        public async Task<IHttpActionResult> pricuvaZaMjesecCreate(int zgradaId, int prGodId, int mjesec, int godina)
        {
            var prMj = new PricuvaRezijeMjesec { Id = 0, PrivuvaRezijeGodId = prGodId, Mjesec = mjesec };
            try
            {
                var prGodineSve = await _db.PricuvaRezijeGodina.Where(p => p.ZgradaId == zgradaId).ToListAsync();
                return Ok(await new IsValidHelper().CreatePricuvaMjesec(prMj, godina, zgradaId, prGodineSve));
            }
            catch (Exception ex) { return InternalServerError(); }

        }



        [HttpPost]
        [Route("api/data/pricuvaRezijeDeleteAndCreate")]
        public async Task<IHttpActionResult> PricuvaRezijeDeletee(int zgradaId, int mjesec, int godina)
        {
            var prMj = new PricuvaRezijeMjesec { Id = 0, Mjesec = mjesec };
            try
            {
                var targetGodina = await _db.PricuvaRezijeGodina.FirstOrDefaultAsync(p => p.ZgradaId == zgradaId && p.Godina == godina);
                var targetMjesec = targetGodina.PricuvaRezijeMjesec.FirstOrDefault(p => p.Mjesec == mjesec);
                var childLIst = new List<int>();
                var mLIst = new List<int>();
                // masters
                foreach (var m in targetMjesec.PricuvaRezijePosebniDioMasteri.ToList())
                {
                    mLIst.Add((int)m.PosebniDioMasterId);

                    // povrsine
                    foreach (var povr in m.PricuvaRezijePosebniDioMasterPovrsine.ToList())
                    {
                        _db.PricuvaRezijePosebniDioMasterPovrsine.Attach(povr);
                        _db.Entry(povr).State = EntityState.Deleted;
                    }
                    foreach (var prip in m.PricuvaRezijePosebniDioMasterPripadci.ToList())
                    {
                        _db.PricuvaRezijePosebniDioMasterPripadci.Attach(prip);
                        _db.Entry(prip).State = EntityState.Deleted;
                    }
                    foreach (var vlasnik in m.PricuvaRezijePosebniDioMasterVlasnici.ToList())
                    {
                        //var dbVlasnik = await _db.PricuvaRezijePosebniDioMasterVlasnici.FirstOrDefaultAsync(p => p.Id == vlasnik.Id);
                        //_db.PricuvaRezijePosebniDioMasterVlasnici.Remove(dbVlasnik);
                        _db.PricuvaRezijePosebniDioMasterVlasnici.Attach(vlasnik);
                        _db.Entry(vlasnik).State = EntityState.Deleted;
                    }
                }
                foreach (var m in mLIst)
                {
                    var targetMaster = await _db.PricuvaRezijePosebniDioMasteri.FirstOrDefaultAsync(p => p.PosebniDioMasterId == m);
                    _db.PricuvaRezijePosebniDioMasteri.Remove(targetMaster);
                }
                _db.PricuvaRezijeMjesec.Remove(targetMjesec);

                await _db.SaveChangesAsync();
                var prGodineSve = await _db.PricuvaRezijeGodina.Where(p => p.ZgradaId == zgradaId).ToListAsync();
                return Ok(await new IsValidHelper().CreatePricuvaMjesec(prMj, godina, zgradaId, prGodineSve)); ;
            }
            catch (Exception ex)
            {
                return InternalServerError();
            }
        }

        [HttpPost]
        [Route("api/data/pricuvaRezijeCreateOrUpdate")]
        public async Task<IHttpActionResult> PricuvaRezijeCreateOrUpdate(Zgrade zgrada)
        {
            try
            {
                foreach (var prGod in zgrada.PricuvaRezijeGodina)
                {
                    prGod.ZgradaId = zgrada.Id;
                    if (prGod.Id == 0)
                    {
                        _db.PricuvaRezijeGodina.Add(prGod);
                        _db.PrihodiRashodi.Add(new PrihodiRashodi { Godina = prGod.Godina, ZgradaId = zgrada.Id });
                    }
                    else
                    {
                        // brisanja nema, znaci samo update moze
                        var target = await _db.PricuvaRezijeGodina.FirstOrDefaultAsync(p => p.Id == prGod.Id);

                        //foreach (var stanje in prGod.PricuvaRezijeGodina_StanjeOd)
                        //{
                        //    _db.PricuvaRezijeGodina_StanjeOd.Attach(stanje);
                        //    _db.Entry(stanje).State = EntityState.Modified;
                        //}

                        foreach (var prMj in prGod.PricuvaRezijeMjesec)
                        {
                            prMj.PrivuvaRezijeGodId = prGod.Id;
                            if (prMj.Status == "a")
                            {
                                _db.PricuvaRezijeMjesec.Add(prMj);
                            }
                            else
                            {
                                // brisanja nema, dakle status je 'u'
                                foreach (var master in prMj.PricuvaRezijePosebniDioMasteri)
                                {
                                    _db.PricuvaRezijePosebniDioMasteri.Attach(master);
                                    _db.Entry(master).State = EntityState.Modified;

                                    foreach (var vlasnik in master.PricuvaRezijePosebniDioMasterVlasnici)
                                    {
                                        _db.PricuvaRezijePosebniDioMasterVlasnici.Attach(vlasnik);
                                        _db.Entry(vlasnik).State = EntityState.Modified;
                                    }
                                    foreach (var povrsina in master.PricuvaRezijePosebniDioMasterPovrsine)
                                    {
                                        _db.PricuvaRezijePosebniDioMasterPovrsine.Attach(povrsina);
                                        _db.Entry(povrsina).State = EntityState.Modified;
                                    }
                                    foreach (var prip in master.PricuvaRezijePosebniDioMasterPripadci)
                                    {
                                        _db.PricuvaRezijePosebniDioMasterPripadci.Attach(prip);
                                        _db.Entry(prip).State = EntityState.Modified;
                                    }
                                }
                                _db.PricuvaRezijeMjesec.Attach(prMj);
                                _db.Entry(prMj).State = EntityState.Modified;
                            }
                        }
                    }
                }
                await _db.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex) { return InternalServerError(); }
        }

        [HttpPost]
        [Route("api/data/pricuvaRezijeStanjeOdCreateOrUpdate")]
        public async Task<IHttpActionResult> pricuvaRezijeStanjeOdCreateOrUpdate(List<PricuvaRezijeGodina_StanjeOd> stanjeOdList)
        {
            try
            {
                foreach (var item in stanjeOdList)
                {
                    if (item.Id == 0)
                        _db.PricuvaRezijeGodina_StanjeOd.Add(item);
                    else
                    {
                        _db.PricuvaRezijeGodina_StanjeOd.Attach(item);
                        _db.Entry(item).State = EntityState.Modified;
                    }
                }
                await _db.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return InternalServerError();
            }
        }

        [HttpGet]
        [Route("api/data/getPricuvaRezijeGodinaTable")]
        public async Task<IHttpActionResult> GetPricuvaRezijeGodinaTable(int zgradaId, int godina)
        {
            try
            {
                var prGodina = await _db.PricuvaRezijeGodina.FirstOrDefaultAsync(p => p.ZgradaId == zgradaId && p.Godina == godina);
                //var prProslaGodina = await _db.PricuvaRezijeGodina.FirstOrDefaultAsync(p => p.ZgradaId == zgradaId && p.Godina == godina-1);
                var masteri = await _db.Zgrade_PosebniDijeloviMaster.Where(p => p.ZgradaId == zgradaId).ToListAsync();
                var stanari = await _db.Zgrade_Stanari.Where(p => p.ZgradaId == zgradaId).ToListAsync();
                var masteriIds = masteri.Select(p => p.Id);
                var prihodiRashodi = await _db.PrihodiRashodi.FirstOrDefaultAsync(p => p.ZgradaId == zgradaId && p.Godina == godina);
                // var pdChildovi = await _db.Zgrade_PosebniDijeloviChild.Where(p => masteriIds.Contains(p.ZgradaPosDioMasterId)).ToListAsync();
                var prihodi = new List<PrihodiRashodi_Prihodi>();
                if (prihodiRashodi != null)
                    prihodi = prihodiRashodi.PrihodiRashodi_Prihodi.ToList();

                //return Ok(new PricuvaRezijeGodinaTable().getPricuvaRezijeGodinaTable(prGodina, masteri, stanari, pdChildovi, prProslaGodina));
                return Ok(new PricuvaRezijeGodinaTable().getPricuvaRezijeGodinaTable(prGodina, masteri, stanari, prihodi));
            }
            catch (Exception ex) { return InternalServerError(); }
        }

        [HttpPost]
        [Route("api/data/zajednickiDijeloviCreateOrUpdate")]
        public async Task<IHttpActionResult> ZajednickiDijeloviCreateOrUpdate(Zgrade zgradaObj)
        {
            try
            {
                foreach (var item in zgradaObj.Zgrade_PopisZajednickihDijelova)
                {
                    switch (item.Status)
                    {
                        case "a":
                            _db.Zgrade_PopisZajednickihDijelova.Add(item);
                            break;
                        case "u":
                            _db.Zgrade_PopisZajednickihDijelova.Attach(item);
                            _db.Entry(item).State = EntityState.Modified;
                            break;
                    }
                }

                await _db.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex) { return InternalServerError(); }
        }


        [HttpPost]
        [Route("api/data/zajednickiUredjajiCreateOrUpdate")]
        public async Task<IHttpActionResult> ZajednickiUredjajiCreateOrUpdate(Zgrade zgradaObj)
        {
            try
            {
                foreach (var item in zgradaObj.Zgrade_PopisUredjaja)
                {
                    switch (item.Status)
                    {
                        case "a":
                            _db.Zgrade_PopisUredjaja.Add(item);
                            break;
                        case "u":
                            _db.Zgrade_PopisUredjaja.Attach(item);
                            _db.Entry(item).State = EntityState.Modified;
                            break;
                    }
                }

                await _db.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex) { return InternalServerError(); }
        }

        [HttpPost]
        [Route("api/data/dnevnikRadaCreateOrUpdate")]
        public async Task<IHttpActionResult> DnevnikRadaCreateOrUpdate(Zgrade_DnevnikRada dnevnik)
        {
            try
            {
                if (dnevnik.Id == 0)
                    _db.Zgrade_DnevnikRada.Add(dnevnik);
                else
                {
                    var target = await _db.Zgrade_DnevnikRada.FirstOrDefaultAsync(p => p.Id == dnevnik.Id);
                    target.Datum = dnevnik.Datum;
                    target.Godina = dnevnik.Datum.Year;
                    target.Mjesec = dnevnik.Datum.Month;
                    target.Naslov = dnevnik.Naslov;
                    target.Odradjeno = dnevnik.Odradjeno;
                    target.Opis = dnevnik.Opis;

                    foreach (var item in dnevnik.Zgrade_DnevnikRadaDetails)
                    {
                        switch (item.Status)
                        {
                            case "a":
                                target.Zgrade_DnevnikRadaDetails.Add(item);
                                break;
                            case "u":
                                _db.Zgrade_DnevnikRadaDetails.Attach(item);
                                _db.Entry(item).State = EntityState.Modified;
                                break;
                            case "d":
                                _db.Zgrade_DnevnikRadaDetails.Attach(item);
                                _db.Entry(item).State = EntityState.Deleted;
                                break;
                        }
                    }
                }

                await _db.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex) { return InternalServerError(); }
        }

        [HttpGet]
        [Route("api/data/getTvrtka")]
        public async Task<IHttpActionResult> getTvrtka()
        {
            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
                return Ok(await _db.Kompanije.FirstOrDefaultAsync(p => p.Id == companyId));
            }
            catch (Exception ex) { return InternalServerError(); }
        }

        [HttpPost]
        [Route("api/data/tvrtkaUpdate")]
        public async Task<IHttpActionResult> tvrtkaUpdate(Kompanije tvrtka)
        {
            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
                _db.Kompanije.Attach(tvrtka);
                _db.Entry(tvrtka).State = EntityState.Modified;
                await _db.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex) { return InternalServerError(); }
        }

        [HttpGet]
        [Route("api/data/getOglasna")]
        public async Task<IHttpActionResult> getOglasna(int zgradaId)
        {
            try
            {
                return Ok(await _db.vOglasnaPloca.Where(p => p.ZgradaId == zgradaId).OrderByDescending(p => p.Id).ToListAsync());
            }
            catch (Exception ex) { return InternalServerError(); }
        }

        [HttpPost]
        [Route("api/data/oglasnaEditOrCreate")]
        public async Task<IHttpActionResult> oglasnaEditOrCreate(Zgrade_OglasnaPloca oglas)
        {
            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
                var userGuid = identity.GetUserId();
                var user = await _db.KompanijeUseri.FirstOrDefaultAsync(p => p.UserGuid == userGuid);
                oglas.UserId = user.Id;

                if (oglas.Id == 0)
                    _db.Zgrade_OglasnaPloca.Add(oglas);
                else
                {
                    _db.Zgrade_OglasnaPloca.Attach(oglas);
                    _db.Entry(oglas).State = EntityState.Modified;

                }
                await _db.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex) { return InternalServerError(); }
        }

        [HttpGet]
        [Route("api/data/getuseriStanari")]
        public async Task<IHttpActionResult> getuseriStanari(int zgradaId)
        {
            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
                return Ok(await _db.vKompanijeUseri.Where(p => p.CompanyId == companyId && p.ZgradaId == zgradaId).ToListAsync());
            }
            catch (Exception ex) { return InternalServerError(); }
        }

        [HttpGet]
        [Route("api/data/getPopisStanari")]
        public async Task<IHttpActionResult> getPopisStanari(int zgradaId)
        {
            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
                return Ok(await _db.vPopisStanara.Where(p => p.CompanyId == companyId && p.ZgradaId == zgradaId && p.Zatvoren != true).ToListAsync());
            }
            catch (Exception ex)
            {
                return InternalServerError();
            }
        }

        [HttpPost]
        [Route("api/data/snimiKreirajUplatniceRacune")]
        public async Task<IHttpActionResult> SnimiKreirajUplatniceRacune(List<PricuvaRezijeMjesec_Uplatnice> data)
        {
            try
            {
                if (data.Count == 0)
                    return InternalServerError();


                // ovdje snimiti i pozvati PRUplatniceRacuniGeneretor** -vratit ce guid uplatnice ili racuna
                string path = System.Web.Hosting.HostingEnvironment.MapPath("~/Content/download/racuniUplatnice");
                var identity = (ClaimsIdentity)User.Identity;
                var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
                var company = await _db.Kompanije.FirstOrDefaultAsync(p => p.Id == companyId);
                int prMjesecId = (int)data.First().PricuvaRezijeMjesecId; 
                var prMj = await _db.PricuvaRezijeMjesec.FirstOrDefaultAsync(p => p.Id == prMjesecId);
                var prGod = await _db.PricuvaRezijeGodina.FirstOrDefaultAsync(p => p.Id == prMj.PrivuvaRezijeGodId);
                var zgrada = await _db.Zgrade.FirstOrDefaultAsync(p => p.Id == prGod.ZgradaId && p.CompanyId == companyId);
                var prihodiRashodiGod = await _db.PrihodiRashodi.FirstOrDefaultAsync(p => p.ZgradaId == zgrada.Id && p.Godina == prGod.Godina);

                foreach (var item in data)
                {
                    if (item.PdfUrl == "" || item.PdfUrl == null)
                        item.PdfUrl = Guid.NewGuid().ToString() + ".pdf";
                    if (item.Id == 0)
                        _db.PricuvaRezijeMjesec_Uplatnice.Add(item);
                    else
                    {
                        var target = await _db.PricuvaRezijeMjesec_Uplatnice.FirstOrDefaultAsync(p => p.Id == item.Id);
                        target.BrojRacuna = item.BrojRacuna;
                        target.DatumDospijeca = item.DatumDospijeca;
                        target.DatumIsporuke = item.DatumIsporuke;
                        target.DatumRacuna = item.DatumRacuna;
                        target.IznosPricuva = item.IznosPricuva;
                        target.IznosRezije = item.IznosRezije;
                        target.JedCijena = item.JedCijena;
                        target.JedMjera = item.JedMjera;
                        target.Kolicina = item.Kolicina;
                        target.Napomena = item.Napomena;
                        target.Opis = item.Opis;
                        target.PdfUrl = item.PdfUrl;
                        target.PlatiteljId = item.PlatiteljId;
                        target.PosebniDioMasterId = item.PosebniDioMasterId;
                        target.PricuvaRezijeMjesecId = item.PricuvaRezijeMjesecId;
                        target.PrimateljId = item.PrimateljId;
                        target.TipDuga = item.TipDuga;
                        target.TipPlacanja = item.TipPlacanja;
                        target.UdioPricuva = item.UdioPricuva;
                        target.UdioRezije = item.UdioRezije;
                        target.Ukupno = item.Ukupno;
                        target.UplatnicaDatumDospijeca = item.UplatnicaDatumDospijeca;
                        target.UplatnicaDatumUplatnice = item.UplatnicaDatumUplatnice;
                        target.UplatnicaIBANPrimatelja = item.UplatnicaIBANPrimatelja;
                        target.UplatnicaModel = item.UplatnicaModel;
                        target.UplatnicaOpis = item.UplatnicaOpis;
                        target.UplatnicaPlatiteljPodaci = item.UplatnicaPlatiteljPodaci;
                        target.UplatnicaPozivNaBroj = item.UplatnicaPozivNaBroj;
                        target.UplatnicaPrimateljPodaci = item.UplatnicaPrimateljPodaci;
                        target.UplatnicaSifraNamjene = item.UplatnicaSifraNamjene;
                        target.UplatnicaZaPlatiti = item.UplatnicaZaPlatiti;

                        //_db.PricuvaRezijeMjesec_Uplatnice.Attach(item);
                       // _db.Entry(item).State = EntityState.Modified;
                    }
                }
                var uplatniceRacuni = await new PRUplatniceRacuniGeneretor().PRUplatniceRacuniGeneretorGenerate(data, zgrada, company, path, (int)prMj.Mjesec, (int)prGod.Godina, _db);
                // nakon snimanja, kreirati prihode za mjesec (ako postoje za mjesec, brisi)
                //var dbPrihodiZaMjesec = await _db.PrihodiRashodi_Prihodi.Where(p => p.PrihodiRashodiGodId == prGod.Id && p.Mjesec == prMj.Mjesec).ToListAsync();
                foreach (var prihod in prihodiRashodiGod.PrihodiRashodi_Prihodi.Where(p => p.Mjesec == prMj.Mjesec).ToList())
                {
                    _db.PrihodiRashodi_Prihodi.Remove(prihod);
                }
                foreach (var item in data.OrderBy(p => p.PosebniDioMasterId))
                {
                    _db.PrihodiRashodi_Prihodi.Add(new PrihodiRashodi_Prihodi {
                        PrihodiRashodiGodId = prihodiRashodiGod.Id, PosebniDioMasterId = item.PosebniDioMasterId,
                        Iznos = item.TipDuga == "p" ? item.IznosPricuva : item.IznosRezije, IznosUplacen = 0,
                        DatumUplate = null, DatumValute = item.DatumDospijeca, Mjesec = (int)prMj.Mjesec,
                        Udio = item.TipDuga == "p" ? item.UdioPricuva : item.UdioRezije, VlasnikId = item.PlatiteljId
                    });
                }

                await _db.SaveChangesAsync();
                

                return Ok(data);
            }
            catch (Exception ex) { return InternalServerError(); }
        }

        [HttpPost]
        [Route("api/data/saveTeplates")]
        [System.Web.Mvc.ValidateInput(false)]
        public async Task<IHttpActionResult> saveTeplates(Zgrade zgrada)
        {
            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
                var target = await _db.Zgrade.FirstOrDefaultAsync(p => p.Id == zgrada.Id);
                if (target.CompanyId != companyId)
                {
                    return InternalServerError();
                }
                // napomena za racun - zgrada level
                target.NapomenaRacun = zgrada.NapomenaRacun;

                // opis za racun - master level
                foreach (var master in zgrada.Zgrade_PosebniDijeloviMaster)
                {
                    var dbMaster = await _db.Zgrade_PosebniDijeloviMaster.FirstOrDefaultAsync(p => p.Id == master.Id);
                    dbMaster.OpisRacun = master.OpisRacun;
                }

                await _db.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return InternalServerError();
            }
        }
    }
}
