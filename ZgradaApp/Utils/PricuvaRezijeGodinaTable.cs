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
                    if (prMaster.PeriodId != null)
                    {
                        if (tbl.Where(p => p.prPeriodId == prMaster.PeriodId).Count() == 0)
                        {
                            var vlasniciList = new List<string>();
                            foreach (var vlasnik in prMaster.PricuvaRezijePosebniDioMasterVlasnici.Where(p => p.PeriodId == prMaster.PeriodId))
                            {
                                var stanaroBJ = stanari.FirstOrDefault(p => p.Id == vlasnik.VlasnikId);
                                vlasniciList.Add(stanaroBJ.Ime + " " + stanaroBJ.Prezime);
                            }

                            var zgradaMaster = masteri.FirstOrDefault(p => p.Id == prMaster.PosebniDioMasterId);
                            var prMasterNaziv = zgradaMaster.Naziv;


                            // Uplate po mjesecima
                            decimal uplataMj1 = 0; decimal uplataMj2 = 0; decimal uplataMj3 = 0; decimal uplataMj4 = 0; decimal uplataMj5 = 0;
                            decimal uplataMj6 = 0; decimal uplataMj7 = 0; decimal uplataMj8 = 0; decimal uplataMj9 = 0; decimal uplataMj10 = 0;
                            decimal uplataMj11 = 0; decimal uplataMj12 = 0;

                            //var listChildrenMj1 = new List<string>(); var listChildrenMj2 = new List<string>(); var listChildrenMj3 = new List<string>();
                            //var listChildrenMj4 = new List<string>(); var listChildrenMj5 = new List<string>(); var listChildrenMj6 = new List<string>();
                            //var listChildrenMj7 = new List<string>(); var listChildrenMj8 = new List<string>(); var listChildrenMj9 = new List<string>();
                            //var listChildrenMj10 = new List<string>(); var listChildrenMj11 = new List<string>(); var listChildrenMj12 = new List<string>();

                            var saldoListMj1 = new List<decimal>(); var saldoListMj2 = new List<decimal>(); var saldoListMj3 = new List<decimal>(); var saldoListMj4 = new List<decimal>();
                            var saldoListMj5 = new List<decimal>(); var saldoListMj6 = new List<decimal>(); var saldoListMj7 = new List<decimal>(); var saldoListMj8 = new List<decimal>();
                            var saldoListMj9 = new List<decimal>(); var saldoListMj10 = new List<decimal>(); var saldoListMj11 = new List<decimal>(); var saldoListMj12 = new List<decimal>();

                            decimal Zaduzenje = 0;

                            foreach (var recMjesec in prGodina.PricuvaRezijeMjesec)
                            {
                                switch (recMjesec.Mjesec)
                                {
                                    case 1:
                                        var masterUmjesecu1 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu1.PeriodId != null && masterUmjesecu1.PeriodId == prMaster.PeriodId)
                                        {
                                            uplataMj1 = (decimal)masterUmjesecu1.Uplaceno;
                                            Zaduzenje += (decimal)masterUmjesecu1.Zaduzenje;
                                            // PocetnoStanje imamo za svaki master za svaki mjesec
                                            decimal pocetno = 0; 
                                            if (masterUmjesecu1.PocetnoStanje != null)
                                                pocetno = (decimal)masterUmjesecu1.PocetnoStanje;
                                            else
                                                pocetno = (decimal)masterUmjesecu1.StanjeOd;
                                            saldoListMj1.Add(pocetno);
                                            saldoListMj1.Add((decimal)masterUmjesecu1.Zaduzenje);
                                            //saldoListMj1.Add((decimal)masterUmjesecu1.Uplaceno); // uplaceno se ionako prikazuje u godisnjoj tablici
                                            decimal saldo = (decimal)masterUmjesecu1.Uplaceno - (decimal)masterUmjesecu1.Zaduzenje; // u saldu pocetno stanje ne treba jer je uracunato u zaduzenje prilikom obracuna
                                            saldoListMj1.Add(saldo);
                                        }
                                        break;
                                    case 2:
                                        var masterUmjesecu2 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu2.PeriodId != null && masterUmjesecu2.PeriodId == prMaster.PeriodId)
                                        {
                                            uplataMj2 = (decimal)masterUmjesecu2.Uplaceno;
                                            Zaduzenje += (decimal)masterUmjesecu2.Zaduzenje;
                                            decimal pocetno = 0;
                                            if (masterUmjesecu2.PocetnoStanje != null)
                                                pocetno = (decimal)masterUmjesecu2.PocetnoStanje;
                                            else
                                                pocetno = (decimal)masterUmjesecu2.StanjeOd;
                                            saldoListMj2.Add(pocetno);
                                            saldoListMj2.Add((decimal)masterUmjesecu2.Zaduzenje);
                                            //saldoListMj2.Add((decimal)masterUmjesecu2.Uplaceno);
                                            decimal saldo = (decimal)masterUmjesecu2.Uplaceno - (decimal)masterUmjesecu2.Zaduzenje;
                                            saldoListMj2.Add(saldo);
                                        }
                                        break;
                                    case 3:
                                        var masterUmjesecu3 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu3.PeriodId != null && masterUmjesecu3.PeriodId == prMaster.PeriodId)
                                        {
                                            uplataMj3 = (decimal)masterUmjesecu3.Uplaceno;
                                            Zaduzenje += (decimal)masterUmjesecu3.Zaduzenje;
                                            decimal pocetno = 0;
                                            if (masterUmjesecu3.PocetnoStanje != null)
                                                pocetno = (decimal)masterUmjesecu3.PocetnoStanje;
                                            else
                                                pocetno = (decimal)masterUmjesecu3.StanjeOd;
                                            saldoListMj3.Add(pocetno);
                                            saldoListMj3.Add((decimal)masterUmjesecu3.Zaduzenje);
                                            //saldoListMj3.Add((decimal)masterUmjesecu3.Uplaceno);
                                            decimal saldo = (decimal)masterUmjesecu3.Uplaceno - (decimal)masterUmjesecu3.Zaduzenje;
                                            saldoListMj3.Add(saldo);
                                        }
                                        break;
                                    case 4:
                                        var masterUmjesecu4 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu4.PeriodId != null && masterUmjesecu4.PeriodId == prMaster.PeriodId)
                                        {
                                            uplataMj4 = (decimal)masterUmjesecu4.Uplaceno;
                                            Zaduzenje += (decimal)masterUmjesecu4.Zaduzenje;
                                            decimal pocetno = 0;
                                            if (masterUmjesecu4.PocetnoStanje != null)
                                                pocetno = (decimal)masterUmjesecu4.PocetnoStanje;
                                            else
                                                pocetno = (decimal)masterUmjesecu4.StanjeOd;
                                            saldoListMj4.Add(pocetno);
                                            saldoListMj4.Add((decimal)masterUmjesecu4.Zaduzenje);
                                            //saldoListMj4.Add((decimal)masterUmjesecu4.Uplaceno);
                                            decimal saldo = (decimal)masterUmjesecu4.Uplaceno - (decimal)masterUmjesecu4.Zaduzenje;
                                            saldoListMj4.Add(saldo);
                                        }
                                        break;
                                    case 5:
                                        var masterUmjesecu5 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu5.PeriodId != null && masterUmjesecu5.PeriodId == prMaster.PeriodId)
                                        {
                                            uplataMj5 = (decimal)masterUmjesecu5.Uplaceno;
                                            Zaduzenje += (decimal)masterUmjesecu5.Zaduzenje;
                                            decimal pocetno = 0;
                                            if (masterUmjesecu5.PocetnoStanje != null)
                                                pocetno = (decimal)masterUmjesecu5.PocetnoStanje;
                                            else
                                                pocetno = (decimal)masterUmjesecu5.StanjeOd;
                                            saldoListMj5.Add(pocetno);
                                            saldoListMj5.Add((decimal)masterUmjesecu5.Zaduzenje);
                                            //saldoListMj5.Add((decimal)masterUmjesecu5.Uplaceno);
                                            decimal saldo = (decimal)masterUmjesecu5.Uplaceno - (decimal)masterUmjesecu5.Zaduzenje;
                                            saldoListMj5.Add(saldo);
                                        }
                                        break;
                                    case 6:
                                        var masterUmjesecu6 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu6.PeriodId != null && masterUmjesecu6.PeriodId == prMaster.PeriodId)
                                        {
                                            uplataMj6 = (decimal)masterUmjesecu6.Uplaceno;
                                            Zaduzenje += (decimal)masterUmjesecu6.Zaduzenje;
                                            decimal pocetno = 0;
                                            if (masterUmjesecu6.PocetnoStanje != null)
                                                pocetno = (decimal)masterUmjesecu6.PocetnoStanje;
                                            else
                                                pocetno = (decimal)masterUmjesecu6.StanjeOd;
                                            saldoListMj6.Add(pocetno);
                                            saldoListMj6.Add((decimal)masterUmjesecu6.Zaduzenje);
                                            //saldoListMj6.Add((decimal)masterUmjesecu6.Uplaceno);
                                            decimal saldo = (decimal)masterUmjesecu6.Uplaceno - (decimal)masterUmjesecu6.Zaduzenje;
                                            saldoListMj6.Add(saldo);
                                        }
                                        break;
                                    case 7:
                                        var masterUmjesecu7 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu7.PeriodId != null && masterUmjesecu7.PeriodId == prMaster.PeriodId)
                                        {
                                            uplataMj7 = (decimal)masterUmjesecu7.Uplaceno;
                                            Zaduzenje += (decimal)masterUmjesecu7.Zaduzenje;
                                            decimal pocetno = 0;
                                            if (masterUmjesecu7.PocetnoStanje != null)
                                                pocetno = (decimal)masterUmjesecu7.PocetnoStanje;
                                            else
                                                pocetno = (decimal)masterUmjesecu7.StanjeOd;
                                            saldoListMj7.Add(pocetno);
                                            saldoListMj7.Add((decimal)masterUmjesecu7.Zaduzenje);
                                            //saldoListMj7.Add((decimal)masterUmjesecu7.Uplaceno);
                                            decimal saldo = (decimal)masterUmjesecu7.Uplaceno - (decimal)masterUmjesecu7.Zaduzenje;
                                            saldoListMj7.Add(saldo);
                                        }
                                        break;
                                    case 8:
                                        var masterUmjesecu8 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu8.PeriodId != null && masterUmjesecu8.PeriodId == prMaster.PeriodId)
                                        {
                                            uplataMj8 = (decimal)masterUmjesecu8.Uplaceno;
                                            Zaduzenje += (decimal)masterUmjesecu8.Zaduzenje;
                                            decimal pocetno = 0;
                                            if (masterUmjesecu8.PocetnoStanje != null)
                                                pocetno = (decimal)masterUmjesecu8.PocetnoStanje;
                                            else
                                                pocetno = (decimal)masterUmjesecu8.StanjeOd;
                                            saldoListMj8.Add(pocetno);
                                            saldoListMj8.Add((decimal)masterUmjesecu8.Zaduzenje);
                                            //saldoListMj8.Add((decimal)masterUmjesecu8.Uplaceno);
                                            decimal saldo = (decimal)masterUmjesecu8.Uplaceno - (decimal)masterUmjesecu8.Zaduzenje;
                                            saldoListMj8.Add(saldo);
                                        }
                                        break;
                                    case 9:
                                        var masterUmjesecu9 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu9.PeriodId != null && masterUmjesecu9.PeriodId == prMaster.PeriodId)
                                        {
                                            uplataMj9 = (decimal)masterUmjesecu9.Uplaceno;
                                            Zaduzenje += (decimal)masterUmjesecu9.Zaduzenje;
                                            decimal pocetno = 0;
                                            if (masterUmjesecu9.PocetnoStanje != null)
                                                pocetno = (decimal)masterUmjesecu9.PocetnoStanje;
                                            else
                                                pocetno = (decimal)masterUmjesecu9.StanjeOd;
                                            saldoListMj9.Add(pocetno);
                                            saldoListMj9.Add((decimal)masterUmjesecu9.Zaduzenje);
                                            //saldoListMj9.Add((decimal)masterUmjesecu9.Uplaceno);
                                            decimal saldo = (decimal)masterUmjesecu9.Uplaceno - (decimal)masterUmjesecu9.Zaduzenje;
                                            saldoListMj9.Add(saldo);
                                        }
                                        break;
                                    case 10:
                                        var masterUmjesecu10 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu10.PeriodId != null && masterUmjesecu10.PeriodId == prMaster.PeriodId)
                                        {
                                            uplataMj10 = (decimal)masterUmjesecu10.Uplaceno;
                                            Zaduzenje += (decimal)masterUmjesecu10.Zaduzenje;
                                            decimal pocetno = 0;
                                            if (masterUmjesecu10.PocetnoStanje != null)
                                                pocetno = (decimal)masterUmjesecu10.PocetnoStanje;
                                            else
                                                pocetno = (decimal)masterUmjesecu10.StanjeOd;
                                            saldoListMj10.Add(pocetno);
                                            saldoListMj10.Add((decimal)masterUmjesecu10.Zaduzenje);
                                            //saldoListMj10.Add((decimal)masterUmjesecu10.Uplaceno);
                                            decimal saldo = (decimal)masterUmjesecu10.Uplaceno - (decimal)masterUmjesecu10.Zaduzenje;
                                            saldoListMj10.Add(saldo);
                                        }
                                        break;
                                    case 11:
                                        var masterUmjesecu11 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu11.PeriodId != null && masterUmjesecu11.PeriodId == prMaster.PeriodId)
                                        {
                                            uplataMj11 = (decimal)masterUmjesecu11.Uplaceno;
                                            Zaduzenje += (decimal)masterUmjesecu11.Zaduzenje;
                                            decimal pocetno = 0;
                                            if (masterUmjesecu11.PocetnoStanje != null)
                                                pocetno = (decimal)masterUmjesecu11.PocetnoStanje;
                                            else
                                                pocetno = (decimal)masterUmjesecu11.StanjeOd;
                                            saldoListMj11.Add(pocetno);
                                            saldoListMj11.Add((decimal)masterUmjesecu11.Zaduzenje);
                                            //saldoListMj11.Add((decimal)masterUmjesecu11.Uplaceno);
                                            decimal saldo = (decimal)masterUmjesecu11.Uplaceno - (decimal)masterUmjesecu11.Zaduzenje;
                                            saldoListMj11.Add(saldo);
                                        }
                                        break;
                                    case 12:
                                        var masterUmjesecu12 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu12.PeriodId != null && masterUmjesecu12.PeriodId == prMaster.PeriodId)
                                        {
                                            uplataMj12 = (decimal)masterUmjesecu12.Uplaceno;
                                            Zaduzenje += (decimal)masterUmjesecu12.Zaduzenje;
                                            decimal pocetno = 0;
                                            if (masterUmjesecu12.PocetnoStanje != null)
                                                pocetno = (decimal)masterUmjesecu12.PocetnoStanje;
                                            else
                                                pocetno = (decimal)masterUmjesecu12.StanjeOd;
                                            saldoListMj12.Add(pocetno);
                                            saldoListMj12.Add((decimal)masterUmjesecu12.Zaduzenje);
                                            //saldoListMj12.Add((decimal)masterUmjesecu12.Uplaceno);
                                            decimal saldo = (decimal)masterUmjesecu12.Uplaceno - (decimal)masterUmjesecu12.Zaduzenje;
                                            saldoListMj12.Add(saldo);
                                        }
                                        break;
                                }
                            }



                            decimal StanjeOd = 0; // TODO
                            var stanje = prGodina.PricuvaRezijeGodina_StanjeOd.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                            if(stanje != null)
                                StanjeOd = (decimal)stanje.StanjeOd;

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
                                //PDChildrenMj1 = listChildrenMj1,
                                //PDChildrenMj2 = listChildrenMj2,
                                //PDChildrenMj3 = listChildrenMj3,
                                //PDChildrenMj4 = listChildrenMj4,
                                //PDChildrenMj5 = listChildrenMj5,
                                //PDChildrenMj6 = listChildrenMj6,
                                //PDChildrenMj7 = listChildrenMj7,
                                //PDChildrenMj8 = listChildrenMj8,
                                //PDChildrenMj9 = listChildrenMj9,
                                //PDChildrenMj10 = listChildrenMj10,
                                //PDChildrenMj11 = listChildrenMj11,
                                //PDChildrenMj12 = listChildrenMj12,
                                StanjeOd = StanjeOd,
                                SaldoMj1 = saldoListMj1,
                                SaldoMj2 = saldoListMj2,
                                SaldoMj3 = saldoListMj3,
                                SaldoMj4 = saldoListMj4,
                                SaldoMj5 = saldoListMj5,
                                SaldoMj6 = saldoListMj6,
                                SaldoMj7 = saldoListMj7,
                                SaldoMj8 = saldoListMj8,
                                SaldoMj9 = saldoListMj9,
                                SaldoMj10 = saldoListMj10,
                                SaldoMj11 = saldoListMj11,
                                SaldoMj12 = saldoListMj12,

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
        public List<decimal> SaldoMj1 { get; set; }
        public List<decimal> SaldoMj2 { get; set; }
        public List<decimal> SaldoMj3 { get; set; }
        public List<decimal> SaldoMj4 { get; set; }
        public List<decimal> SaldoMj5 { get; set; }
        public List<decimal> SaldoMj6 { get; set; }
        public List<decimal> SaldoMj7 { get; set; }
        public List<decimal> SaldoMj8 { get; set; }
        public List<decimal> SaldoMj9 { get; set; }
        public List<decimal> SaldoMj10 { get; set; }
        public List<decimal> SaldoMj11 { get; set; }
        public List<decimal> SaldoMj12 { get; set; }
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