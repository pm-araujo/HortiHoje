using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HortiHoje.Model
{
    public class Task
    {
        public int Id { get; set; }
        [Required, MaxLength(50)]
        public string Name { get; set; }
        public string Description { get; set; }
        public int Order { get; set; }

        public bool Completed { get; set; }

        public int ActivityId { get; set; }

        public int LocationId { get; set; }

        public virtual Activity Activity { get; set; }

        public virtual Location Location { get; set; }
    }
}
