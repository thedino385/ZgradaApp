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
    
    public partial class Zgrade_PosebniDijeloviMaster_VlasniciPeriod
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Zgrade_PosebniDijeloviMaster_VlasniciPeriod()
        {
            this.Zgrade_PosebniDijeloviMaster_VlasniciPeriod_Vlasnici = new HashSet<Zgrade_PosebniDijeloviMaster_VlasniciPeriod_Vlasnici>();
        }
    
        public int Id { get; set; }
        public int PosebniDioMasterId { get; set; }
        public int VrijediOdMjesec { get; set; }
        public int VrijediOdGodina { get; set; }
        public Nullable<int> VrijediDoMjesec { get; set; }
        public Nullable<int> VrijediDoGodina { get; set; }
        public Nullable<bool> Zatvoren { get; set; }
        public string Napomena { get; set; }
    
        public virtual Zgrade_PosebniDijeloviMaster Zgrade_PosebniDijeloviMaster { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Zgrade_PosebniDijeloviMaster_VlasniciPeriod_Vlasnici> Zgrade_PosebniDijeloviMaster_VlasniciPeriod_Vlasnici { get; set; }
    }
}