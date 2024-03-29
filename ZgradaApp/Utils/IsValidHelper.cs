﻿using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace ZgradaApp
{
    public class IsValidHelper
    {
        private readonly ZgradaDbEntities _db = new ZgradaDbEntities();

        public async Task<PricuvaRezijeMjesec> CreatePricuvaMjesec(PricuvaRezijeMjesec prMj, int godina, int zgradaId, List<PricuvaRezijeGodina> prGodineSve)
        {
            var listTotal = await _db.Zgrade_PosebniDijeloviMaster.Where(p => p.ZgradaId == zgradaId).ToListAsync();
            foreach (var pdMaster in listTotal)
            {
                if (IsValid(pdMaster.VrijediOdMjesec, pdMaster.VrijediOdGodina, pdMaster.ZatvorenGodina, pdMaster.ZatvorenMjesec, pdMaster.Zatvoren, godina, prMj.Mjesec))
                {
                    // ok validan je, dodaj ga pa idemo na childove
                    var posDioMaster = new PricuvaRezijePosebniDioMasteri
                    {
                        Id = 0,
                        PosebniDioMasterId = pdMaster.Id,
                        PricuvaRezijeMjesecId = prMj.Id,
                        DugPretplata = 0,
                        ObracunPricuvaCijenaSlobodanUnos = 0,
                        ObracunRezijeBrojClanova = 0,
                        ObracunRezijeCijenaSlobodanUnos = 0,
                        StanjeOd = 0,
                        Uplaceno = 0,
                        ZaduzenjePricuva = 0,
                        ZaduzenjeRezije = 0,
                        PeriodId = 0,
                        PocetnoStanje = null,
                        BrojStana = pdMaster.Broj,
                        //Saldo = 0,
                        //DugPretplataProsliMjesec = 0,
                        //PricuvaRezijePosebniDioChildren = new List<PricuvaRezijePosebniDioChildren>(),
                        PricuvaRezijePosebniDioMasterVlasnici = new List<PricuvaRezijePosebniDioMasterVlasnici>()
                    };

                    // ok master je validan, nadji Saldo iz proslog mjeseca i prebaci ga u StanjeOd mjeseca
                    decimal saldoIzProslog = 0;
                    if (prMj.Mjesec == 1)
                    {
                        // nadji 12.mj prosle godine
                        int g = godina - 1;
                        var targetGodina = prGodineSve.FirstOrDefault(p => p.Godina == g);
                        if(targetGodina != null)
                        {
                            var mjTarget = targetGodina.PricuvaRezijeMjesec.FirstOrDefault(p => p.Mjesec == 12);
                            var master12 = mjTarget.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == pdMaster.Id);
                            saldoIzProslog = master12.DugPretplata != null ? (decimal)master12.DugPretplata : 0;
                        }
                    }
                    else
                    {
                        var targetGodina = prGodineSve.FirstOrDefault(p => p.Godina == godina);
                        int targetMj = (int)prMj.Mjesec - 1;
                        if(targetMj > 0)
                        {
                            var mjTarget = targetGodina.PricuvaRezijeMjesec.FirstOrDefault(p => p.Mjesec == targetMj);
                            var masterTarget = mjTarget.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == pdMaster.Id);
                            if (masterTarget == null)
                                saldoIzProslog = 0;
                            else
                                saldoIzProslog = masterTarget.DugPretplata != null ? (decimal)masterTarget.DugPretplata : 0;
                        }
                    }
                    posDioMaster.StanjeOd = saldoIzProslog;

                    prMj.PricuvaRezijePosebniDioMasteri.Add(posDioMaster);
                    // povrsine
                    foreach (var povrsina in pdMaster.Zgrade_PosebniDijeloviMaster_Povrsine)
                    {
                        if (IsValid(povrsina.VrijediOdMjesec, povrsina.VrijediOdGodina, povrsina.ZatvorenMjesec, povrsina.ZatvorenGodina, povrsina.Zatvoren, godina, prMj.Mjesec))
                        {
                            var povr = new PricuvaRezijePosebniDioMasterPovrsine
                            {
                                Id = 0,
                                PricuvaRezijePosebniDioMasterId = pdMaster.Id,
                                PovrsinaId = povrsina.Id,
                                Koef = povrsina.Koef,
                                Naziv = povrsina.Naziv,
                                Oznaka = povrsina.Oznaka,
                                Povrsina = povrsina.Povrsina
                            };
                            posDioMaster.PricuvaRezijePosebniDioMasterPovrsine.Add(povr);
                        }
                    }
                    // pripadci
                    foreach (var prip in pdMaster.Zgrade_PosebniDijeloviMaster_Pripadci)
                    {
                        if (IsValid(prip.VrijediOdMjesec, prip.VrijediOdGodina, prip.ZatvorenMjesec, prip.ZatvorenGodina, prip.Zatvoren, godina, prMj.Mjesec))
                        {
                            var p = new PricuvaRezijePosebniDioMasterPripadci
                            {
                                Id = 0,
                                PricuvaRezijePosebniDioMasterId = pdMaster.Id,
                                PripadakId = prip.Id,
                                Koef = prip.Koef,
                                Naziv = prip.Naziv,
                                Oznaka = prip.Oznaka,
                                Povrsina = prip.Povrsina
                            };
                            posDioMaster.PricuvaRezijePosebniDioMasterPripadci.Add(p);
                        }
                    }


                    //foreach (var pdChild in pdMaster.Zgrade_PosebniDijeloviChild)
                    //{
                    //    if (IsValid(pdChild.VrijediOdMjesec, pdChild.VrijediOdGodina, pdChild.ZatvorenGodina, pdChild.ZatvorenMjesec, pdChild.Zatvoren, godina, prMj.Mjesec))
                    //    {
                    //        var posDioChild = new PricuvaRezijePosebniDioChildren
                    //        {
                    //            Id = 0,
                    //            PricuvaRezijeMasterId = pdMaster.Id,
                    //            PosebniDioChildId = pdChild.Id,
                    //            PricuvaRezijePosebniDioChildPovrsine = new List<PricuvaRezijePosebniDioChildPovrsine>(),
                    //            PricuvaRezijePosebniDioChildPripadci = new List<PricuvaRezijePosebniDioChildPripadci>()
                    //        };
                    //        posDioMaster.PricuvaRezijePosebniDioChildren.Add(posDioChild);
                    //        // povrsine
                    //        foreach (var povrsina in pdChild.Zgrade_PosebniDijeloviChild_Povrsine)
                    //        {
                    //            if(IsValid(povrsina.VrijediOdMjesec, povrsina.VrijediOdGodina, povrsina.ZatvorenMjesec, povrsina.ZatvorenGodina, povrsina.Zatvoren, godina, prMj.Mjesec))
                    //            {
                    //                var povr = new PricuvaRezijePosebniDioChildPovrsine
                    //                {
                    //                    Id = 0,
                    //                    PricuvaRezijePosebniDioChildId = pdChild.Id,
                    //                    PovrsinaId = povrsina.Id,
                    //                    Koef = povrsina.Koef,
                    //                    Naziv = povrsina.Naziv,
                    //                    Oznaka = povrsina.Oznaka,
                    //                    Povrsina = povrsina.Povrsina
                    //                };
                    //                posDioChild.PricuvaRezijePosebniDioChildPovrsine.Add(povr);
                    //            }
                    //        }

                    //        // pripadci
                    //        foreach (var prip in pdChild.Zgrade_PosebniDijeloviChild_Pripadci)
                    //        {
                    //            if (IsValid(prip.VrijediOdMjesec, prip.VrijediOdGodina, prip.ZatvorenMjesec, prip.ZatvorenGodina, prip.Zatvoren, godina, prMj.Mjesec))
                    //            {
                    //                var prPrip = new PricuvaRezijePosebniDioChildPripadci
                    //                {
                    //                    Id = 0,
                    //                    PricuvaRezijePosebniDioChildId = pdChild.Id,
                    //                    PripadakId = prip.Id,
                    //                    Koef = prip.Koef,
                    //                    Naziv = prip.Naziv,
                    //                    Oznaka = prip.Oznaka,
                    //                    Povrsina = prip.Povrsina
                    //                };
                    //                posDioChild.PricuvaRezijePosebniDioChildPripadci.Add(prPrip);
                    //            }
                    //        }
                    //    }
                    //}
                    // vlasnici period
                    foreach (var period in pdMaster.Zgrade_PosebniDijeloviMaster_VlasniciPeriod)
                    {
                        if (IsValid(period.VrijediOdMjesec, period.VrijediOdGodina, period.VrijediDoMjesec, period.VrijediDoGodina, period.Zatvoren, godina, prMj.Mjesec))
                        {
                            foreach (var vlasnik in period.Zgrade_PosebniDijeloviMaster_VlasniciPeriod_Vlasnici)
                            {
                                if(vlasnik.VlasniciPeriodId == period.Id)
                                {
                                    var vlasniciPeriod = new PricuvaRezijePosebniDioMasterVlasnici
                                    {
                                        Id = 0,
                                        PeriodId = period.Id, // ovo ovje ni ne treba
                                        VlasnikId = vlasnik.StanarId,
                                        Udio = vlasnik.Udio
                                    };
                                    posDioMaster.PricuvaRezijePosebniDioMasterVlasnici.Add(vlasniciPeriod);
                                }
                            }
                            posDioMaster.PeriodId = period.Id;
                            break; // ovo je za mjesec, znaci samo *jedan* period smije biti validan jer je obracunska jedinica mjesec
                        }
                    }
                }
            }

            return prMj;

        }

        private bool IsValid(int? mjesecOd, int? godinaOd, int? mjesecDo, int? godinaDo, bool? zatvoren, int godina, int? mjesec)
        {
            if (zatvoren != true)
            {
                // NIJE ZATVOREN
                if (godinaOd < godina)
                    return true;
                    // ovo vrijedi
                else if (godinaOd == godina && mjesecOd <= mjesec)
                    return true;
                    // vrijedi za godinu, zakljucno sa mjesecom
            }
            else
            {
                if (godinaDo > godina)
                    return true;
                    // ovo vrijedi
                // ok, zatvoren je, vrijedi za godinu i mjesecom koji pise
                else if (godinaDo == godina && mjesecDo >= mjesec)
                    return true;
            }
            return false;
        }
    }
}