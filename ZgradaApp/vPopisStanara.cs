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
    
    public partial class vPopisStanara
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public string Naziv { get; set; }
        public string Adresa { get; set; }
        public string Mjesto { get; set; }
        public string Ime { get; set; }
        public string Prezime { get; set; }
        public string Email { get; set; }
        public string Telefon { get; set; }
        public string Mobiltel { get; set; }
        public string PosebniDio { get; set; }
        public Nullable<bool> Zatvoren { get; set; }
        public int StanarId { get; set; }
        public int ZgradaId { get; set; }
    }
}
