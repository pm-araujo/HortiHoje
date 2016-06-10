using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HortiHoje.Model
{
    public class MediaFileTag
    {
        public int IdMediaFile { get; set; }
        public int IdTag { get; set; }

        public virtual MediaFile MediaFile { get; set; }

        public virtual Tag Tag { get; set; }


        [Required, MaxLength(50)]
        public string Value { get; set; }
    }
}
