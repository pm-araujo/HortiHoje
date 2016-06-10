using System.Data.Entity.ModelConfiguration;
using HortiHoje.Model;

namespace HortiHoje.DataAccess
{
    public class MediaFileConfiguration : EntityTypeConfiguration<MediaFile>
    {
        public MediaFileConfiguration()
        {
            HasOptional(mf => mf.FieldNote)
                .WithMany(fn => fn.MediaFiles)
                .HasForeignKey(mf => mf.IdFieldNote);
        }
    }
}
