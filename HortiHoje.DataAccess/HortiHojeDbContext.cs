using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.ModelConfiguration.Conventions;
using HortiHoje.Model;

namespace HortiHoje.DataAccess
{
    public class HortiHojeDbContext : DbContext 
    {
        public HortiHojeDbContext()
            : base(nameOrConnectionString: "DefaultConnection") { }

        static HortiHojeDbContext()
        {
            Database.SetInitializer<HortiHojeDbContext>(null);
        }
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            // Use singular table names
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();

            // Disable proxy creation and lazy loading; not wanted in this service context.
            Configuration.ProxyCreationEnabled = false;
            Configuration.LazyLoadingEnabled = false;
            

            modelBuilder.Configurations.Add(new ReporterConfiguration());
            modelBuilder.Configurations.Add(new ActivityConfiguration());
            modelBuilder.Configurations.Add(new TaskConfiguration());
            modelBuilder.Configurations.Add(new LocationConfiguration());
            modelBuilder.Configurations.Add(new FieldNoteConfiguration());
            modelBuilder.Configurations.Add(new MediaFileTagConfiguration());
            modelBuilder.Configurations.Add(new MediaFileConfiguration());
            modelBuilder.Configurations.Add(new TagConfiguration());
            modelBuilder.Configurations.Add(new TaskAllocatedReporterConfiguration());
            modelBuilder.Configurations.Add(new TaskAllowedReporterConfiguration());
            modelBuilder.Configurations.Add(new FieldNoteReporterConfiguration());
        }


        // HortiHoje Entities
        public DbSet<Reporter> Reporters { get; set; }

        public DbSet<Activity> Activities { get; set; }

        public DbSet<Task> Tasks { get; set; }

        public DbSet<Location> Locations { get; set; }

        public DbSet<FieldNote> FieldNotes { get; set; }

        public DbSet<MediaFileTag> MediaFileTags{ get; set; }
        public DbSet<MediaFile> MediaFiles { get; set; }

        public DbSet<Tag> Tags { get; set; }

        public DbSet<TaskAllocatedReporter> TaskAllocatedReporters { get; set; }
        public DbSet<TaskAllowedReporter> TaskAllowedReporters { get; set; }

        public DbSet<FieldNoteReporter> FieldNoteReporters { get; set; }
    }
}