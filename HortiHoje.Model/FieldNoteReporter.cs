using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HortiHoje.Model
{
    public class FieldNoteReporter
    {
        public int IdReporter { get; set; }
        public int IdFieldNote { get; set; }

        public virtual Reporter Reporter { get; set; }
        public virtual FieldNote FieldNote { get; set; }
    }
}
