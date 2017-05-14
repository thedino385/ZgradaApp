using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace ZgradaApp
{
    public class PrebaciOtvoreneStavkeDnevnika
    {
        public async Task<bool> Prebaci(ZgradaDbEntities db, int zgradaId)
        {
            try
            {
                int month = DateTime.Today.Month - 1;
                var stavkeProsli = await db.Zgrade_DnevnikRada.Where(p => p.ZgradaId == zgradaId && p.Mjesec == month && p.Godina == DateTime.Today.Year).ToListAsync();
                foreach (var item in stavkeProsli)
                {
                    if (item.Odradjeno != true)
                        item.Mjesec = DateTime.Today.Month;
                }
                await db.SaveChangesAsync();
                return true;
            }
            catch { return false; }
        }
    }

}