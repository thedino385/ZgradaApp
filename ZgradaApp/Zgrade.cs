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
    
    public partial class Zgrade
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Zgrade()
        {
            this.PricuvaRezijeGodina = new HashSet<PricuvaRezijeGodina>();
            this.PrihodiRashodi = new HashSet<PrihodiRashodi>();
            this.Zgrade_PosebniDijelovi = new HashSet<Zgrade_PosebniDijelovi>();
            this.Zgrade_Stanari = new HashSet<Zgrade_Stanari>();
        }
    
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public string Naziv { get; set; }
        public string Adresa { get; set; }
        public string Mjesto { get; set; }
        public string Napomena { get; set; }
    
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<PricuvaRezijeGodina> PricuvaRezijeGodina { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<PrihodiRashodi> PrihodiRashodi { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Zgrade_PosebniDijelovi> Zgrade_PosebniDijelovi { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Zgrade_Stanari> Zgrade_Stanari { get; set; }
    }
}
