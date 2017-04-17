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
        public async Task<IHttpActionResult> GetZgrada(int Id)
        {
            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
                var zgrada = await _db.Zgrade.FirstOrDefaultAsync(p => p.Id == Id && p.CompanyId == companyId);
                return Ok(zgrada);
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
                // posebniDijeloviChild - child mastera
                foreach (var posebniDioChild in master.Zgrade_PosebniDijeloviChild)
                {
                    switch(posebniDioChild.Status)
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
                                switch(povrsina.Status)
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
                    switch(period.Status)
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
    }
}
