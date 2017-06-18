using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ZgradaApp
{
    public class PricuvaRezijeGodinaTable
    {
        List<PricuvaRezijeGodinaStructure> tbl = new List<PricuvaRezijeGodinaStructure>();

        public List<PricuvaRezijeGodinaStructure> getPricuvaRezijeGodinaTable(PricuvaRezijeGodina prGodina, List<Zgrade_PosebniDijeloviMaster> masteri, List<Zgrade_Stanari> stanari, List<PrihodiRashodi_Prihodi> prihodi)
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

                            decimal ZaduzenjePricuva = 0;
                            decimal ZaduzenjeRezije = 0;
                            decimal pocetnoStanjePocetakObracunaPDa = 0;
                            decimal zaduzenjeMjesecPricuva = 0;
                            decimal zaduzenjeMjesecRezije = 0;

                            foreach (var recMjesec in prGodina.PricuvaRezijeMjesec)
                            {
                                switch (recMjesec.Mjesec)
                                {
                                    case 1:
                                        var masterUmjesecu1 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu1 != null && masterUmjesecu1.PeriodId != null && masterUmjesecu1.PeriodId == prMaster.PeriodId)
                                        {
                                            //uplataMj1 = masterUmjesecu1.Uplaceno != null ? (decimal)masterUmjesecu1.Uplaceno : 0;
                                            uplataMj1 = (decimal)prihodi.Where(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId && p.Mjesec == 1).Sum(p => p.IznosUplacen);
                                            ZaduzenjePricuva += masterUmjesecu1.ZaduzenjePricuva != null ? (decimal)masterUmjesecu1.ZaduzenjePricuva : 0;
                                            ZaduzenjeRezije += masterUmjesecu1.ZaduzenjeRezije != null ? (decimal)masterUmjesecu1.ZaduzenjeRezije : 0;
                                            // PocetnoStanje imamo za svaki master za svaki mjesec
                                            decimal pocetno = 0; 
                                            if (masterUmjesecu1.PocetnoStanje != null)
                                            {
                                                pocetno = (decimal)masterUmjesecu1.PocetnoStanje;
                                                pocetnoStanjePocetakObracunaPDa = pocetno;
                                            }
                                            else
                                                pocetno = masterUmjesecu1.StanjeOd != null ? (decimal)masterUmjesecu1.StanjeOd : 0;
                                            
                                            saldoListMj1.Add(pocetno);
                                            zaduzenjeMjesecPricuva = masterUmjesecu1.ZaduzenjePricuva != null ? (decimal)masterUmjesecu1.ZaduzenjePricuva : 0;
                                            zaduzenjeMjesecRezije = masterUmjesecu1.ZaduzenjeRezije != null ? (decimal)masterUmjesecu1.ZaduzenjeRezije : 0;
                                            //saldoListMj1.Add(zaduzenjeMjesecPricuva + zaduzenjeMjesecRezije);
                                            saldoListMj1.Add(0 - zaduzenjeMjesecPricuva);
                                            saldoListMj1.Add(0 - zaduzenjeMjesecRezije);
                                            decimal saldo = pocetno + uplataMj1 - zaduzenjeMjesecPricuva - zaduzenjeMjesecRezije; // u saldu pocetno stanje ne treba jer je uracunato u zaduzenje prilikom obracuna
                                            saldoListMj1.Add(saldo);
                                        }
                                        break;
                                    case 2:
                                        var masterUmjesecu2 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu2 != null && masterUmjesecu2.PeriodId != null && masterUmjesecu2.PeriodId == prMaster.PeriodId)
                                        {
                                            //uplataMj2 = masterUmjesecu2.Uplaceno != null ? (decimal)masterUmjesecu2.Uplaceno : 0;
                                            uplataMj2 = (decimal)prihodi.Where(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId && p.Mjesec == 2).Sum(p => p.IznosUplacen);
                                            ZaduzenjePricuva += masterUmjesecu2.ZaduzenjePricuva != null ? (decimal)masterUmjesecu2.ZaduzenjePricuva : 0;
                                            ZaduzenjeRezije += masterUmjesecu2.ZaduzenjeRezije != null ? (decimal)masterUmjesecu2.ZaduzenjeRezije : 0;
                                            decimal pocetno = 0;
                                            if (masterUmjesecu2.PocetnoStanje != null)
                                            {
                                                pocetno = (decimal)masterUmjesecu2.PocetnoStanje;
                                                pocetnoStanjePocetakObracunaPDa = pocetno;
                                            }
                                            else
                                                pocetno = masterUmjesecu2.StanjeOd != null ? (decimal)masterUmjesecu2.StanjeOd : 0;
                                            saldoListMj2.Add(pocetno);
                                            zaduzenjeMjesecPricuva = masterUmjesecu2.ZaduzenjePricuva != null ? (decimal)masterUmjesecu2.ZaduzenjePricuva : 0;
                                            zaduzenjeMjesecRezije = masterUmjesecu2.ZaduzenjeRezije != null ? (decimal)masterUmjesecu2.ZaduzenjeRezije : 0;
                                            //saldoListMj2.Add(zaduzenjeMjesecPricuva + zaduzenjeMjesecRezije);
                                            saldoListMj2.Add(0 - zaduzenjeMjesecPricuva);
                                            saldoListMj2.Add(0 - zaduzenjeMjesecRezije);
                                            decimal saldo = pocetno + uplataMj2 - zaduzenjeMjesecPricuva - zaduzenjeMjesecRezije;
                                            saldoListMj2.Add(saldo);
                                        }
                                        break;
                                    case 3:
                                        var masterUmjesecu3 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu3 != null && masterUmjesecu3.PeriodId != null && masterUmjesecu3.PeriodId == prMaster.PeriodId)
                                        {
                                            //uplataMj3 = masterUmjesecu3.Uplaceno != null ? (decimal)masterUmjesecu3.Uplaceno : 0;
                                            uplataMj3 = (decimal)prihodi.Where(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId && p.Mjesec == 3).Sum(p => p.IznosUplacen);
                                            ZaduzenjePricuva += masterUmjesecu3.ZaduzenjePricuva != null ? (decimal)masterUmjesecu3.ZaduzenjePricuva : 0;
                                            ZaduzenjeRezije += masterUmjesecu3.ZaduzenjeRezije != null ? (decimal)masterUmjesecu3.ZaduzenjeRezije : 0;
                                            decimal pocetno = 0;
                                            if (masterUmjesecu3.PocetnoStanje != null)
                                            {
                                                pocetno = (decimal)masterUmjesecu3.PocetnoStanje;
                                                pocetnoStanjePocetakObracunaPDa = pocetno;
                                            }
                                            else
                                                pocetno = masterUmjesecu3.StanjeOd != null ? (decimal)masterUmjesecu3.StanjeOd : 0;
                                            saldoListMj3.Add(pocetno);
                                            zaduzenjeMjesecPricuva = masterUmjesecu3.ZaduzenjePricuva != null ? (decimal)masterUmjesecu3.ZaduzenjePricuva : 0;
                                            zaduzenjeMjesecRezije = masterUmjesecu3.ZaduzenjeRezije != null ? (decimal)masterUmjesecu3.ZaduzenjeRezije : 0;
                                            saldoListMj3.Add(0 - zaduzenjeMjesecPricuva);
                                            saldoListMj3.Add(0 - zaduzenjeMjesecRezije);
                                            decimal saldo = pocetno + uplataMj3 - zaduzenjeMjesecPricuva - zaduzenjeMjesecRezije;
                                            saldoListMj3.Add(saldo);
                                        }
                                        break;
                                    case 4:
                                        var masterUmjesecu4 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu4 != null &&  masterUmjesecu4.PeriodId != null && masterUmjesecu4.PeriodId == prMaster.PeriodId)
                                        {
                                            //uplataMj4 = masterUmjesecu4.Uplaceno != null ? (decimal)masterUmjesecu4.Uplaceno : 0;
                                            uplataMj4 = (decimal)prihodi.Where(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId && p.Mjesec == 4).Sum(p => p.IznosUplacen);
                                            ZaduzenjePricuva += masterUmjesecu4.ZaduzenjePricuva != null ? (decimal)masterUmjesecu4.ZaduzenjePricuva : 0;
                                            ZaduzenjeRezije += masterUmjesecu4.ZaduzenjeRezije != null ? (decimal)masterUmjesecu4.ZaduzenjeRezije : 0;
                                            decimal pocetno = 0;
                                            if (masterUmjesecu4.PocetnoStanje != null)
                                            {
                                                pocetno = (decimal)masterUmjesecu4.PocetnoStanje;
                                                pocetnoStanjePocetakObracunaPDa = pocetno;
                                            }
                                            else
                                                pocetno = masterUmjesecu4.StanjeOd != null ? (decimal)masterUmjesecu4.StanjeOd : 0;
                                            saldoListMj4.Add(pocetno);
                                            zaduzenjeMjesecPricuva = masterUmjesecu4.ZaduzenjePricuva != null ? (decimal)masterUmjesecu4.ZaduzenjePricuva : 0;
                                            zaduzenjeMjesecRezije = masterUmjesecu4.ZaduzenjeRezije != null ? (decimal)masterUmjesecu4.ZaduzenjeRezije : 0;
                                            saldoListMj4.Add(0 - zaduzenjeMjesecPricuva);
                                            saldoListMj4.Add(0 - zaduzenjeMjesecRezije);
                                            decimal saldo = pocetno + uplataMj4 - zaduzenjeMjesecPricuva - zaduzenjeMjesecRezije;
                                            saldoListMj4.Add(saldo);
                                        }
                                        break;
                                    case 5:
                                        var masterUmjesecu5 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu5 != null && masterUmjesecu5.PeriodId != null && masterUmjesecu5.PeriodId == prMaster.PeriodId)
                                        {
                                            //uplataMj5 = masterUmjesecu5.Uplaceno != null ? (decimal)masterUmjesecu5.Uplaceno : 0;
                                            uplataMj5 = (decimal)prihodi.Where(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId && p.Mjesec == 5).Sum(p => p.IznosUplacen);
                                            ZaduzenjePricuva += masterUmjesecu5.ZaduzenjePricuva != null ? (decimal)masterUmjesecu5.ZaduzenjePricuva : 0;
                                            ZaduzenjeRezije += masterUmjesecu5.ZaduzenjeRezije != null ? (decimal)masterUmjesecu5.ZaduzenjeRezije : 0;
                                            decimal pocetno = 0;
                                            if (masterUmjesecu5.PocetnoStanje != null)
                                            {
                                                pocetno = (decimal)masterUmjesecu5.PocetnoStanje;
                                                pocetnoStanjePocetakObracunaPDa = pocetno;
                                            }
                                            else
                                                pocetno = masterUmjesecu5.StanjeOd != null ? (decimal)masterUmjesecu5.StanjeOd : 0;
                                            saldoListMj5.Add(pocetno);
                                            zaduzenjeMjesecPricuva = masterUmjesecu5.ZaduzenjePricuva != null ? (decimal)masterUmjesecu5.ZaduzenjePricuva : 0;
                                            zaduzenjeMjesecRezije = masterUmjesecu5.ZaduzenjeRezije != null ? (decimal)masterUmjesecu5.ZaduzenjeRezije : 0;
                                            saldoListMj5.Add(0 - zaduzenjeMjesecPricuva);
                                            saldoListMj5.Add(0 - zaduzenjeMjesecRezije);
                                            decimal saldo = pocetno + uplataMj5 - zaduzenjeMjesecPricuva - zaduzenjeMjesecRezije;
                                            saldoListMj5.Add(saldo);
                                        }
                                        break;
                                    case 6:
                                        var masterUmjesecu6 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu6 != null && masterUmjesecu6.PeriodId != null && masterUmjesecu6.PeriodId == prMaster.PeriodId)
                                        {
                                            //uplataMj6 = masterUmjesecu6.Uplaceno != null ? (decimal)masterUmjesecu6.Uplaceno : 0;
                                            uplataMj6 = (decimal)prihodi.Where(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId && p.Mjesec == 6).Sum(p => p.IznosUplacen);
                                            ZaduzenjePricuva += masterUmjesecu6.ZaduzenjePricuva != null ? (decimal)masterUmjesecu6.ZaduzenjePricuva : 0;
                                            ZaduzenjeRezije += masterUmjesecu6.ZaduzenjeRezije != null ? (decimal)masterUmjesecu6.ZaduzenjeRezije : 0;
                                            decimal pocetno = 0;
                                            if (masterUmjesecu6.PocetnoStanje != null)
                                            {
                                                pocetno = (decimal)masterUmjesecu6.PocetnoStanje;
                                                pocetnoStanjePocetakObracunaPDa = pocetno;
                                            }
                                            else
                                                pocetno = masterUmjesecu6.StanjeOd != null ? (decimal)masterUmjesecu6.StanjeOd : 0;
                                            saldoListMj6.Add(pocetno);
                                            zaduzenjeMjesecPricuva = masterUmjesecu6.ZaduzenjePricuva != null ? (decimal)masterUmjesecu6.ZaduzenjePricuva : 0;
                                            zaduzenjeMjesecRezije = masterUmjesecu6.ZaduzenjeRezije != null ? (decimal)masterUmjesecu6.ZaduzenjeRezije : 0;
                                            saldoListMj6.Add(0 - zaduzenjeMjesecPricuva);
                                            saldoListMj6.Add(0 - zaduzenjeMjesecRezije);
                                            decimal saldo = pocetno + uplataMj6 - zaduzenjeMjesecPricuva - zaduzenjeMjesecRezije;
                                            saldoListMj6.Add(saldo);
                                        }
                                        break;
                                    case 7:
                                        var masterUmjesecu7 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu7 != null && masterUmjesecu7.PeriodId != null && masterUmjesecu7.PeriodId == prMaster.PeriodId)
                                        {
                                            //uplataMj7 = masterUmjesecu7.Uplaceno != null ? (decimal)masterUmjesecu7.Uplaceno : 0;
                                            uplataMj7 = (decimal)prihodi.Where(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId && p.Mjesec == 7).Sum(p => p.IznosUplacen);
                                            ZaduzenjePricuva += masterUmjesecu7.ZaduzenjePricuva != null ? (decimal)masterUmjesecu7.ZaduzenjePricuva : 0;
                                            ZaduzenjeRezije += masterUmjesecu7.ZaduzenjeRezije != null ? (decimal)masterUmjesecu7.ZaduzenjeRezije : 0;
                                            decimal pocetno = 0;
                                            if (masterUmjesecu7.PocetnoStanje != null)
                                            {
                                                pocetno = (decimal)masterUmjesecu7.PocetnoStanje;
                                                pocetnoStanjePocetakObracunaPDa = pocetno;
                                            }
                                            else
                                                pocetno = masterUmjesecu7.StanjeOd != null ? (decimal)masterUmjesecu7.StanjeOd : 0;
                                            saldoListMj6.Add(pocetno);
                                            zaduzenjeMjesecPricuva = masterUmjesecu7.ZaduzenjePricuva != null ? (decimal)masterUmjesecu7.ZaduzenjePricuva : 0;
                                            zaduzenjeMjesecRezije = masterUmjesecu7.ZaduzenjeRezije != null ? (decimal)masterUmjesecu7.ZaduzenjeRezije : 0;
                                            saldoListMj7.Add(0 - zaduzenjeMjesecPricuva);
                                            saldoListMj7.Add(0 - zaduzenjeMjesecRezije);
                                            decimal saldo = pocetno + uplataMj7 - zaduzenjeMjesecPricuva - zaduzenjeMjesecRezije;
                                            saldoListMj7.Add(saldo);
                                        }
                                        break;
                                    case 8:
                                        var masterUmjesecu8 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu8 != null && masterUmjesecu8.PeriodId != null && masterUmjesecu8.PeriodId == prMaster.PeriodId)
                                        {
                                            //uplataMj8 = masterUmjesecu8.Uplaceno != null ? (decimal)masterUmjesecu8.Uplaceno : 0;
                                            uplataMj8 = (decimal)prihodi.Where(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId && p.Mjesec == 8).Sum(p => p.IznosUplacen);
                                            ZaduzenjePricuva += masterUmjesecu8.ZaduzenjePricuva != null ? (decimal)masterUmjesecu8.ZaduzenjePricuva : 0;
                                            ZaduzenjeRezije += masterUmjesecu8.ZaduzenjeRezije != null ? (decimal)masterUmjesecu8.ZaduzenjeRezije : 0;
                                            decimal pocetno = 0;
                                            if (masterUmjesecu8.PocetnoStanje != null)
                                            {
                                                pocetno = (decimal)masterUmjesecu8.PocetnoStanje;
                                                pocetnoStanjePocetakObracunaPDa = pocetno;
                                            }
                                            else
                                                pocetno = masterUmjesecu8.StanjeOd != null ? (decimal)masterUmjesecu8.StanjeOd : 0;
                                            saldoListMj8.Add(pocetno);
                                            zaduzenjeMjesecPricuva = masterUmjesecu8.ZaduzenjePricuva != null ? (decimal)masterUmjesecu8.ZaduzenjePricuva : 0;
                                            zaduzenjeMjesecRezije = masterUmjesecu8.ZaduzenjeRezije != null ? (decimal)masterUmjesecu8.ZaduzenjeRezije : 0;
                                            saldoListMj8.Add(0 - zaduzenjeMjesecPricuva);
                                            saldoListMj8.Add(0 - zaduzenjeMjesecRezije);
                                            decimal saldo = pocetno + uplataMj8 - zaduzenjeMjesecPricuva - zaduzenjeMjesecRezije;
                                            saldoListMj8.Add(saldo);
                                        }
                                        break;
                                    case 9:
                                        var masterUmjesecu9 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu9 != null && masterUmjesecu9.PeriodId != null && masterUmjesecu9.PeriodId == prMaster.PeriodId)
                                        {
                                            //uplataMj1 = masterUmjesecu9.Uplaceno != null ? (decimal)masterUmjesecu9.Uplaceno : 0;
                                            uplataMj9 = (decimal)prihodi.Where(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId && p.Mjesec == 9).Sum(p => p.IznosUplacen);
                                            ZaduzenjePricuva += masterUmjesecu9.ZaduzenjePricuva != null ? (decimal)masterUmjesecu9.ZaduzenjePricuva : 0;
                                            ZaduzenjeRezije += masterUmjesecu9.ZaduzenjeRezije != null ? (decimal)masterUmjesecu9.ZaduzenjeRezije : 0;
                                            decimal pocetno = 0;
                                            if (masterUmjesecu9.PocetnoStanje != null)
                                            {
                                                pocetno = (decimal)masterUmjesecu9.PocetnoStanje;
                                                pocetnoStanjePocetakObracunaPDa = pocetno;
                                            }
                                            else
                                                pocetno = masterUmjesecu9.StanjeOd != null ? (decimal)masterUmjesecu9.StanjeOd : 0;
                                            saldoListMj9.Add(pocetno);
                                            zaduzenjeMjesecPricuva = masterUmjesecu9.ZaduzenjePricuva != null ? (decimal)masterUmjesecu9.ZaduzenjePricuva : 0;
                                            zaduzenjeMjesecRezije = masterUmjesecu9.ZaduzenjeRezije != null ? (decimal)masterUmjesecu9.ZaduzenjeRezije : 0;
                                            saldoListMj9.Add(0 - zaduzenjeMjesecPricuva);
                                            saldoListMj9.Add(0 - zaduzenjeMjesecRezije);
                                            decimal saldo = pocetno + uplataMj9 - zaduzenjeMjesecPricuva - zaduzenjeMjesecRezije;
                                            saldoListMj9.Add(saldo);
                                        }
                                        break;
                                    case 10:
                                        var masterUmjesecu10 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu10 != null && masterUmjesecu10.PeriodId != null && masterUmjesecu10.PeriodId == prMaster.PeriodId)
                                        {
                                            //uplataMj10 = masterUmjesecu10.Uplaceno != null ? (decimal)masterUmjesecu10.Uplaceno : 0;
                                            uplataMj10 = (decimal)prihodi.Where(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId && p.Mjesec == 10).Sum(p => p.IznosUplacen);
                                            ZaduzenjePricuva += masterUmjesecu10.ZaduzenjePricuva != null ? (decimal)masterUmjesecu10.ZaduzenjePricuva : 0;
                                            ZaduzenjeRezije += masterUmjesecu10.ZaduzenjeRezije != null ? (decimal)masterUmjesecu10.ZaduzenjeRezije : 0;
                                            decimal pocetno = 0;
                                            if (masterUmjesecu10.PocetnoStanje != null)
                                            {
                                                pocetno = (decimal)masterUmjesecu10.PocetnoStanje;
                                                pocetnoStanjePocetakObracunaPDa = pocetno;
                                            }
                                            else
                                                pocetno = masterUmjesecu10.StanjeOd != null ? (decimal)masterUmjesecu10.StanjeOd : 0;
                                            saldoListMj10.Add(pocetno);
                                            zaduzenjeMjesecPricuva = masterUmjesecu10.ZaduzenjePricuva != null ? (decimal)masterUmjesecu10.ZaduzenjePricuva : 0;
                                            zaduzenjeMjesecRezije = masterUmjesecu10.ZaduzenjeRezije != null ? (decimal)masterUmjesecu10.ZaduzenjeRezije : 0;
                                            saldoListMj10.Add(0 - zaduzenjeMjesecPricuva);
                                            saldoListMj10.Add(0 - zaduzenjeMjesecRezije);
                                            decimal saldo = pocetno + uplataMj10 - zaduzenjeMjesecPricuva - zaduzenjeMjesecRezije;
                                            saldoListMj10.Add(saldo);
                                        }
                                        break;
                                    case 11:
                                        var masterUmjesecu11 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu11 != null && masterUmjesecu11.PeriodId != null && masterUmjesecu11.PeriodId == prMaster.PeriodId)
                                        {
                                            //uplataMj11 = masterUmjesecu11.Uplaceno != null ? (decimal)masterUmjesecu11.Uplaceno : 0;
                                            uplataMj11 = (decimal)prihodi.Where(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId && p.Mjesec == 11).Sum(p => p.IznosUplacen);
                                            ZaduzenjePricuva += masterUmjesecu11.ZaduzenjePricuva != null ? (decimal)masterUmjesecu11.ZaduzenjePricuva : 0;
                                            ZaduzenjeRezije += masterUmjesecu11.ZaduzenjeRezije != null ? (decimal)masterUmjesecu11.ZaduzenjeRezije : 0;
                                            decimal pocetno = 0;
                                            if (masterUmjesecu11.PocetnoStanje != null)
                                            {
                                                pocetno = (decimal)masterUmjesecu11.PocetnoStanje;
                                                pocetnoStanjePocetakObracunaPDa = pocetno;
                                            }
                                            else
                                                pocetno = masterUmjesecu11.StanjeOd != null ? (decimal)masterUmjesecu11.StanjeOd : 0;
                                            saldoListMj11.Add(pocetno);
                                            zaduzenjeMjesecPricuva = masterUmjesecu11.ZaduzenjePricuva != null ? (decimal)masterUmjesecu11.ZaduzenjePricuva : 0;
                                            zaduzenjeMjesecRezije = masterUmjesecu11.ZaduzenjeRezije != null ? (decimal)masterUmjesecu11.ZaduzenjeRezije : 0;
                                            saldoListMj11.Add(0 - zaduzenjeMjesecPricuva);
                                            saldoListMj11.Add(0 - zaduzenjeMjesecRezije);
                                            decimal saldo = pocetno + uplataMj11 - zaduzenjeMjesecPricuva - zaduzenjeMjesecRezije;
                                            saldoListMj11.Add(saldo);
                                        }
                                        break;
                                    case 12:
                                        var masterUmjesecu12 = recMjesec.PricuvaRezijePosebniDioMasteri.FirstOrDefault(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId);
                                        if (masterUmjesecu12 != null && masterUmjesecu12.PeriodId != null && masterUmjesecu12.PeriodId == prMaster.PeriodId)
                                        {
                                            //uplataMj12 = masterUmjesecu12.Uplaceno != null ? (decimal)masterUmjesecu12.Uplaceno : 0;
                                            uplataMj12 = (decimal)prihodi.Where(p => p.PosebniDioMasterId == prMaster.PosebniDioMasterId && p.Mjesec == 12).Sum(p => p.IznosUplacen);
                                            ZaduzenjePricuva += masterUmjesecu12.ZaduzenjePricuva != null ? (decimal)masterUmjesecu12.ZaduzenjePricuva : 0;
                                            ZaduzenjeRezije += masterUmjesecu12.ZaduzenjeRezije != null ? (decimal)masterUmjesecu12.ZaduzenjeRezije : 0;
                                            decimal pocetno = 0;
                                            if (masterUmjesecu12.PocetnoStanje != null)
                                            {
                                                pocetno = (decimal)masterUmjesecu12.PocetnoStanje;
                                                pocetnoStanjePocetakObracunaPDa = pocetno;
                                            }
                                            else
                                                pocetno = masterUmjesecu12.StanjeOd != null ? (decimal)masterUmjesecu12.StanjeOd : 0;
                                            saldoListMj12.Add(pocetno);
                                            zaduzenjeMjesecPricuva = masterUmjesecu12.ZaduzenjePricuva != null ? (decimal)masterUmjesecu12.ZaduzenjePricuva : 0;
                                            zaduzenjeMjesecRezije = masterUmjesecu12.ZaduzenjeRezije != null ? (decimal)masterUmjesecu12.ZaduzenjeRezije : 0;
                                            saldoListMj12.Add(0 - zaduzenjeMjesecPricuva);
                                            saldoListMj12.Add(0 - zaduzenjeMjesecRezije);
                                            decimal saldo = pocetno + uplataMj12 - zaduzenjeMjesecPricuva - zaduzenjeMjesecRezije;
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

                            decimal Dug = Uplaceno + StanjeOd - (ZaduzenjePricuva + ZaduzenjeRezije) + pocetnoStanjePocetakObracunaPDa;

                            var row = new PricuvaRezijeGodinaStructure
                            {
                                prPeriodId = (int)prMaster.PeriodId,
                                PosebniDioMasterId = (int)prMaster.PosebniDioMasterId,
                                PosebniDioMasterNaziv = prMasterNaziv,
                                Vlasnici = vlasniciList,
                                ZaduzenjePricuva = ZaduzenjePricuva,
                                ZaduzenjeRezije = ZaduzenjeRezije,
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

            return tbl.OrderBy(p => p.PosebniDioMasterId).ToList();
        }
    }

    public class PricuvaRezijeGodinaStructure
    {
        public int prPeriodId { get; set; }
        public int PosebniDioMasterId { get; set; }
        public string PosebniDioMasterNaziv { get; set; }
        public List<string> Vlasnici { get; set; }
        public decimal Dug { get; set; }
        public decimal ZaduzenjePricuva { get; set; }
        public decimal ZaduzenjeRezije { get; set; }
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