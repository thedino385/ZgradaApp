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


        [HttpGet]
        [Route("api/data/getPosebiDijelovi")]
        public async Task<IHttpActionResult> GetPosebniDijelovi()
        {
            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
                return Ok(await _db.PosedniDijelovi.Where(p => p.CompanyId == companyId).ToListAsync());
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



        [HttpPost]
        [Route("api/data/posebniDioCreateUpdate")]
        public async Task<IHttpActionResult> PosebniDioCreateUpdate([FromBody] PosedniDijelovi dio)
        {
            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
                dio.CompanyId = companyId;
                if (dio.Id == 0)
                {
                    _db.PosedniDijelovi.Add(dio);
                    await _db.SaveChangesAsync();
                    return Ok(dio.Id);
                }
                else
                {
                    _db.Entry(dio).State = EntityState.Modified;
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
                    //_db.Entry(stan).State = EntityState.Modified;
                    var dbStan = await _db.Stanovi.FirstOrDefaultAsync(p => p.Id == stan.Id);
                    dbStan.BrojStana = stan.BrojStana;
                    dbStan.Kat = stan.Kat;
                    dbStan.Napomena = stan.Napomena;
                    dbStan.Naziv = stan.Naziv;
                    dbStan.Oznaka = stan.Oznaka;
                    dbStan.PovrsinaM2 = stan.PovrsinaM2;
                    dbStan.PovrsinaPosto = stan.PovrsinaPosto;
                    dbStan.SumaPovrsinaM2 = stan.SumaPovrsinaM2;
                    dbStan.SumaPovrsinaPosto = stan.SumaPovrsinaPosto;
                    foreach (var dio in stan.Stanovi_PosebniDijelovi)
                    {
                        if (dio.Status == "a")
                        {
                            var noviDio = new Stanovi_PosebniDijelovi
                            {
                                StanId = stan.Id,
                                PosebniDioId = dio.PosebniDioId,
                                Oznaka = dio.Oznaka,
                                Koef = dio.Koef,
                                PovrsinaM2 = dio.PovrsinaM2,
                                PovrsinaSaKoef = dio.PovrsinaSaKoef
                            };
                            _db.Stanovi_PosebniDijelovi.Add(noviDio);
                        }
                        else if (dio.Status == "u")
                        {
                            var targetDio = await _db.Stanovi_PosebniDijelovi.FirstOrDefaultAsync(p => p.Id == dio.Id);
                            targetDio.PosebniDioId = dio.PosebniDioId;
                            targetDio.Oznaka = dio.Oznaka;
                            targetDio.PovrsinaM2 = dio.PovrsinaM2;
                            targetDio.Koef = dio.Koef;
                            targetDio.PovrsinaSaKoef = dio.PovrsinaSaKoef;
                        }
                        else if (dio.Status == "d")
                        {
                            var target = await _db.Stanovi_PosebniDijelovi.FirstOrDefaultAsync(p => p.Id == dio.Id);
                            if (target != null)
                                _db.Stanovi_PosebniDijelovi.Remove(target);
                        }
                    }

                    foreach (var pripadak in stan.Stanovi_Pripadci.ToList())
                    {
                        if (pripadak.Status == "a")
                        {
                            var newPripadak = new Stanovi_Pripadci();
                            newPripadak.Koef = pripadak.Koef;
                            newPripadak.PripadakIZgradaId = pripadak.PripadakIZgradaId;
                            newPripadak.StanId = stan.Id;
                            newPripadak.PovrsinaSaKef = pripadak.PovrsinaSaKef;
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
                            dbPripadak.PovrsinaSaKef = pripadak.PovrsinaSaKef;
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
                                Udjel = stanar.Udjel,
                                Vlasnik = stanar.Vlasnik ?? false
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
                            target.Vlasnik = stanar.Vlasnik ?? false;
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

        [HttpPost]
        [Route("api/data/zaduzivanjeCreateUpdate")]
        public async Task<IHttpActionResult> ZaduzivanjePoMjesecima([FromBody] List<Zgrade_ZaduzivanjePoMj> z)
        {
            try
            {
                foreach (var item in z)
                {
                    if (item.Status == "a")
                    {
                        var novoZaduzivanje = new Zgrade_ZaduzivanjePoMj
                        {
                            ZgradaId = item.ZgradaId,
                            Godina = item.Godina,
                            Mj1 = item.Mj1,
                            Mj2 = item.Mj2,
                            Mj3 = item.Mj3,
                            Mj4 = item.Mj4,
                            Mj5 = item.Mj5,
                            Mj6 = item.Mj6,
                            Mj7 = item.Mj7,
                            Mj8 = item.Mj8,
                            Mj9 = item.Mj9,
                            Mj10 = item.Mj10,
                            Mj11 = item.Mj11,
                            Mj12 = item.Mj12
                        };
                        _db.Zgrade_ZaduzivanjePoMj.Add(novoZaduzivanje);
                    }
                    else if (item.Status == "u")
                    {
                        var dbZaduzivanje = await _db.Zgrade_ZaduzivanjePoMj.FirstOrDefaultAsync(p => p.Id == item.Id);
                        dbZaduzivanje.Godina = item.Godina;
                        dbZaduzivanje.Mj1 = item.Mj1;
                        dbZaduzivanje.Mj2 = item.Mj2;
                        dbZaduzivanje.Mj3 = item.Mj3;
                        dbZaduzivanje.Mj4 = item.Mj4;
                        dbZaduzivanje.Mj5 = item.Mj5;
                        dbZaduzivanje.Mj6 = item.Mj6;
                        dbZaduzivanje.Mj7 = item.Mj7;
                        dbZaduzivanje.Mj8 = item.Mj8;
                        dbZaduzivanje.Mj9 = item.Mj9;
                        dbZaduzivanje.Mj10 = item.Mj10;
                        dbZaduzivanje.Mj11 = item.Mj11;
                        dbZaduzivanje.Mj12 = item.Mj12;
                    }
                }
                await _db.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex) { return InternalServerError(); }
        }

        [HttpGet]
        [Route("api/data/getprihodirashodi")]
        public async Task<IHttpActionResult> GetPrihodiRashodi(int ZgradaId)
        {
            var identity = (ClaimsIdentity)User.Identity;
            var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
            var zgrada = await _db.Zgrade.FirstOrDefaultAsync(p => p.Id == ZgradaId && p.CompanyId == companyId);
            if (zgrada.CompanyId == companyId)
            {
                var pr = await _db.PrihodiRashodi.Where(p => p.ZgradaId == zgrada.Id).ToListAsync();
                return Ok(pr);
            }
            return InternalServerError();
        }

        [HttpGet]
        [Route("api/data/createEmptyPrihodRashod")]
        public async Task<IHttpActionResult> CreateEmptyPrihodRashod(int ZgradaId, int Godina)
        {
            return Ok(new PrihodiRashodi { ZgradaId = ZgradaId, Godina = Godina });
        }


        [HttpGet]
        [Route("api/data/getpricuva")]
        public async Task<IHttpActionResult> GetPricuva(int ZgradaId)
        {
            var identity = (ClaimsIdentity)User.Identity;
            var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
            var zgrada = await _db.Zgrade.FirstOrDefaultAsync(p => p.Id == ZgradaId && p.CompanyId == companyId);
            if (zgrada.CompanyId == companyId)
            {
                var pr = await _db.PricuvaGod.Where(p => p.ZgradaId == zgrada.Id).ToListAsync();
                return Ok(pr);
            }
            return InternalServerError();
        }

        [HttpGet]
        [Route("api/data/createEmptyPricuva")]
        public async Task<IHttpActionResult> CreateEmptyPricuva(int ZgradaId, int Godina)
        {
            var identity = (ClaimsIdentity)User.Identity;
            var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
            var zgrada = await _db.Zgrade.FirstOrDefaultAsync(p => p.Id == ZgradaId);
            if (zgrada.CompanyId != companyId)
                return InternalServerError();

            PricuvaGod god = new PricuvaGod { ZgradaId = ZgradaId, Godina = Godina, Status = "a" };
            // sad napuni childove sa stanovima
            foreach (var stan in zgrada.Stanovi)
            {
                var vlasnik = await _db.Stanovi_Stanari.FirstOrDefaultAsync(p => p.StanId == stan.Id && (p.Vlasnik ?? false));
                
                for (int i = 1; i <= 12; i++)
                {
                    // Mjesecna pricuva
                    god.PricuvaMj.Add(new PricuvaMj
                    {
                        StanId = stan.Id,
                        Mjesec = i,
                        DugPretplata = 0,
                        StanjeOd = 0,
                        Uplaceno = 0,
                        VlasnikId = vlasnik.Id,
                        Zaduzenje = 0,
                        Status = "a",
                        TipObracuna = 0
                    });
                    // StanjeOd - za svakog vlasnika
                }
                god.PricuvaGod_StanjeOd.Add(new PricuvaGod_StanjeOd
                {
                    PricuvaGodId = god.Id,
                    StanjeOd = 0,
                    VlasnikId = vlasnik.Id
                });
                
                // kreirati i prazne kartice suvlasnika za godinu (za svakog suvlacnika)
                // neka budu prazne, user ce dodati mjesece i uplate, al da ima za godinu za koju
                // postoji PricuvaGod
                //god.KS.Add(new KS
                //{
                //    StanarId = vlasnik.Id,
                //    Godina = Godina,
                //    Datum = null,
                //    Uplata = 0,
                //    Status = "a"
                //});
            }

            god.PricuvaMj_VrstaObracuna.Add(new PricuvaMj_VrstaObracuna
            {
                PricuvaGodId = god.Id,
                TipObracunaMj1 = 0,
                TipObracunaMj2 = 0,
                TipObracunaMj3 = 0,
                TipObracunaMj4 = 0,
                TipObracunaMj5 = 0,
                TipObracunaMj6 = 0,
                TipObracunaMj7 = 0,
                TipObracunaMj8 = 0,
                TipObracunaMj9 = 0,
                TipObracunaMj10 = 0,
                TipObracunaMj11 = 0,
                TipObracunaMj12 = 0,
                CijenaMj1 = 0,
                CijenaMj2 = 0,
                CijenaMj3 = 0,
                CijenaMj4 = 0,
                CijenaMj5 = 0,
                CijenaMj6 = 0,
                CijenaMj7 = 0,
                CijenaMj8 = 0,
                CijenaMj9 = 0,
                CijenaMj10 = 0,
                CijenaMj11 = 0,
                CijenaMj12 = 0,
            });

            // ovo je za test
            //int a = 1;
            //foreach (var item in god.PricuvaMj)
            //{
            //    if (item.StanId == 57)
            //        item.DugPretplata += a;
            //}


            return Ok(god);
        }

        [HttpPost]
        [Route("api/data/pricuvaCreateUpdate")]
        public async Task<IHttpActionResult> PricuvaCreateUpdate (List<PricuvaGod> pricuve)
        {
            try
            {
                foreach (var item in pricuve)
                {
                    if (item.Id == 0)
                        _db.PricuvaGod.Add(item);
                    else
                    {
                        var targetMaster = await _db.PricuvaGod.FirstOrDefaultAsync(p => p.Id == item.Id);
                        targetMaster.Godina = item.Godina;
                        targetMaster.StanjeOd = item.StanjeOd;
                        // mjeseci
                        foreach (var mj in item.PricuvaMj)
                        {
                            var target = await _db.PricuvaMj.FirstOrDefaultAsync(p => p.Id == mj.Id);
                            target.CijenaPoM2 = mj.CijenaPoM2;
                            target.CijenaUkupno = mj.CijenaUkupno;
                            target.DugPretplata = mj.DugPretplata;
                            target.Mjesec = mj.Mjesec;
                            target.StanId = mj.StanId;
                            target.StanjeOd = mj.StanjeOd;
                            target.TipObracuna = mj.TipObracuna;
                            target.Uplaceno = mj.Uplaceno;
                            target.VlasnikId = mj.VlasnikId;
                            target.Zaduzenje = mj.Zaduzenje;
                        }
                        // stanjeOd
                        foreach (var stanje in item.PricuvaGod_StanjeOd)
                        {
                            var target = await _db.PricuvaGod_StanjeOd.FirstOrDefaultAsync(p => p.Id == stanje.Id);
                            target.StanjeOd = stanje.StanjeOd;
                        }
                        // KS
                        foreach (var ks in item.KS)
                        {
                            var target = await _db.KS.FirstOrDefaultAsync(p => p.Id == ks.Id);
                            target.Datum = ks.Datum;
                            target.Godina = ks.Godina;
                            target.Mjesec = ks.Mjesec;
                            target.StanarId = ks.StanarId;
                            target.Uplata = ks.Uplata;
                        }
                        // PricuvaMj_VrstaObracuna
                        foreach (var obr in item.PricuvaMj_VrstaObracuna)
                        {
                            var target = await _db.PricuvaMj_VrstaObracuna.FirstOrDefaultAsync(p => p.PricuvaGodId == item.Id);
                            if(target == null)
                            {
                                obr.PricuvaGodId = item.Id;
                                _db.PricuvaMj_VrstaObracuna.Add(obr);
                            }
                            else
                            {
                                target.CijenaMj1 = obr.CijenaMj1;
                                target.CijenaMj2 = obr.CijenaMj2;
                                target.CijenaMj3= obr.CijenaMj3;
                                target.CijenaMj4 = obr.CijenaMj4;
                                target.CijenaMj5 = obr.CijenaMj5;
                                target.CijenaMj6 = obr.CijenaMj6;
                                target.CijenaMj7 = obr.CijenaMj7;
                                target.CijenaMj8 = obr.CijenaMj8;
                                target.CijenaMj9 = obr.CijenaMj9;
                                target.CijenaMj10 = obr.CijenaMj10;
                                target.CijenaMj11 = obr.CijenaMj11;
                                target.CijenaMj12 = obr.CijenaMj12;

                                target.TipObracunaMj1 = obr.TipObracunaMj1;
                                target.TipObracunaMj2 = obr.TipObracunaMj2;
                                target.TipObracunaMj3 = obr.TipObracunaMj3;
                                target.TipObracunaMj4 = obr.TipObracunaMj4;
                                target.TipObracunaMj5 = obr.TipObracunaMj5;
                                target.TipObracunaMj6 = obr.TipObracunaMj6;
                                target.TipObracunaMj7 = obr.TipObracunaMj7;
                                target.TipObracunaMj8 = obr.TipObracunaMj8;
                                target.TipObracunaMj9 = obr.TipObracunaMj9;
                                target.TipObracunaMj10 = obr.TipObracunaMj10;
                                target.TipObracunaMj11 = obr.TipObracunaMj11;
                                target.TipObracunaMj12 = obr.TipObracunaMj12;
                            }
                        }
                    }
                }
                await _db.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex) { return InternalServerError(); }
        }
    }
}
