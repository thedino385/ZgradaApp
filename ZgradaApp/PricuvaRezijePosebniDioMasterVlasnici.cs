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
    
    public partial class PricuvaRezijePosebniDioMasterVlasnici
    {
        public int Id { get; set; }
        public int PricuvaRezijePosebniDioMasterId { get; set; }
        public Nullable<int> PeriodId { get; set; }
        public Nullable<int> VlasnikId { get; set; }
        public string Udio { get; set; }
        public Nullable<bool> UplatnicaRezije { get; set; }
        public Nullable<bool> UplatnicaPricuva { get; set; }
        public string UplatnicaTip { get; set; }
        public Nullable<decimal> UplatnicaRezijePosto { get; set; }
        public Nullable<decimal> UplatnicaPricuvaPosto { get; set; }
        public Nullable<decimal> UplatnicaPricuvaIznos { get; set; }
        public Nullable<decimal> UplatnicaRezijeIznos { get; set; }
        public Nullable<int> UplatnicaSlatiStanarId { get; set; }
        public string UplatnicaId { get; set; }
    
        public virtual PricuvaRezijePosebniDioMasteri PricuvaRezijePosebniDioMasteri { get; set; }
    }
}
