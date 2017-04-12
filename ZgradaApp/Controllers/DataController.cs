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
                //var pripadci = await _db.Pripadci.Where(p => p.CompanyId == companyId).ToListAsync();
                var zgrada = await _db.Zgrade.FirstOrDefaultAsync(p => p.Id == Id && p.CompanyId == companyId);
                //foreach (var pripadak in zgrada.Zgrade_Pripadci)
                //{
                //    pripadak.VrstaNaziv = pripadci.FirstOrDefault(p => p.Id == pripadak.PripadakId).Naziv;
                //}
                return Ok(zgrada);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }
    }
}
