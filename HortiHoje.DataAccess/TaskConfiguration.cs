using System.Data.Entity.ModelConfiguration;
using HortiHoje.Model;

namespace HortiHoje.DataAccess
{
    public class TaskConfiguration : EntityTypeConfiguration<Task>
    {
        public TaskConfiguration()
        {
            // Task has 1 Activity, Activity has many Tasks
            HasRequired(t => t.Activity)
               .WithMany(a => a.TaskList)
               .HasForeignKey(t => t.IdActivity);
        }
    }
}
