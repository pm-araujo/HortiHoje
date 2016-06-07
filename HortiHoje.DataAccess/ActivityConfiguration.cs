using System.Data.Entity.ModelConfiguration;
using HortiHoje.Model;

namespace HortiHoje.DataAccess
{
    public class ActivityConfiguration : EntityTypeConfiguration<Activity>
    {
        public ActivityConfiguration()
        {
            // Activity has 1 Manager, Manager has many Activities
            HasRequired(s => s.Reporter)
               .WithMany(r => r.ManagerActivities)
               .HasForeignKey(s => s.IdManager);
        }
    }
}
