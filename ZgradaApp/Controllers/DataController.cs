using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web.Http;

namespace ZgradaApp.Controllers
{
    [Authorize]
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
                var useri = await _db.KompanijeUseri.Where(p => p.CompanyId == companyId).ToListAsync();
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
                    foreach (var item in zgrada.Zgrade_PosebniDijeloviMaster)
                    {
                        switch (item.Status)
                        {
                            case "a":
                                _db.Zgrade_PosebniDijeloviMaster.Add(item);
                                break;
                            case "u":
                                _db.Zgrade_PosebniDijeloviMaster.Attach(item);
                                _db.Entry(item).State = EntityState.Modified;
                                break;
                        }
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

        [HttpPost]
        [Route("api/data/posebniDioChildrenCreateOrUpdate")]
        public async Task<IHttpActionResult> PosebniDioChildrenCreateOrUpdate(Zgrade_PosebniDijeloviMaster master)
        {
            // masterPosebniDio se u biti ne snima, on sadrzi posebneDIjeloveChild (sa njihovim kolekcijama) koje cemo snimati ovdje
            try
            {
                var dbMater = await _db.Zgrade_PosebniDijeloviMaster.FirstOrDefaultAsync(p => p.Id == master.Id);
                dbMater.UplatnicaStanarId = master.UplatnicaStanarId;

                // posebniDijeloviChild - child mastera
                foreach (var posebniDioChild in master.Zgrade_PosebniDijeloviChild)
                {
                    switch (posebniDioChild.Status)
                    {
                        case "a":
                            _db.Zgrade_PosebniDijeloviChild.Add(posebniDioChild);
                            break;
                        case "u":
                            //_db.Zgrade_PosebniDijeloviChild.Attach(posebniDioChild);
                            //_db.Entry(posebniDioChild).State = EntityState.Modified;
                            var target = await _db.Zgrade_PosebniDijeloviChild.FirstOrDefaultAsync(p => p.Id == posebniDioChild.Id);
                            target.Napomena = posebniDioChild.Napomena;
                            target.Naziv = posebniDioChild.Naziv;
                            target.Oznaka = posebniDioChild.Oznaka;
                            target.VrijediOdGodina = posebniDioChild.VrijediOdGodina;
                            target.VrijediOdMjesec = posebniDioChild.VrijediOdMjesec;
                            target.Zatvoren = posebniDioChild.Zatvoren;
                            target.ZatvorenGodina = posebniDioChild.ZatvorenGodina;
                            target.ZatvorenMjesec = posebniDioChild.ZatvorenMjesec;
                            // povrine - child posebnogDijelaChilda
                            foreach (var povrsina in posebniDioChild.Zgrade_PosebniDijeloviChild_Povrsine)
                            {
                                povrsina.PosebniDioChildId = posebniDioChild.Id;
                                switch (povrsina.Status)
                                {
                                    case "a":
                                        _db.Zgrade_PosebniDijeloviChild_Povrsine.Add(povrsina);
                                        break;
                                    case "u":
                                        _db.Zgrade_PosebniDijeloviChild_Povrsine.Attach(povrsina);
                                        _db.Entry(povrsina).State = EntityState.Modified;
                                        break;
                                }
                            }
                            // pripadci - child posebnogDijelaChilda
                            foreach (var prip in posebniDioChild.Zgrade_PosebniDijeloviChild_Pripadci)
                            {
                                prip.ZgradaPosDioChildId = posebniDioChild.Id;
                                switch (prip.Status)
                                {
                                    case "a":
                                        _db.Zgrade_PosebniDijeloviChild_Pripadci.Add(prip);
                                        break;
                                    case "u":
                                        _db.Zgrade_PosebniDijeloviChild_Pripadci.Attach(prip);
                                        _db.Entry(prip).State = EntityState.Modified;
                                        break;
                                }
                            }
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
            return Ok(new PricuvaRezijeGodina { ZgradaId = zgradaId, Godina = godina, Status = "a" });
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
                    //chilovi
                    foreach (var child in m.PricuvaRezijePosebniDioChildren)
                    {
                        // povrsine
                        foreach (var povr in child.PricuvaRezijePosebniDioChildPovrsine.ToList())
                        {
                            //var dbPovrsina = await _db.PricuvaRezijePosebniDioChildPovrsine.FirstOrDefaultAsync(p => p.Id == povr.Id);
                            //_db.PricuvaRezijePosebniDioChildPovrsine.Remove(dbPovrsina);
                            _db.PricuvaRezijePosebniDioChildPovrsine.Attach(povr);
                            _db.Entry(povr).State = EntityState.Deleted;
                        }
                        foreach (var prip in child.PricuvaRezijePosebniDioChildPripadci.ToList())
                        {
                            //var dbPrip = await _db.PricuvaRezijePosebniDioChildPripadci.FirstOrDefaultAsync(p => p.Id == prip.Id);
                            //_db.PricuvaRezijePosebniDioChildPripadci.Remove(dbPrip);
                            _db.PricuvaRezijePosebniDioChildPripadci.Attach(prip);
                            _db.Entry(prip).State = EntityState.Deleted;
                        }
                        //_db.PricuvaRezijePosebniDioChildren.Remove(child);
                        //var targetChild = await _db.PricuvaRezijePosebniDioChildren.FirstOrDefaultAsync(p => p.Id == child.Id);
                        //_db.PricuvaRezijePosebniDioChildren.Remove(targetChild);
                        childLIst.Add(child.PosebniDioChildId);
                    }
                    foreach (var vlasnik in m.PricuvaRezijePosebniDioMasterVlasnici.ToList())
                    {
                        //var dbVlasnik = await _db.PricuvaRezijePosebniDioMasterVlasnici.FirstOrDefaultAsync(p => p.Id == vlasnik.Id);
                        //_db.PricuvaRezijePosebniDioMasterVlasnici.Remove(dbVlasnik);
                        _db.PricuvaRezijePosebniDioMasterVlasnici.Attach(vlasnik);
                        _db.Entry(vlasnik).State = EntityState.Deleted;
                    }
                }

                foreach (var childId in childLIst)
                {
                    var targetChild = await _db.PricuvaRezijePosebniDioChildren.FirstOrDefaultAsync(p => p.PosebniDioChildId == childId);
                    _db.PricuvaRezijePosebniDioChildren.Remove(targetChild);
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

                        foreach (var stanje in prGod.PricuvaRezijeGodina_StanjeOd)
                        {
                            _db.PricuvaRezijeGodina_StanjeOd.Attach(stanje);
                            _db.Entry(stanje).State = EntityState.Modified;
                        }

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

                                    foreach (var child in master.PricuvaRezijePosebniDioChildren)
                                    {
                                        _db.PricuvaRezijePosebniDioChildren.Attach(child);
                                        _db.Entry(child).State = EntityState.Modified;

                                        foreach (var povrsina in child.PricuvaRezijePosebniDioChildPovrsine)
                                        {
                                            _db.PricuvaRezijePosebniDioChildPovrsine.Attach(povrsina);
                                            _db.Entry(povrsina).State = EntityState.Modified;
                                        }
                                        foreach (var prip in child.PricuvaRezijePosebniDioChildPripadci)
                                        {
                                            _db.PricuvaRezijePosebniDioChildPripadci.Attach(prip);
                                            _db.Entry(prip).State = EntityState.Modified;
                                        }
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
                var pdChildovi = await _db.Zgrade_PosebniDijeloviChild.Where(p => masteriIds.Contains(p.ZgradaPosDioMasterId)).ToListAsync();

                //return Ok(new PricuvaRezijeGodinaTable().getPricuvaRezijeGodinaTable(prGodina, masteri, stanari, pdChildovi, prProslaGodina));
                return Ok(new PricuvaRezijeGodinaTable().getPricuvaRezijeGodinaTable(prGodina, masteri, stanari, pdChildovi));
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
                return Ok(await _db.vOglasnaPloca.Where(p => p.ZgradaId == p.ZgradaId).OrderByDescending(p => p.Id).ToListAsync());
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
    }
}
