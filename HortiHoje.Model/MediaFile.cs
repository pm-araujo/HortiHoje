using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HortiHoje.Model
{
    public class MediaFile
    {
        public int Id { get; set; }
        [Required, MaxLength(25)]
        public string Name { get; set; }
        public int IdFieldNote { get; set; }

        public virtual FieldNote FieldNote { get; set; }

        public virtual ICollection<MediaFileTag>
            MediaFileTagList
        { get; set; }
    }
}
