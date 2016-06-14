using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;

namespace HortiHoje
{
    public class HubPoint : Hub
    {
        public String Send(string test)
        {
            Clients.All.helloToAll(test + DateTime.Now);
            return "test";
        }
    }
}