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
    
    public partial class PricuvaRezijeMjesec_Uplatnice
    {
        public int Id { get; set; }
        public Nullable<int> PricuvaRezijeMjesecId { get; set; }
        public int PosebniDioMasterId { get; set; }
        public int PlatiteljId { get; set; }
        public Nullable<int> PrimateljId { get; set; }
        public string TipDuga { get; set; }
        public string TipPlacanja { get; set; }
        public Nullable<decimal> UdioPricuva { get; set; }
        public Nullable<decimal> UdioRezije { get; set; }
        public Nullable<decimal> IznosRezije { get; set; }
        public Nullable<decimal> IznosPricuva { get; set; }
        public string Uplatnica { get; set; }
    
        public virtual PricuvaRezijeMjesec PricuvaRezijeMjesec { get; set; }
    }
}