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
    
    public partial class Zgrade_OglasnaPloca
    {
        public int Id { get; set; }
        public int ZgradaId { get; set; }
        public System.DateTime Datum { get; set; }
        public string Naslov { get; set; }
        public string Oglas { get; set; }
        public int UserId { get; set; }
    
        public virtual Zgrade Zgrade { get; set; }
    }
}