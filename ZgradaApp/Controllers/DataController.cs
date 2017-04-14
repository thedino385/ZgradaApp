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
                        switch(item.Status)
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
    }
}
