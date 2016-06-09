﻿using System.Linq;
using Breeze.ContextProvider;
using Breeze.ContextProvider.EF6;
using Newtonsoft.Json.Linq;
using HortiHoje.Model;

namespace HortiHoje.DataAccess
{
    /// <summary>
    /// Repository (a "Unit of Work" really) of CodeCamper models.
    /// </summary>
    public class HortiHojeRepository
    {
        private readonly EFContextProvider<HortiHojeDbContext>
            _contextProvider = new EFContextProvider<HortiHojeDbContext>();

        private HortiHojeDbContext Context { get { return _contextProvider.Context; } }

        public string Metadata
        {
            get { return _contextProvider.Metadata(); }
        }

        public SaveResult SaveChanges(JObject saveBundle)
        {
            return _contextProvider.SaveChanges(saveBundle);
        }

        // HortiHoje Entities
        public IQueryable<Reporter> Reporters
        {
            get { return Context.Reporters; }
        }

        public IQueryable<Activity> Activities
        {
            get { return Context.Activities; }
        }

        // Sample Entities
        public IQueryable<Session> Sessions
        {
            get { return Context.Sessions; }
        }

        public IQueryable<Person> Speakers
        {
            get { return Context.Persons.Where(p => p.SpeakerSessions.Any()); }
        }

        public IQueryable<Person> Persons
        {
            get { return Context.Persons; }
        }

        public IQueryable<Room> Rooms
        {
            get { return Context.Rooms; }
        }
        public IQueryable<TimeSlot> TimeSlots
        {
            get { return Context.TimeSlots; }
        }
        public IQueryable<Track> Tracks
        {
            get { return Context.Tracks; }
        }
    }
}