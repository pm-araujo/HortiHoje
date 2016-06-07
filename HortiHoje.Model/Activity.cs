using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HortiHoje.Model
{
    public class Activity
    {
        public int Id { get; set; }
        [Required, MaxLength(50)]
        public string Name { get; set; }
        public string Description { get; set; }
        public int IdManager { get; set; }

        public virtual Reporter Reporter { get; set; }

        public virtual ICollection<Task>
            TaskList
        { get; set; }
    }
}
