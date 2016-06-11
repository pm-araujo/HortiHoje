using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HortiHoje.Model
{
    public class Tag
    {

        public int Id { get; set; }

        [Required, MaxLength(20)]
        public string Name { get; set; }

        public int? RefCount { get; set; }

        public virtual ICollection<MediaFileTag> MediaFiles { get; set; }
    }
}
