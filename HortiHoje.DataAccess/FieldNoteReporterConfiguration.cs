using System.Data.Entity.ModelConfiguration;
using HortiHoje.Model;

namespace HortiHoje.DataAccess
{
    public class FieldNoteReporterConfiguration : EntityTypeConfiguration<FieldNoteReporter>
    {
        public FieldNoteReporterConfiguration()
        {
            // Attendance has a composite key: SessionId and PersonId
            HasKey(a => new { a.IdFieldNote, a.IdReporter});

            // Attendance has 1 Session, Sessions have many Attendance records
            HasRequired(a => a.Reporter)
                .WithMany(s => s.FieldNoteReporters)
                .HasForeignKey(a => a.IdFieldNote)
                .WillCascadeOnDelete(false);
        }
    }
}
