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
    
    public partial class PricuvaGod
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public PricuvaGod()
        {
            this.PricuvaMj = new HashSet<PricuvaMj>();
            this.KS = new HashSet<KS>();
            this.PricuvaGod_StanjeOd = new HashSet<PricuvaGod_StanjeOd>();
            this.PricuvaMj_VrstaObracuna = new HashSet<PricuvaMj_VrstaObracuna>();
        }
    
        public int Id { get; set; }
        public int ZgradaId { get; set; }
        public int Godina { get; set; }
        public Nullable<decimal> StanjeOd { get; set; }
    
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<PricuvaMj> PricuvaMj { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<KS> KS { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<PricuvaGod_StanjeOd> PricuvaGod_StanjeOd { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<PricuvaMj_VrstaObracuna> PricuvaMj_VrstaObracuna { get; set; }
    }
}