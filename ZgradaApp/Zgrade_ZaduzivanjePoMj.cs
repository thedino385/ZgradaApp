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
    
    public partial class Zgrade_ZaduzivanjePoMj
    {
        public int Id { get; set; }
        public int ZgradaId { get; set; }
        public int Godina { get; set; }
        public Nullable<decimal> Mj1 { get; set; }
        public Nullable<decimal> Mj2 { get; set; }
        public Nullable<decimal> Mj3 { get; set; }
        public Nullable<decimal> Mj4 { get; set; }
        public Nullable<decimal> Mj5 { get; set; }
        public Nullable<decimal> Mj6 { get; set; }
        public Nullable<decimal> Mj7 { get; set; }
        public Nullable<decimal> Mj8 { get; set; }
        public Nullable<decimal> Mj9 { get; set; }
        public Nullable<decimal> Mj10 { get; set; }
        public Nullable<decimal> Mj11 { get; set; }
        public Nullable<decimal> Mj12 { get; set; }
    
        public virtual Zgrade Zgrade { get; set; }
    }
}