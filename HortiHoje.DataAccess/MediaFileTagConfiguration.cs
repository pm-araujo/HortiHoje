using System.Data.Entity.ModelConfiguration;
using HortiHoje.Model;

namespace HortiHoje.DataAccess
{
    public class MediaFileTagConfiguration : EntityTypeConfiguration<MediaFileTag>
    {
        public MediaFileTagConfiguration()
        {
            HasKey(mft => new { mft.IdMediaFile, mft.IdTag });

            // Attendance has 1 Session, Sessions have many Attendance records
            HasRequired(mft => mft.MediaFile)
                .WithMany(mf => mf.Tags)
                .HasForeignKey(mft => mft.IdMediaFile);

            // Attendance has 1 Person, Persons have many Attendance records
            HasRequired(mft => mft.Tag)
                .WithMany(t => t.MediaFiles)
                .HasForeignKey(mft => mft.IdTag);
        }
    }
}
