using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Ajax.Utilities;

namespace HortiHoje
{
    public class ChangesQueue
    {
        private readonly Dictionary<string, Queue<string>> _changesPerConnection =
            new Dictionary<string, Queue<string>>();

        public int Count
        {
            get
            {
                return _changesPerConnection.Count;
            }
        }

        public void Add(string key, string change)
        {
            lock (_changesPerConnection)
            {
                Queue<string> changes;
                if (!_changesPerConnection.TryGetValue(key, out changes))
                {
                    changes = new Queue<string>();
                    _changesPerConnection.Add(key, changes);
                }

                lock (changes)
                {
                    changes.Enqueue(change);
                }
            }
        }

        public void Add(string key, Queue<string> changes)
        {
            lock (_changesPerConnection)
            {
                _changesPerConnection.Add(key, new Queue<string>(changes));
            }
        }

        public void AddToAllExcept(string change, string except)
        {
            foreach (var unit in _changesPerConnection)
            {
                if (unit.Key == except) {continue;}

                Add(unit.Key, change);
            }
        }

        public void Register(string key)
        {
            lock (_changesPerConnection)
            {
                _changesPerConnection.Add(key, new Queue<string>());
            }
        }

        public Queue<string> GetChanges(string key)
        {
            Queue<string> changes;
            if (_changesPerConnection.TryGetValue(key, out changes))
            {
                return changes;
            }

            return new Queue<string>();
        }

        public int GetChangesCount(string key)
        {
            lock (_changesPerConnection)
            {
                Queue<string> changes;
                if (_changesPerConnection.TryGetValue(key, out changes))
                {
                    return changes.Count;
                }
            }

            return 0;
        }

        public Boolean Exists(string key)
        {
            return _changesPerConnection.Keys.Contains(key);
        }

        public void Port(string prev, string cur)
        {
            if (prev == cur)
                return;

            lock (_changesPerConnection)
            {
                _changesPerConnection.Add(cur, GetChanges(prev));
                Remove(prev);
            }

        }
        public void Pop(string key)
        {
            lock (_changesPerConnection)
            {
                Queue<string> changes;
                if (!_changesPerConnection.TryGetValue(key, out changes))
                {
                    return;
                }

                lock (changes)
                {
                    changes.Dequeue();

                    if (changes.Count == 0)
                    {
                        _changesPerConnection.Remove(key);

                    }
                }
            }
        }

        public void Remove(string key)
        {
            lock (_changesPerConnection)
            {
                _changesPerConnection.Remove(key);
            }
        }
    }
}