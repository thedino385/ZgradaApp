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
    
    public partial class PrihodiRashodi_Rashodi_Uplatnice
    {
        public int Id { get; set; }
        public int RashodiId { get; set; }
        public int PosebniDioMasterId { get; set; }
        public decimal Ukupno { get; set; }
        public System.DateTime DatumKreiranja { get; set; }
        public Nullable<System.DateTime> DatumSlanja { get; set; }
    
        public virtual PrihodiRashodi_Rashodi PrihodiRashodi_Rashodi { get; set; }
    }
}
