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
    
    public partial class PricuvaRezijePosebniDioChildren
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public PricuvaRezijePosebniDioChildren()
        {
            this.PricuvaRezijePosebniDioChildPovrsine = new HashSet<PricuvaRezijePosebniDioChildPovrsine>();
            this.PricuvaRezijePosebniDioChildPripadci = new HashSet<PricuvaRezijePosebniDioChildPripadci>();
        }
    
        public int Id { get; set; }
        public int PricuvaRezijeMasterId { get; set; }
        public int PosebniDioChildId { get; set; }
    
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<PricuvaRezijePosebniDioChildPovrsine> PricuvaRezijePosebniDioChildPovrsine { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<PricuvaRezijePosebniDioChildPripadci> PricuvaRezijePosebniDioChildPripadci { get; set; }
        public virtual PricuvaRezijePosebniDioMasteri PricuvaRezijePosebniDioMasteri { get; set; }
    }
}
