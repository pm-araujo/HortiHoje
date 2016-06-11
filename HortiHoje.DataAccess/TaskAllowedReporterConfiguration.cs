using System.Data.Entity.ModelConfiguration;
using HortiHoje.Model;

namespace HortiHoje.DataAccess
{
    public class TaskAllowedReporterConfiguration : EntityTypeConfiguration<TaskAllowedReporter>
    {
        
        public TaskAllowedReporterConfiguration()
        {

            HasKey(tar => new {tar.IdReporter, tar.IdTask});

            HasRequired(tar => tar.Reporter)
                .WithMany(rep => rep.AllowedTasks)
                .HasForeignKey(tar => tar.IdReporter);

            HasRequired(tar => tar.Task)
                .WithMany(tsk => tsk.AllowedReporters)
                .HasForeignKey(tar => tar.IdTask);
        }
    }
}
