﻿using iTextSharp.text;
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
    [Authorize(Roles ="Voditelj")]
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

                if(prenesiRashodeuTekuciMjesec)
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
                                    _db.Zgrade_PosebniDijeloviMaster_VlasniciPeriod_Vlasnici.Attach(vlasnik);
                                    _db.Entry(vlasnik).State = EntityState.Modified;
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
                            else if(pr.Status == "d")
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
            catch(Exception ex)
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
                // var pdChildovi = await _db.Zgrade_PosebniDijeloviChild.Where(p => masteriIds.Contains(p.ZgradaPosDioMasterId)).ToListAsync();

                //return Ok(new PricuvaRezijeGodinaTable().getPricuvaRezijeGodinaTable(prGodina, masteri, stanari, pdChildovi, prProslaGodina));
                return Ok(new PricuvaRezijeGodinaTable().getPricuvaRezijeGodinaTable(prGodina, masteri, stanari));
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
        [Route("api/data/genRacun")]
        public async Task<IHttpActionResult> getRacun(RacunPdf racun)
        {
            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
                var company = await _db.Kompanije.FirstOrDefaultAsync(p => p.Id == companyId);
                string path = System.Web.Hosting.HostingEnvironment.MapPath("~/Content/download/racuni");

                var doc = new Document(PageSize.A4, 30, 30, 25, 25);
                string pdf = Guid.NewGuid().ToString() + ".pdf";
                var output = new FileStream(Path.Combine(path, pdf), FileMode.Create);
                var writer = PdfWriter.GetInstance(doc, output);

                doc.Open();

                var titleFont = FontFactory.GetFont("Arial", 13, Font.BOLD);
                var subTitleFont = FontFactory.GetFont("Arial", 12, Font.BOLD);
                var boldTableHeaderFont = FontFactory.GetFont("Arial", 8, Font.BOLD);
                var boldTableFont = FontFactory.GetFont("Arial", 10, Font.BOLD);
                var cellTableFont = FontFactory.GetFont("Arial", 10, Font.NORMAL);
                //var endingMessageFont = FontFactory.GetFont("Arial", 10, Font.ITALIC);
                //var bodyFont = FontFactory.GetFont("Arial", 12, Font.NORMAL);

                #region tablica1
                PdfPTable tbl = new PdfPTable(2);
                tbl.HorizontalAlignment = 0;
                tbl.WidthPercentage = 60;
                //tbl.SpacingBefore = 10;
                //tbl.SpacingAfter = 10;
                tbl.DefaultCell.Border = 0;
                //tbl.SetWidths(new int[] { 2, 1, 2 });

                var logo = iTextSharp.text.Image.GetInstance(System.Web.Hosting.HostingEnvironment.MapPath("~/Content/logo/logo.png"));

                PdfPCell cell = new PdfPCell(logo, true);
                cell.Rowspan = 5;
                cell.BorderColor = BaseColor.WHITE;
                cell.HorizontalAlignment = Element.ALIGN_LEFT;
                tbl.AddCell(cell);

                cell = new PdfPCell(new Phrase(company.Naziv, boldTableFont));
                cell.PaddingLeft = 30;
                cell.HorizontalAlignment = Element.ALIGN_LEFT;
                cell.BorderColor = BaseColor.WHITE;
                tbl.AddCell(cell);

                cell = new PdfPCell(new Phrase(company.Adresa + ", " + company.Mjesto, cellTableFont));
                cell.PaddingLeft = 30;
                cell.HorizontalAlignment = Element.ALIGN_LEFT;
                cell.BorderColor = BaseColor.WHITE;
                tbl.AddCell(cell);

                cell = new PdfPCell(new Phrase("OIB: " + company.OIB, cellTableFont));
                cell.PaddingLeft = 30;
                cell.HorizontalAlignment = Element.ALIGN_LEFT;
                cell.BorderColor = BaseColor.WHITE;
                tbl.AddCell(cell);

                cell = new PdfPCell(new Phrase("tel: " + company.Telefon, cellTableFont));
                cell.PaddingLeft = 30;
                cell.HorizontalAlignment = Element.ALIGN_LEFT;
                cell.BorderColor = BaseColor.WHITE;
                tbl.AddCell(cell);

                cell = new PdfPCell(new Phrase("www.novoprojekt.net" + company.Telefon, cellTableFont));
                cell.PaddingLeft = 30;
                cell.HorizontalAlignment = Element.ALIGN_LEFT;
                cell.BorderColor = BaseColor.WHITE;
                tbl.AddCell(cell);
                #endregion

                #region tablica2
                PdfPTable tbl1 = new PdfPTable(3);
                tbl1.HorizontalAlignment = 0;
                tbl1.WidthPercentage = 100;
                //tbl.SpacingBefore = 10;
                //tbl.SpacingAfter = 10;
                tbl1.DefaultCell.Border = 0;
                tbl1.SetWidths(new int[] { 1, 1, 3 });

                // prvi red
                PdfPCell cell1 = new PdfPCell(new Phrase("Broj računa", boldTableFont));
                cell1.HorizontalAlignment = Element.ALIGN_LEFT;
                cell1.BorderColor = BaseColor.WHITE;
                tbl1.AddCell(cell1);

                cell1 = new PdfPCell(new Phrase(racun.BrojRacuna));
                cell1.HorizontalAlignment = Element.ALIGN_LEFT;
                cell1.BorderColor = BaseColor.WHITE;
                tbl1.AddCell(cell1);

                cell1 = new PdfPCell(new Phrase("Središnji drž.ured za obnovu i\nstambeno zbrinjavanje", boldTableFont));
                cell1.Rowspan = 2;
                cell1.HorizontalAlignment = Element.ALIGN_CENTER;
                cell1.BorderColor = BaseColor.WHITE;
                tbl1.AddCell(cell1);

                // drugi red
                cell1 = new PdfPCell(new Phrase("Datum računa", boldTableFont));
                cell1.HorizontalAlignment = Element.ALIGN_LEFT;
                cell1.BorderColor = BaseColor.WHITE;
                tbl1.AddCell(cell1);

                cell1 = new PdfPCell(new Phrase(racun.DatumRacuna.ToShortDateString(), cellTableFont));
                cell1.HorizontalAlignment = Element.ALIGN_LEFT;
                cell1.BorderColor = BaseColor.WHITE;
                tbl1.AddCell(cell1);

                // treci red
                cell1 = new PdfPCell(new Phrase("Datum isporuke", boldTableFont));
                cell1.HorizontalAlignment = Element.ALIGN_LEFT;
                cell1.BorderColor = BaseColor.WHITE;
                tbl1.AddCell(cell1);

                cell1 = new PdfPCell(new Phrase(racun.DatumIsporuke.ToShortDateString(), cellTableFont));
                cell1.HorizontalAlignment = Element.ALIGN_LEFT;
                cell1.BorderColor = BaseColor.WHITE;
                tbl1.AddCell(cell1);

                cell1 = new PdfPCell(new Phrase("Radnička cesta 22, Zagreb (Europske avenije 10, Osijek)", boldTableFont));
                cell1.HorizontalAlignment = Element.ALIGN_CENTER;
                cell1.BorderColor = BaseColor.WHITE;
                tbl1.AddCell(cell1);

                // 4 red
                cell1 = new PdfPCell(new Phrase("Datum Dospijeća", boldTableFont));
                cell1.HorizontalAlignment = Element.ALIGN_LEFT;
                cell1.BorderColor = BaseColor.WHITE;
                tbl1.AddCell(cell1);

                cell1 = new PdfPCell(new Phrase(racun.DatumDospijeca.ToShortDateString(), cellTableFont));
                cell1.HorizontalAlignment = Element.ALIGN_LEFT;
                cell1.BorderColor = BaseColor.WHITE;
                tbl1.AddCell(cell1);

                cell1 = new PdfPCell(new Phrase("OIB: 43664740219", boldTableFont));
                cell1.HorizontalAlignment = Element.ALIGN_CENTER;
                cell1.BorderColor = BaseColor.WHITE;
                tbl1.AddCell(cell1);
                #endregion

                #region tablicaStavke
                PdfPTable tbl2 = new PdfPTable(6);
                tbl2.HorizontalAlignment = 0;
                tbl2.WidthPercentage = 100;
                //tbl.SpacingBefore = 10;
                //tbl.SpacingAfter = 10;
                //tbl2.DefaultCell.Border = 0;
                tbl2.SetWidths(new int[] { 1, 2, 4, 1, 1 , 1});

                // 1 red
                var cell2 = new PdfPCell(new Phrase("r.b.", boldTableFont));
                cell2.HorizontalAlignment = Element.ALIGN_CENTER;
                //cell2.BorderColor = BaseColor.WHITE;
                tbl2.AddCell(cell2);

                cell2 = new PdfPCell(new Phrase("jed.mj.", boldTableFont));
                cell2.HorizontalAlignment = Element.ALIGN_CENTER;
                //cell2.BorderColor = BaseColor.WHITE;
                tbl2.AddCell(cell2);

                cell2 = new PdfPCell(new Phrase("Opis", boldTableFont));
                cell2.HorizontalAlignment = Element.ALIGN_CENTER;
                //cell2.BorderColor = BaseColor.WHITE;
                tbl2.AddCell(cell2);

                cell2 = new PdfPCell(new Phrase("jed.cijena\n[kn]", boldTableFont));
                cell2.HorizontalAlignment = Element.ALIGN_CENTER;
                //cell2.BorderColor = BaseColor.WHITE;
                tbl2.AddCell(cell2);

                cell2 = new PdfPCell(new Phrase("količina", boldTableFont));
                cell2.HorizontalAlignment = Element.ALIGN_CENTER;
                //cell2.BorderColor = BaseColor.WHITE;
                tbl2.AddCell(cell2);

                cell2 = new PdfPCell(new Phrase("ukupno[kn]", boldTableFont));
                cell2.HorizontalAlignment = Element.ALIGN_CENTER;
                //cell2.BorderColor = BaseColor.WHITE;
                tbl2.AddCell(cell2);

                // 2. red
                cell2 = new PdfPCell(new Phrase("1.", cellTableFont));
                cell2.HorizontalAlignment = Element.ALIGN_CENTER;
                //cell2.BorderColor = BaseColor.WHITE;
                tbl2.AddCell(cell2);

                cell2 = new PdfPCell(new Phrase(racun.JedMjera, cellTableFont));
                cell2.HorizontalAlignment = Element.ALIGN_CENTER;
                //cell2.BorderColor = BaseColor.WHITE;
                tbl2.AddCell(cell2);

                cell2 = new PdfPCell(new Phrase(racun.Opis, cellTableFont));
                cell2.HorizontalAlignment = Element.ALIGN_CENTER;
                //cell2.BorderColor = BaseColor.WHITE;
                tbl2.AddCell(cell2);

                cell2 = new PdfPCell(new Phrase(racun.JedCijena.ToString(), cellTableFont));
                cell2.HorizontalAlignment = Element.ALIGN_CENTER;
                //cell2.BorderColor = BaseColor.WHITE;
                tbl2.AddCell(cell2);

                cell2 = new PdfPCell(new Phrase(racun.Kolicina.ToString(), cellTableFont));
                cell2.HorizontalAlignment = Element.ALIGN_CENTER;
                //cell2.BorderColor = BaseColor.WHITE;
                tbl2.AddCell(cell2);

                cell2 = new PdfPCell(new Phrase(racun.Ukupno.ToString(), cellTableFont));
                cell2.HorizontalAlignment = Element.ALIGN_CENTER;
                //cell2.BorderColor = BaseColor.WHITE;
                tbl2.AddCell(cell2);

                #endregion

                doc.Add(tbl);
                doc.Add(new Paragraph("\n\n"));
                doc.Add(tbl1);
                doc.Add(new Paragraph("\n\n"));
                doc.Add(tbl2);
                doc.Add(new Paragraph("\n\n"));
                //doc.Add(new Paragraph(racun.Napomena));
                //string[] redovi = Regex.Split(racun.Napomena, "<br>");
                //foreach (var row in redovi)
                //{
                //    if(row.StartsWith('<b>'))
                //}

                Paragraph napomenaParag = new Paragraph();
                foreach (var row in Regex.Split(racun.Napomena, "<br>"))
                {
                    string chunk = "";
                    if (!row.Contains("<b>") && !row.Contains("</b>"))
                        napomenaParag.Add(new Chunk(row, cellTableFont));
                    else
                    {
                        foreach (var c in Regex.Split(row, "<b>"))
                        {
                            napomenaParag.Add(new Chunk(row.Replace("<b>", "").Replace("</b>", ""), boldTableFont));
                        }
                    }
                    napomenaParag.Add(new Chunk("\n", cellTableFont));
                }
                doc.Add(napomenaParag);
                //Font regular = new Font(FontFamily.HELVETICA, 12);
                //Font bold = Font font = new Font(FontFamily.HELVETICA, 12, Font.BOLD);
                //Phrase p = new Phrase("NAME: ", bold);
                //p.add(new Chunk(cc_cust_dob, regular));
                //PdfPCell cell = new PdfPCell(p);

                doc.Close();
                writer.Close();
                output.Close();

                return Ok();
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
                if(target.CompanyId != companyId)
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
            catch(Exception ex)
            {
                return InternalServerError();
            }
        }
    }
}
