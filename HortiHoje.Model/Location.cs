using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HortiHoje.Model
{
    public class Location
    {

        public int Id { get; set; }

        [Required, MaxLength(25)]
        public string Lat { get; set; }

        [Required, MaxLength(25)]
        public string Long { get; set; }

        public virtual ICollection<Task> Tasks { get; set; }
    }
}
