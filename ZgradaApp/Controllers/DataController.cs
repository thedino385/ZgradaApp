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
                var zgrade = await _db.Zgrade.Where(p => p.CompanyId == companyId).ToListAsync();
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
                var pripadci = await _db.Pripadci.Where(p => p.CompanyId == companyId).ToListAsync();
                var zgrada = await _db.Zgrade.FirstOrDefaultAsync(p => p.Id == Id && p.CompanyId == companyId);
                foreach (var pripadak in zgrada.Zgrade_Pripadci)
                {
                    pripadak.VrstaNaziv = pripadci.FirstOrDefault(p => p.Id == pripadak.PripadakId).Naziv;
                }
                return Ok(zgrada);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        [HttpPost]
        [Route("api/data/zgradaCreateUpdate")]
        public async Task<IHttpActionResult> ZgradaCreateUpdate([FromBody] Zgrade zgrada)
        {
            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
                zgrada.CompanyId = companyId;
                if (zgrada.Id == 0)
                {
                    _db.Zgrade.Add(zgrada);
                    await _db.SaveChangesAsync();
                    return Ok(zgrada.Id);
                }
                else
                {
                    //_db.Entry(zgrada).State = EntityState.Modified;
                    var targetZgrada = await _db.Zgrade.FirstOrDefaultAsync(p => p.Id == zgrada.Id);
                    targetZgrada.CompanyId = companyId;
                    targetZgrada.Adresa = zgrada.Adresa;
                    targetZgrada.Mjesto = zgrada.Mjesto;
                    targetZgrada.Naziv = zgrada.Naziv;
                    targetZgrada.Povrsinam2 = zgrada.Povrsinam2;
                    foreach (var pripadak in zgrada.Zgrade_Pripadci)
                    {
                        if (pripadak.Status == "d")
                        {
                            if (await _db.Stanovi_Pripadci.FirstOrDefaultAsync(p => p.Id == pripadak.Id) != null)
                                _db.Zgrade_Pripadci.Remove(pripadak);
                        }

                        else if (pripadak.Status == "a")
                            _db.Zgrade_Pripadci.Add(pripadak);
                        else
                        {
                            var target = await _db.Zgrade_Pripadci.FirstOrDefaultAsync(p => p.Id == pripadak.Id);
                            target.PripadakId = pripadak.PripadakId;
                            target.Naziv = pripadak.Naziv;
                            target.PovrsinaM2 = pripadak.PovrsinaM2;
                            target.PovrsinaPosto = pripadak.PovrsinaPosto;
                            target.Napomena = pripadak.Napomena;
                        }

                    }
                    await _db.SaveChangesAsync();
                    return Ok(-1);
                }

            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        [HttpGet]
        [Route("api/data/getpripadci")]
        public async Task<IHttpActionResult> GetPripadci()
        {
            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
                return Ok(await _db.Pripadci.Where(p => p.CompanyId == companyId).ToListAsync());
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        [HttpGet]
        [Route("api/data/getpripadak")]
        public async Task<IHttpActionResult> GetPripadak(int Id)
        {
            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
                return Ok(await _db.Pripadci.FirstOrDefaultAsync(p => p.CompanyId == companyId && p.Id == Id));
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        [HttpPost]
        [Route("api/data/pripadakCreateUpdate")]
        public async Task<IHttpActionResult> PripadakCreateUpdate([FromBody] Pripadci pripadak)
        {
            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
                pripadak.CompanyId = companyId;
                if (pripadak.Id == 0)
                {
                    _db.Pripadci.Add(pripadak);
                    await _db.SaveChangesAsync();
                    return Ok(pripadak.Id);
                }
                else
                {
                    _db.Entry(pripadak).State = EntityState.Modified;
                    await _db.SaveChangesAsync();
                    return Ok(-1);
                }

            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        //[HttpGet]
        //[Route("api/data/getstanovi")]
        //public async Task<IHttpActionResult> GetStanovi()
        //{
        //    // vuku se svi za tvrtku, na klijentu se filtrira za pojedinu zgradu
        //    try
        //    {
        //        var identity = (ClaimsIdentity)User.Identity;
        //        var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
        //        var zgrade = await _db.Zgrade.Where(p => p.CompanyId == companyId).Select(p => p.Id).ToListAsync();
        //        var stanovi = await _db.Stanovi.Where(p => zgrade.Contains(p.ZgradaId)).ToListAsync();

        //        foreach (var stan in stanovi)
        //        {
        //            foreach (var prip in stan.Stanovi_Pripadci)
        //            {
        //                if (prip.VrijediDoMjesec < DateTime.Today.Month && prip.VrijediDoGod < DateTime.Now.Year)
        //                    prip.Active = false;
        //            }
        //        }
        //        return Ok(stanovi);
        //    }
        //    catch (Exception ex)
        //    {
        //        return InternalServerError(ex);
        //    }
        //}

        [HttpPost]
        [Route("api/data/stanCreateUpdate")]
        public async Task<IHttpActionResult> StanCreateUpdate(Stanovi stan)
        {
            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
                if (stan.Id == 0)
                {
                    // za sve unesene pripadtke, definiraj vrijediOd
                    foreach (var item in stan.Stanovi_Pripadci)
                    {
                        item.VrijediOdGod = DateTime.Today.Year;
                        item.VrijediOdMjesec = DateTime.Today.Month;
                    }
                    _db.Stanovi.Add(stan);
                    await _db.SaveChangesAsync();
                    return Ok(stan.Id);
                }
                else
                {
                    // ovdje ce biti malo rada - uvesti Status za childove !!!
                    _db.Entry(stan).State = EntityState.Modified;
                    foreach (var pripadak in stan.Stanovi_Pripadci.ToList())
                    {
                        if (pripadak.Status == "a")
                        {
                            var newPripadak = new Stanovi_Pripadci();
                            newPripadak.Koef = pripadak.Koef;
                            newPripadak.PripadakIZgradaId = pripadak.PripadakIZgradaId;
                            newPripadak.StanId = stan.Id;
                            newPripadak.VrijediOdMjesec = DateTime.Today.Month;
                            newPripadak.VrijediOdGod = DateTime.Today.Year;
                            if (stan.Stanovi_PrijenosPripadaka != null)
                            {
                                foreach (var item in stan.Stanovi_PrijenosPripadaka)
                                {
                                    if (item.PripadakIZgradaId == pripadak.PripadakIZgradaId)
                                    {
                                        // pripadak se prenosi na ovaj stan, upisi od kad vrijedi
                                        newPripadak.VrijediOdMjesec = item.VrijediOdMjesec;
                                        newPripadak.VrijediOdGod = item.VrijediOdGodina;
                                    }
                                }
                            }
                            _db.Stanovi_Pripadci.Add(newPripadak);
                        }
                        else if (pripadak.Status == "u")
                        {
                            var dbPripadak = await _db.Stanovi_Pripadci.FirstOrDefaultAsync(p => p.Id == pripadak.Id);
                            dbPripadak.Koef = pripadak.Koef;
                        }
                        else if (pripadak.Status == "d")
                        {
                            _db.Stanovi_Pripadci.Remove(pripadak); // smije se obrisati jer se brise samo iz kolekcije na stanovima, pripadak i dalje postoji za zgradu
                        }
                    }
                    foreach (var stanar in stan.Stanovi_Stanari.ToList())
                    {
                        if (stanar.Status == "a")
                        {
                            var newStanar = new Stanovi_Stanari
                            {
                                StanId = stan.Id,
                                Email = stanar.Email,
                                Ime = stanar.Ime,
                                OIB = stanar.OIB,
                                Prezime = stanar.Prezime,
                                Udjel = stanar.Udjel
                            };
                            _db.Stanovi_Stanari.Add(newStanar);
                        }
                        else if (stanar.Status == "u")
                        {
                            var target = await _db.Stanovi_Stanari.FirstOrDefaultAsync(p => p.Id == stanar.Id);
                            target.Email = stanar.Email;
                            target.Ime = stanar.Ime;
                            target.OIB = stanar.OIB;
                            target.Prezime = stanar.Prezime;
                            target.StanId = stan.Id;
                            target.Udjel = stanar.Udjel;
                        }
                        else if (stanar.Status == "d")
                        {
                            _db.Stanovi_Stanari.Remove(stanar);
                        }
                    }

                    if (stan.Stanovi_PrijenosPripadaka != null)
                    {
                        // zatvori pripatke
                        foreach (var item in stan.Stanovi_PrijenosPripadaka.ToList())
                        {
                            var pripadak = await _db.Stanovi_Pripadci.FirstOrDefaultAsync(p => p.Id == item.IdKojiSeZatvara);
                            pripadak.VrijediDoGod = item.VrijediOdGodina;
                            pripadak.VrijediDoMjesec = item.VrijediOdMjesec;
                        }
                    }

                    await _db.SaveChangesAsync();
                    return Ok(-1);
                }

            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }
    }
}
