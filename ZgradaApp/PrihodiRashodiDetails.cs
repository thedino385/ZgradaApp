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
    
    public partial class PrihodiRashodiDetails
    {
        public int Id { get; set; }
        public int PrihodiRashodiMasterId { get; set; }
        public Nullable<int> Rb { get; set; }
        public Nullable<System.DateTime> Datum { get; set; }
        public string Opis { get; set; }
        public Nullable<decimal> Iznos { get; set; }
        public Nullable<decimal> Razlika { get; set; }
        public Nullable<decimal> Placeno { get; set; }
    
        public virtual PrihodiRashodi PrihodiRashodi { get; set; }
    }
}