using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ZgradaApp
{
    public class PdfParamsPosebniDio
    {
        public Zgrade_PosebniDijeloviMaster master { get; set; }
        public int godina { get; set; }
        public List<int> mjeseci { get; set; }
        public IEnumerable<PdfKarticaPosebnihDioMjeseci> tBodyList { get; set; }
    }

    public class PdfKarticaPosebnihDioMjeseci
    {
        //var o = {
        //                            periodId: null, mjesec: 0, prihodi: [],
        //                            zaduzenje: 0, pocStanje: 0, stanjeOd: 0, dugPretplata: 0,
        //                            vlasnici: [], posDijelovi: [], displayTotal: false,
        //                            ukupnoPrihodi: 0, ukupnoZaduzenje: 0, ukupnoDugPretplata: 0, ukupno: 0
        //                        };
        public int periodId { get; set; }
        public int mjesec { get; set; }
        public List<PrihodObj> prihodi { get; set; }
        public decimal zaduzenje { get; set; }
        public decimal pocStanje { get; set; }
        public decimal stanjeOd { get; set; }
        public decimal dugPretplata { get; set; }
        public List<VlasnikObj> vlasnici { get; set; }
        public List<posDio> posDijelovi { get; set; }
        public bool displayTotal { get; set; }
        public decimal ukupnoPrihodi { get; set; }
        public decimal ukupnoZaduzenje { get; set; }
        public decimal ukupnoDugPretplata { get; set; }
        public decimal ukupno { get; set; }
    }
    public class PrihodObj
    {
        public string naziv { get; set; }
        public decimal iznos { get; set; }
    }
    public class VlasnikObj
    {
        public string imePrezime { get; set; }
    }
    public class posDio
    {
        public string naziv { get; set; }
    }
}