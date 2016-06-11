using System.Data.Entity.ModelConfiguration;
using HortiHoje.Model;

namespace HortiHoje.DataAccess
{
    public class FieldNoteReporterConfiguration : EntityTypeConfiguration<FieldNoteReporter>
    {

        public FieldNoteReporterConfiguration()
        {

            HasKey(fnr => new { fnr.IdReporter, fnr.IdFieldNote });

            HasRequired(fnr => fnr.Reporter)
                .WithMany(rep => rep.FieldNotes)
                .HasForeignKey(fnr => fnr.IdReporter);

            HasRequired(fnr => fnr.FieldNote)
                .WithMany(fn => fn.Reporters)
                .HasForeignKey(fnr => fnr.IdFieldNote);
        }
    }
}
