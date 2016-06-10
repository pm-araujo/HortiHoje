using System.Data.Entity.ModelConfiguration;
using HortiHoje.Model;

namespace HortiHoje.DataAccess
{
    public class FieldNoteConfiguration : EntityTypeConfiguration<FieldNote>
    {
        public FieldNoteConfiguration()
        {
            HasRequired(fn => fn.Task)
                .WithMany(t => t.FieldNotes)
                .HasForeignKey(fn => fn.IdTask);
        }
    }
}
