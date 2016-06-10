using System.ComponentModel.DataAnnotations;

namespace HortiHoje.Model
{
    public class FieldNote
    {
        public int ID { get; set; }
        [Required, MaxLength(50)]
        public string Title { get; set; }

        public string Description { get; set; }

        [Required]
        public int IdTask { get; set; }
                
        public virtual Task Task { get; set; }
    }
}
