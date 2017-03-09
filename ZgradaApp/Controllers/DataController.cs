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
        public async Task<IHttpActionResult> GetZagrade()
        {
            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
                return Ok(await _db.Zgrade.Where(p => p.CompanyId == companyId).ToListAsync());
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
                    _db.Entry(zgrada).State = EntityState.Modified;
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

        [HttpGet]
        [Route("api/data/getstanovi")]
        public async Task<IHttpActionResult> GetStanovi()
        {
            // vuku se svi za tvrtku, na klijentu se filtrira za pojedinu zgradu
            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                var companyId = Convert.ToInt32(identity.FindFirstValue("Cid"));
                var zgrade = await _db.Zgrade.Where(p => p.CompanyId == companyId).Select(p => p.Id).ToListAsync();
                return Ok(await _db.Stanovi.Where(p => zgrade.Contains(p.ZgradaId)).ToListAsync());
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

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
                    _db.Stanovi.Add(stan);
                    await _db.SaveChangesAsync();
                    return Ok(stan.Id);
                }
                else
                {
                    // ovdje ce biti malo rada - uvesti Status za childove !!!
                    _db.Entry(stan).State = EntityState.Modified;
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
