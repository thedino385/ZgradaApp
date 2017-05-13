using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace ZgradaApp
{
    public class RashodiPrebaciNeplacene
    {
        /*
                Kod kreiranja obracuna pricuve i rezija za mjesec, provjeri prosli mjesec u
                rashodima, ako postoji rashod koji nije placen, prenesi ga u ovaj.
                (prosli mjesec je ionako gotov)
                Parametar je trenutni mjesec, godina je tekuca godina.
         */

        ZgradaDbEntities _db = null;
        int _tekuciMjesec = DateTime.Today.Month;
        int _godina = DateTime.Today.Year;
        public RashodiPrebaciNeplacene(ZgradaDbEntities db, int tekuciMjesec)
        {
            _db = db;
            _tekuciMjesec = tekuciMjesec;
            _godina = DateTime.Today.Year;
        }

        public async Task<bool> Prebaci()
        {
            try
            {
                // nadji predprosli mjesec i prebaci sve neplacene u prosli
                // madji prosli mjesec i prebaci ga u tekuci
                //for (int i = -2; i < 0; i++)
                //{
                //int mjesec = DateTime.Today.AddMonths(-i).Month;
                //int godina = DateTime.Today.AddMonths(-i).Year;

                var rashod = await _db.PrihodiRashodi.FirstOrDefaultAsync(p => p.Godina == _godina);
                if (rashod != null)
                {
                    foreach (var r in rashod.PrihodiRashodi_Rashodi)
                    {
                        if (r.Mjesec == _tekuciMjesec - 1 && r.Placen != true)
                        {
                            // prebaci ga:
                            if (r.Mjesec == 12)
                            {
                                // - u novu godinu i 1. mjesec
                                int novaGodina = _godina + 1;
                                var godinaRashod = await _db.PrihodiRashodi.FirstOrDefaultAsync(p => p.Godina == novaGodina);
                                if (godinaRashod != null)
                                {
                                    // ne smije biti, al ajde
                                    int novaGodinaId = godinaRashod.Id;
                                    r.PrihodiRashodiGodId = novaGodinaId;
                                    r.Mjesec = 1;
                                    r.PrenesenIzMjeseca = 12;
                                }
                            }
                            else
                            {
                                r.Mjesec = _tekuciMjesec;
                                r.PrenesenIzMjeseca = r.Mjesec - 1;
                            }
                        }
                    }
                }
                //}
                await _db.SaveChangesAsync();
                return true;
            }
            catch (Exception) { return false; }

        }

    }
}