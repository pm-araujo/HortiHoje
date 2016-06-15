using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNet.SignalR;

namespace HortiHoje
{
    public class HubPoint : Hub
    {
        private static readonly ConnectionMapping<string> _connections =
            new ConnectionMapping<string>();
        private static readonly ChangesQueue changes = new ChangesQueue();


        public void Send(string test)
        {
            Clients.All.helloToAll(test + DateTime.Now);
        }

        // User called committing change to server and everyone else currently connected
        public void ApplyChange(string change)
        {
            changes.AddToAllExcept(change, Context.ConnectionId);
            Clients.Others.notifyChange(change);
        }

        // User response after commitChange, confirming the change has been applied and removing it from his change stack
        public void ConfirmApplyChange()
        {
            changes.Pop(Context.ConnectionId);
        }

        public IEnumerable<string> GetConnectedUsers()
        {
            return _connections.GetKeys();
        }


        public override Task OnConnected()
        {
            string name = Context.QueryString["name"];
            string prev = Context.QueryString["previousConnection"];
            string id = Context.ConnectionId;

            if (prev == String.Empty)
            {
                changes.Register(Context.ConnectionId);
            }
            else
            {
                changes.Port(prev, Context.ConnectionId);
            }

            _connections.Add(name, Context.ConnectionId);

            Clients.All.notifyConnected(_connections.GetKeys());

            return base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            string name = Context.QueryString["name"];

            _connections.Remove(name, Context.ConnectionId);
            changes.Remove(Context.ConnectionId);

            Clients.All.notifyConnected(_connections.GetKeys());

            return base.OnDisconnected(stopCalled);
        }

        public override Task OnReconnected()
        {
            string name = Context.QueryString["name"];

            if (!_connections.GetConnections(name).Contains(Context.ConnectionId))
            {
                _connections.Add(name, Context.ConnectionId);
            }

            if (!changes.Exists(Context.ConnectionId))
            {
                changes.Register(Context.ConnectionId);
            }

            Clients.All.notifyConnected(_connections.GetKeys());

            return base.OnReconnected();
        }
    }
}