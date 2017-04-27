using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ZgradaApp
{
    public class PricuvaRezijeGodinaTable
    {
        List<PricuvaRezijeGodinaStructure> tbl = new List<PricuvaRezijeGodinaStructure>();

        public List<PricuvaRezijeGodinaStructure> getPricuvaRezijeGodinaTable(PricuvaRezijeGodina prGodina, List<Zgrade_PosebniDijeloviMaster> masteri, List<Zgrade_Stanari> stanari, List<Zgrade_PosebniDijeloviChild> pdChildren)
        {
            if (prGodina == null)
                return tbl;

            foreach (var prMj in prGodina.PricuvaRezijeMjesec)
            {
                foreach (var prMaster in prMj.PricuvaRezijePosebniDioMasteri)
                {
                    if(prMaster.PeriodId != null)
                    {
                        if (tbl.Where(p => p.prPeriodId == prMaster.PeriodId).Count() == 0)
                        {
                            var vlasniciList = new List<string>();
                            foreach (var vlasnik in prMaster.PricuvaRezijePosebniDioMasterVlasnici.Where(p => p.PeriodId == prMaster.PeriodId))
                            {
                                var stanaroBJ = stanari.FirstOrDefault(p => p.Id == vlasnik.VlasnikId);
                                vlasniciList.Add(stanaroBJ.Ime + " " + stanaroBJ.Prezime);
                            }

                            var prMasterNaziv = masteri.FirstOrDefault(p => p.Id == prMaster.PosebniDioMasterId).Naziv;

                            // Uplate po mjesecima
                            decimal uplataMj1 = 0; decimal uplataMj2 = 0; decimal uplataMj3 = 0; decimal uplataMj4 = 0; decimal uplataMj5 = 0;
                            decimal uplataMj6 = 0; decimal uplataMj7 = 0; decimal uplataMj8 = 0; decimal uplataMj9 = 0; decimal uplataMj10 = 0;
                            decimal uplataMj11 = 0; decimal uplataMj12 = 0;

                            var listChildrenMj1 = new List<string>(); var listChildrenMj2 = new List<string>(); var listChildrenMj3 = new List<string>();
                            var listChildrenMj4 = new List<string>(); var listChildrenMj5 = new List<string>(); var listChildrenMj6 = new List<string>();
                            var listChildrenMj7 = new List<string>(); var listChildrenMj8 = new List<string>(); var listChildrenMj9 = new List<string>();
                            var listChildrenMj10 = new List<string>(); var listChildrenMj11 = new List<string>(); var listChildrenMj12 = new List<string>();

                            decimal Zaduzenje = 0;

                            foreach (var recMjesec in prGodina.PricuvaRezijeMjesec)
                            {
                                switch(recMjesec.Mjesec)
                                {
                                    case 1:
                                        var masterUmjesecu1 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if(masterUmjesecu1.PeriodId != null && masterUmjesecu1.PeriodId == prMaster.PeriodId)
                                        {
                                            uplataMj1 = (decimal)masterUmjesecu1.Uplaceno;
                                            Zaduzenje += (decimal)masterUmjesecu1.Zaduzenje;
                                            foreach (var child in masterUmjesecu1.PricuvaRezijePosebniDioChildren)
                                            {
                                                listChildrenMj1.Add(pdChildren.FirstOrDefault(p => p.Id == child.PosebniDioChildId).Naziv);
                                            }
                                        }
                                        break;
                                    case 2:
                                        var masterUmjesecu2 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu2.PeriodId != null && masterUmjesecu2.PeriodId == prMaster.PeriodId)
                                        {
                                            uplataMj2 = (decimal)masterUmjesecu2.Uplaceno;
                                            Zaduzenje += (decimal)masterUmjesecu2.Zaduzenje;
                                            foreach (var child in masterUmjesecu2.PricuvaRezijePosebniDioChildren)
                                            {
                                                listChildrenMj2.Add(pdChildren.FirstOrDefault(p => p.Id == child.PosebniDioChildId).Naziv);
                                            }
                                        }
                                        break;
                                    case 3:
                                        var masterUmjesecu3 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu3.PeriodId != null && masterUmjesecu3.PeriodId == prMaster.PeriodId)
                                        {
                                            uplataMj3 = (decimal)masterUmjesecu3.Uplaceno;
                                            Zaduzenje += (decimal)masterUmjesecu3.Zaduzenje;
                                            foreach (var child in masterUmjesecu3.PricuvaRezijePosebniDioChildren)
                                            {
                                                listChildrenMj3.Add(pdChildren.FirstOrDefault(p => p.Id == child.PosebniDioChildId).Naziv);
                                            }
                                        }
                                        break;
                                    case 4:
                                        var masterUmjesecu4 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu4.PeriodId != null && masterUmjesecu4.PeriodId == prMaster.PeriodId)
                                        {
                                            uplataMj4 = (decimal)masterUmjesecu4.Uplaceno;
                                            Zaduzenje += (decimal)masterUmjesecu4.Zaduzenje;
                                            foreach (var child in masterUmjesecu4.PricuvaRezijePosebniDioChildren)
                                            {
                                                listChildrenMj4.Add(pdChildren.FirstOrDefault(p => p.Id == child.PosebniDioChildId).Naziv);
                                            }
                                        }
                                        break;
                                    case 5:
                                        var masterUmjesecu5 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu5.PeriodId != null && masterUmjesecu5.PeriodId == prMaster.PeriodId)
                                        {
                                            uplataMj5 = (decimal)masterUmjesecu5.Uplaceno;
                                            Zaduzenje += (decimal)masterUmjesecu5.Zaduzenje;
                                            foreach (var child in masterUmjesecu5.PricuvaRezijePosebniDioChildren)
                                            {
                                                listChildrenMj5.Add(pdChildren.FirstOrDefault(p => p.Id == child.PosebniDioChildId).Naziv);
                                            }
                                        }
                                        break;
                                    case 6:
                                        var masterUmjesecu6 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu6.PeriodId != null && masterUmjesecu6.PeriodId == prMaster.PeriodId)
                                        {
                                            uplataMj6 = (decimal)masterUmjesecu6.Uplaceno;
                                            Zaduzenje += (decimal)masterUmjesecu6.Zaduzenje;
                                            foreach (var child in masterUmjesecu6.PricuvaRezijePosebniDioChildren)
                                            {
                                                listChildrenMj6.Add(pdChildren.FirstOrDefault(p => p.Id == child.PosebniDioChildId).Naziv);
                                            }
                                        }
                                        break;
                                    case 7:
                                        var masterUmjesecu7 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu7.PeriodId != null && masterUmjesecu7.PeriodId == prMaster.PeriodId)
                                        {
                                            uplataMj7 = (decimal)masterUmjesecu7.Uplaceno;
                                            Zaduzenje += (decimal)masterUmjesecu7.Zaduzenje;
                                            foreach (var child in masterUmjesecu7.PricuvaRezijePosebniDioChildren)
                                            {
                                                listChildrenMj7.Add(pdChildren.FirstOrDefault(p => p.Id == child.PosebniDioChildId).Naziv);
                                            }
                                        }
                                        break;
                                    case 8:
                                        var masterUmjesecu8 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu8.PeriodId != null && masterUmjesecu8.PeriodId == prMaster.PeriodId)
                                        {
                                            uplataMj8 = (decimal)masterUmjesecu8.Uplaceno;
                                            Zaduzenje += (decimal)masterUmjesecu8.Zaduzenje;
                                            foreach (var child in masterUmjesecu8.PricuvaRezijePosebniDioChildren)
                                            {
                                                listChildrenMj8.Add(pdChildren.FirstOrDefault(p => p.Id == child.PosebniDioChildId).Naziv);
                                            }
                                        }
                                        break;
                                    case 9:
                                        var masterUmjesecu9 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu9.PeriodId != null && masterUmjesecu9.PeriodId == prMaster.PeriodId)
                                        {
                                            uplataMj9 = (decimal)masterUmjesecu9.Uplaceno;
                                            Zaduzenje += (decimal)masterUmjesecu9.Zaduzenje;
                                            foreach (var child in masterUmjesecu9.PricuvaRezijePosebniDioChildren)
                                            {
                                                listChildrenMj9.Add(pdChildren.FirstOrDefault(p => p.Id == child.PosebniDioChildId).Naziv);
                                            }
                                        }
                                        break;
                                    case 10:
                                        var masterUmjesecu10 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu10.PeriodId != null && masterUmjesecu10.PeriodId == prMaster.PeriodId)
                                        {
                                            uplataMj10 = (decimal)masterUmjesecu10.Uplaceno;
                                            Zaduzenje += (decimal)masterUmjesecu10.Zaduzenje;
                                            foreach (var child in masterUmjesecu10.PricuvaRezijePosebniDioChildren)
                                            {
                                                listChildrenMj10.Add(pdChildren.FirstOrDefault(p => p.Id == child.PosebniDioChildId).Naziv);
                                            }
                                        }
                                        break;
                                    case 11:
                                        var masterUmjesecu11 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu11.PeriodId != null && masterUmjesecu11.PeriodId == prMaster.PeriodId)
                                        {
                                            uplataMj11 = (decimal)masterUmjesecu11.Uplaceno;
                                            Zaduzenje += (decimal)masterUmjesecu11.Zaduzenje;
                                            foreach (var child in masterUmjesecu11.PricuvaRezijePosebniDioChildren)
                                            {
                                                listChildrenMj11.Add(pdChildren.FirstOrDefault(p => p.Id == child.PosebniDioChildId).Naziv);
                                            }
                                        }
                                        break;
                                    case 12:
                                        var masterUmjesecu12 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu12.PeriodId != null && masterUmjesecu12.PeriodId == prMaster.PeriodId)
                                        {
                                            uplataMj12 = (decimal)masterUmjesecu12.Uplaceno;
                                            Zaduzenje += (decimal)masterUmjesecu12.Zaduzenje;
                                            foreach (var child in masterUmjesecu12.PricuvaRezijePosebniDioChildren)
                                            {
                                                listChildrenMj12.Add(pdChildren.FirstOrDefault(p => p.Id == child.PosebniDioChildId).Naziv);
                                            }
                                        }
                                        break;
                                }
                            }

                            decimal StanjeOd = 0; // TODO
                            decimal Uplaceno = uplataMj1 + uplataMj2 + uplataMj3 + uplataMj4 + uplataMj5 + uplataMj6 + uplataMj7 + uplataMj8 + uplataMj9 + uplataMj10 + uplataMj11 + uplataMj12;
                            decimal Dug = Uplaceno + StanjeOd - Zaduzenje;

                            var row = new PricuvaRezijeGodinaStructure
                            {
                                prPeriodId = (int)prMaster.PeriodId,
                                PosebniDioMasterId = (int)prMaster.PosebniDioMasterId,
                                PosebniDioMasterNaziv = prMasterNaziv,
                                Vlasnici = vlasniciList,
                                Zaduzenje = Zaduzenje,
                                Dug = Dug,
                                Uplaceno = Uplaceno,
                                Mj1 = uplataMj1,
                                Mj2 = uplataMj2,
                                Mj3 = uplataMj3,
                                Mj4 = uplataMj4,
                                Mj5 = uplataMj5,
                                Mj6 = uplataMj6,
                                Mj7 = uplataMj7,
                                Mj8 = uplataMj8,
                                Mj9 = uplataMj9,
                                Mj10 = uplataMj10,
                                Mj11 = uplataMj11,
                                Mj12 = uplataMj12,
                                PDChildrenMj1 = listChildrenMj1,
                                PDChildrenMj2 = listChildrenMj2,
                                PDChildrenMj3 = listChildrenMj3,
                                PDChildrenMj4 = listChildrenMj4,
                                PDChildrenMj5 = listChildrenMj5,
                                PDChildrenMj6 = listChildrenMj6,
                                PDChildrenMj7 = listChildrenMj7,
                                PDChildrenMj8 = listChildrenMj8,
                                PDChildrenMj9 = listChildrenMj9,
                                PDChildrenMj10 = listChildrenMj10,
                                PDChildrenMj11 = listChildrenMj11,
                                PDChildrenMj12 = listChildrenMj12,
                                StanjeOd = 0
                            };
                            tbl.Add(row);
                        }
                    }
                }
            }

            return tbl;
        }
    }

    public class PricuvaRezijeGodinaStructure
    {
        public int prPeriodId { get; set; }
        public int PosebniDioMasterId { get; set; }
        public string PosebniDioMasterNaziv { get; set; }
        public List<string> Vlasnici { get; set; }
        public decimal Dug { get; set; }
        public decimal Zaduzenje { get; set; }
        public decimal Uplaceno { get; set; }
        public decimal Mj1 { get; set; }
        public decimal Mj2 { get; set; }
        public decimal Mj3 { get; set; }
        public decimal Mj4 { get; set; }
        public decimal Mj5 { get; set; }
        public decimal Mj6 { get; set; }
        public decimal Mj7 { get; set; }
        public decimal Mj8 { get; set; }
        public decimal Mj9 { get; set; }
        public decimal Mj10 { get; set; }
        public decimal Mj11 { get; set; }
        public decimal Mj12 { get; set; }
        public List<string> PDChildrenMj1 { get; set; }
        public List<string> PDChildrenMj2 { get; set; }
        public List<string> PDChildrenMj3 { get; set; }
        public List<string> PDChildrenMj4 { get; set; }
        public List<string> PDChildrenMj5 { get; set; }
        public List<string> PDChildrenMj6 { get; set; }
        public List<string> PDChildrenMj7 { get; set; }
        public List<string> PDChildrenMj8 { get; set; }
        public List<string> PDChildrenMj9 { get; set; }
        public List<string> PDChildrenMj10 { get; set; }
        public List<string> PDChildrenMj11 { get; set; }
        public List<string> PDChildrenMj12 { get; set; }
        public decimal StanjeOd { get; set; }
    }


}