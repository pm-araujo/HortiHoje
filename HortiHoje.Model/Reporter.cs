using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System;

namespace HortiHoje.Model
{
    public class Reporter
    {
        public int Id { get; set; }

        public string PasswordHash { get; set; }

        [Required]
        public string UserName { get; set; }
        [Required]
        public string Name { get; set; }

        public DateTime DoB { get; set; }
        
        public int NIF { get; set; }

        public Boolean IsManager { get; set; }
        public string Address { get; set; }

        public virtual ICollection<Activity> ManagerActivities { get; set; }
        public virtual ICollection<FieldNoteReporter> FieldNoteReporters { get; set; }

    }
}
