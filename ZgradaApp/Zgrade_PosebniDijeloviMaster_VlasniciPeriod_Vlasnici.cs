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
    
    public partial class Zgrade_PosebniDijeloviMaster_VlasniciPeriod_Vlasnici
    {
        public int Id { get; set; }
        public int VlasniciPeriodId { get; set; }
        public int StanarId { get; set; }
        public decimal Udio { get; set; }
        public Nullable<bool> UplatnicaGlasiNaVlasnika { get; set; }
    
        public virtual Zgrade_PosebniDijeloviMaster_VlasniciPeriod Zgrade_PosebniDijeloviMaster_VlasniciPeriod { get; set; }
    }
}
