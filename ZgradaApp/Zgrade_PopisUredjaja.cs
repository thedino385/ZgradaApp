//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace ZgradaApp
{
    using System;
    using System.Collections.Generic;
    
    public partial class Zgrade_PopisUredjaja
    {
        public int Id { get; set; }
        public int ZgradaId { get; set; }
        public string Naziv { get; set; }
        public string Napomena { get; set; }
        public Nullable<int> VrijediOdMjesec { get; set; }
        public Nullable<int> VrijediOdGodina { get; set; }
        public Nullable<bool> Zatvoren { get; set; }
        public Nullable<int> ZatvorenGodina { get; set; }
        public Nullable<int> ZatvorenMjesec { get; set; }
        public Nullable<System.DateTime> Notifikacija_dt { get; set; }
        public string NotifikacijaText { get; set; }
        public Nullable<bool> NotifikacijaProcitana { get; set; }
    
        public virtual Zgrade Zgrade { get; set; }
    }
}
