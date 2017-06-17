﻿//------------------------------------------------------------------------------
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
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    
    public partial class ZgradaDbEntities : DbContext
    {
        public ZgradaDbEntities()
            : base("name=ZgradaDbEntities")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<Kompanije> Kompanije { get; set; }
        public virtual DbSet<KompanijeUseri> KompanijeUseri { get; set; }
        public virtual DbSet<PricuvaRezijeGodina> PricuvaRezijeGodina { get; set; }
        public virtual DbSet<PricuvaRezijeGodina_StanjeOd> PricuvaRezijeGodina_StanjeOd { get; set; }
        public virtual DbSet<PricuvaRezijeMjesec> PricuvaRezijeMjesec { get; set; }
        public virtual DbSet<PricuvaRezijePosebniDioMasteri> PricuvaRezijePosebniDioMasteri { get; set; }
        public virtual DbSet<PrihodiRashodi> PrihodiRashodi { get; set; }
        public virtual DbSet<PrihodiRashodi_Rashodi> PrihodiRashodi_Rashodi { get; set; }
        public virtual DbSet<SifarnikRashoda> SifarnikRashoda { get; set; }
        public virtual DbSet<Zgrade> Zgrade { get; set; }
        public virtual DbSet<Zgrade_DnevnikRada> Zgrade_DnevnikRada { get; set; }
        public virtual DbSet<Zgrade_DnevnikRadaDetails> Zgrade_DnevnikRadaDetails { get; set; }
        public virtual DbSet<Zgrade_PopisUredjaja> Zgrade_PopisUredjaja { get; set; }
        public virtual DbSet<Zgrade_PopisZajednickihDijelova> Zgrade_PopisZajednickihDijelova { get; set; }
        public virtual DbSet<Zgrade_PosebniDijeloviMaster> Zgrade_PosebniDijeloviMaster { get; set; }
        public virtual DbSet<Zgrade_PosebniDijeloviMaster_VlasniciPeriod> Zgrade_PosebniDijeloviMaster_VlasniciPeriod { get; set; }
        public virtual DbSet<Zgrade_Stanari> Zgrade_Stanari { get; set; }
        public virtual DbSet<vKompanijeUseri> vKompanijeUseri { get; set; }
        public virtual DbSet<vZgrade> vZgrade { get; set; }
        public virtual DbSet<Zgrade_OglasnaPloca> Zgrade_OglasnaPloca { get; set; }
        public virtual DbSet<vOglasnaPloca> vOglasnaPloca { get; set; }
        public virtual DbSet<vOglasnaStanari> vOglasnaStanari { get; set; }
        public virtual DbSet<vOglasnaVoditelji> vOglasnaVoditelji { get; set; }
        public virtual DbSet<vUseriStanari> vUseriStanari { get; set; }
        public virtual DbSet<vUseriSvi> vUseriSvi { get; set; }
        public virtual DbSet<vUseriVoditelji> vUseriVoditelji { get; set; }
        public virtual DbSet<vDnevnikRadaDetails> vDnevnikRadaDetails { get; set; }
        public virtual DbSet<vDnevnikRada> vDnevnikRada { get; set; }
        public virtual DbSet<Zgrade_PosebniDijeloviMaster_VlasniciPeriod_Vlasnici> Zgrade_PosebniDijeloviMaster_VlasniciPeriod_Vlasnici { get; set; }
        public virtual DbSet<PricuvaRezijePosebniDioMasterVlasnici> PricuvaRezijePosebniDioMasterVlasnici { get; set; }
        public virtual DbSet<vPopisStanara> vPopisStanara { get; set; }
        public virtual DbSet<PricuvaRezijeMjesec_Uplatnice> PricuvaRezijeMjesec_Uplatnice { get; set; }
        public virtual DbSet<Zgrade_PosebniDijeloviMaster_Povrsine> Zgrade_PosebniDijeloviMaster_Povrsine { get; set; }
        public virtual DbSet<Zgrade_PosebniDijeloviMaster_Pripadci> Zgrade_PosebniDijeloviMaster_Pripadci { get; set; }
        public virtual DbSet<PricuvaRezijePosebniDioMasterPovrsine> PricuvaRezijePosebniDioMasterPovrsine { get; set; }
        public virtual DbSet<PricuvaRezijePosebniDioMasterPripadci> PricuvaRezijePosebniDioMasterPripadci { get; set; }
        public virtual DbSet<PrihodiRashodi_Prihodi> PrihodiRashodi_Prihodi { get; set; }
    }
}
