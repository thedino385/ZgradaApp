using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ZgradaApp
{
    public class clsCommon
    {
    }

    public partial class Zgrade
    {
        public string Status { get; set; }
    }

    public partial class Zgrade_Stanari
    {
        public string Status { get; set; }
    }

    public partial class Zgrade_PosebniDijeloviMaster
    {
        bool val = false;
        public string Status { get; set; }
        public bool VlasniciExpanded
        {
            get { return val; }
            set { val = value; }
        }
        public bool MasteriTemplateExpanded
        {
            get { return val; }
            set { val = value; }
        }
    }

    public partial class Zgrade_PosebniDijeloviChild
    {
        bool val = false;
        public string Status { get; set; }
        public bool Expanded
        {
            get { return val; }
            set { val = value; }
        }
    }

    public partial class Zgrade_PosebniDijeloviMaster_Povrsine
    {
        public string Status { get; set; }
    }

    public partial class Zgrade_PosebniDijeloviMaster_Pripadci
    {
        public string Status { get; set; }
    }

    public partial class Zgrade_PosebniDijeloviMaster_VlasniciPeriod
    {
        public string Status { get; set; }
    }

    public partial class SifarnikRashoda
    {
        public string Status { get; set; }
    }

    public partial class PrihodiRashodi
    {
        public string Status { get; set; }
    }

    public partial class PrihodiRashodi_Prihodi
    {
        public string Status { get; set; }
    }

    public partial class PrihodiRashodi_Rashodi
    {
        public string Status { get; set; }
    }

    public partial class PricuvaRezijeGodina
    {
        public string Status { get; set; }
    }

    public partial class PricuvaRezijeMjesec
    {
        public string Status { get; set; }
    }

    //public partial class PricuvaRezijePosebniDioMasteri
    //{
    //    public decimal DugPretplataProsliMjesec { get; set; }
    //}

    public partial class Zgrade_PopisZajednickihDijelova
    {
        public string Status { get; set; }
    }

    public partial class Zgrade_PopisUredjaja
    {
        public string Status { get; set; }
    }

    public class ZgradaUseri
    {
        public Zgrade Zgrada { get; set; }
        public List<vUseriSvi> Useri { get; set; }
        public int userId { get; set; }

    }

    public partial class Zgrade_DnevnikRadaDetails
    {
        public string Status { get; set; }
    }

    public partial class KompanijeUseri
    {
        public string Status { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
    }

    public partial class PricuvaRezijeGodina_StanjeOd
    {
        public string pdMaster { get; set; }
    }
    
    public partial class PricuvaRezijeMjesec_Uplatnice
    {
        bool val = false;
        public bool Expanded
        {
            get { return val; }
            set { val = value; }
        }

        public bool displayLine { get; set; }
        public bool displayBtnAdd { get; set; }
        public string Status { get; set; }
        public bool DetailsVisible { get; set; }
    }


    public class RacunPdf
    {
        public int Id { get; set; }
        public int index { get; set; }
        public int PosebniDioMasterId { get; set; }
        public string BrojRacuna { get; set; }
        public DateTime DatumRacuna { get; set; }
        public DateTime DatumIsporuke { get; set; }
        public DateTime DatumDospijeca { get; set; }
        public string JedMjera { get; set; }
        public string Opis { get; set; }
        public decimal JedCijena { get; set; }
        public decimal Kolicina { get; set; }
        public decimal Ukupno { get; set; }
        public string Napomena { get; set; }

    }

    // OLD

    //public partial class Stanovi_PosebniDijelovi
    //{
    //    public string Status { get; set; }
    //}
    //public partial class Stanovi_Pripadci
    //{
    //    public string Status { get; set; }
    //    public bool Active { get; set; }
    //}
    //public partial class Stanovi_Stanari
    //{
    //    public string Status { get; set; }
    //}

    //public partial class Zgrade_Pripadci
    //{
    //    public string VrstaNaziv { get; set; }
    //    public string Status { get; set; }
    //}

    //public partial class Stanovi
    //{
    //    //public Stanovi()
    //    //{
    //    //    this.Stanovi_PrijenosPripadaka = new HashSet<Stanovi_PrijenosPripadaka>();
    //    //}
    //    public virtual ICollection<Stanovi_PrijenosPripadaka> Stanovi_PrijenosPripadaka { get; set; }
    //}

    //public partial class Stanovi_PrijenosPripadaka
    //{
    //    public int PripadakIZgradaId { get; set; }
    //    public int IdKojiSeZatvara { get; set; }
    //    public int FromStan { get; set; }
    //    public int ToStan { get; set; }
    //    public int VrijediOdGodina { get; set; }
    //    public int VrijediOdMjesec { get; set; }
    //}

    //public partial class Zgrade_ZaduzivanjePoMj
    //{
    //    public string Status { get; set; }
    //}

    //public partial class PrihodiRashodi
    //{
    //    public string Status { get; set; }
    //}

    //public partial class PrihodiRashodiDetails
    //{
    //    public string Status { get; set; }
    //}

    //public partial class PricuvaGod
    //{
    //    public string Status { get; set; }
    //}

    //public partial class PricuvaMj
    //{
    //    public string Status { get; set; }
    //    public bool Dirty { get; set; }
    //    public decimal StanjeOd { get; set; }
    //}

    //public partial class KS
    //{
    //    public decimal Zaduzenje { get; set; }
    //    public decimal Stanje { get; set; }
    //    public string Status { get; set; }
    //}

    //public partial class PricuvaGod_StanjeOd
    //{
    //    public bool IsError { get; set; }
    //}
}