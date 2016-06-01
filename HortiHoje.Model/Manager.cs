using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HortiHoje.Model
{
    public class Manager
    {
        // 
        public int Id { get; set; }

        public virtual Reporter Reporter { get; set; }
    }
}
