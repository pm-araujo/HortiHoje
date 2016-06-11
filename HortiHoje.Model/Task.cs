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

        public int IdActivity { get; set; }

        public int IdLocation { get; set; }

        public virtual Activity Activity { get; set; }

        public virtual Location Location { get; set; }

        public virtual ICollection<FieldNote> FieldNotes { get; set; }

        public virtual ICollection<TaskAllocatedReporter> AllocatedReporters { get; set; }
        public virtual ICollection<TaskAllowedReporter> AllowedReporters { get; set; }
    }
}
