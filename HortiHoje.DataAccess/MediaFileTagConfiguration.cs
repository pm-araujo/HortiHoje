using System.Data.Entity.ModelConfiguration;
using HortiHoje.Model;

namespace HortiHoje.DataAccess
{
    public class MediaFileTagConfiguration : EntityTypeConfiguration<MediaFileTag>
    {
        public MediaFileTagConfiguration()
        {
            HasKey(t =>
            new {
                t.IdMediaFile,
                t.IdTag
            });
        }
    }
}
