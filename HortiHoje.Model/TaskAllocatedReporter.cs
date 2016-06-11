using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HortiHoje.Model
{
    public class TaskAllocatedReporter
    {

        public int IdReporter { get; set; }
        public int IdTask { get; set; }

        public virtual Reporter Reporter { get; set; }
        public virtual Task Task { get; set; }
    }
}
