using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using ZgradaApp.Models;

namespace ZgradaApp.Controllers
{
    public class AdminController : Controller
    {
        private ZgradaDbEntities _db = new ZgradaDbEntities();

        [Authorize(Roles ="Admin")]
        public async Task<ActionResult> Index()
        {
            ViewData["userType"] = "admin";
            return View(await _db.Kompanije.ToListAsync());
        }

        [Authorize(Roles ="Admin")]
        public async Task<ActionResult> Enable(int Id)
        {
            var target = await _db.Kompanije.FirstOrDefaultAsync(p => p.Id == Id);
            target.Active = true;
            await _db.SaveChangesAsync();
            return RedirectToAction("Index", "Admin");
        }

        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> Disable(int Id)
        {
            var target = await _db.Kompanije.FirstOrDefaultAsync(p => p.Id == Id);
            target.Active = false;
            await _db.SaveChangesAsync();
            return RedirectToAction("Index", "Admin");
        }

        public async Task<ActionResult> CreateAdmin(string k)
        {
            string key = System.Configuration.ConfigurationManager.AppSettings["Key"];
            if (k == key)
            {
                var su = new ApplicationUser { UserName = "admin@localhost.hr", Email = "dino@alphascore.hr" };
                ApplicationDbContext db = new ApplicationDbContext();
                var userStore = new UserStore<ApplicationUser>(db);
                var usermanager = new UserManager<ApplicationUser>(userStore);
                var result = usermanager.Create(su, ";LMFPWOEFajfeopimc/zs.");
                usermanager.AddToRole(su.Id, "Admin");
            }
            return RedirectToAction("Login", "Account");
        }

        public async Task<ActionResult> CreateRoles(string k)
        {
            string key = System.Configuration.ConfigurationManager.AppSettings["Key"];
            if (k == key)
            {
                try
                {
                    ApplicationDbContext db = new ApplicationDbContext();
                    db.Roles.Add(new IdentityRole { Name = "Admin" });
                    db.Roles.Add(new IdentityRole { Name = "Voditelj" });
                    db.Roles.Add(new IdentityRole { Name = "Stanar" });
                    await db.SaveChangesAsync(); // save new role, user is automatically saved
                    return Json("Ok", JsonRequestBehavior.AllowGet);
                }
                catch (Exception ex)
                {
                    return Json(ex.Message, JsonRequestBehavior.AllowGet);
                }
            }
            return Json("Live long and prosper", JsonRequestBehavior.AllowGet);
        }
    }
}