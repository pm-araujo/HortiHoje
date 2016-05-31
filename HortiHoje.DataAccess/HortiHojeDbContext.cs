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

            modelBuilder.Configurations.Add(new SessionConfiguration());
            modelBuilder.Configurations.Add(new AttendanceConfiguration());

            modelBuilder.Configurations.Add(new ReporterConfiguration());
        }

        public DbSet<Session> Sessions { get; set; }
        public DbSet<Person> Persons { get; set; }
        public DbSet<Attendance> Attendance { get; set; }

        public DbSet<Reporter> Reporters { get; set; }

        // Lookup Lists
        public DbSet<Room> Rooms { get; set; }
        public DbSet<TimeSlot> TimeSlots { get; set; }
        public DbSet<Track> Tracks { get; set; }
    }
}