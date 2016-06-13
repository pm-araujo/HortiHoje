using System.Linq;
using System.Web.Http;
using HortiHoje.Model;
using HortiHoje.DataAccess;
using Newtonsoft.Json.Linq;
using Breeze.ContextProvider;
using Breeze.WebApi2;

namespace HortiHoje.Web.Controllers
{
    [BreezeController]
    public class BreezeController : ApiController
    {
        // Todo: inject via an interface rather than "new" the concrete class
        readonly HortiHojeRepository _repository = new HortiHojeRepository();

        [HttpGet]
        public string Metadata()
        {
            return _repository.Metadata;
        }

        [HttpPost]
        public SaveResult SaveChanges(JObject saveBundle)
        {
            return _repository.SaveChanges(saveBundle);
        }




        // HortiHoje Entities
        [HttpGet]
        public IQueryable<Reporter> Reporters()
        {
            return _repository.Reporters;
        }

        [HttpGet]
        public IQueryable<Activity> Activities()
        {
            return _repository.Activities;
        }

        [HttpGet]
        public IQueryable<Task> Tasks()
        {
            return _repository.Tasks;
        }

        [HttpGet]
        public IQueryable<Location> Locations()
        {
            return _repository.Locations;
        }

        [HttpGet]
        public IQueryable<FieldNote> FieldNotes()
        {
            return _repository.FieldNotes;
        }

        [HttpGet]
        public IQueryable<MediaFileTag> MediaFileTags()
        {
            return _repository.MediaFileTags;
        }

        [HttpGet]
        public IQueryable<MediaFile> MediaFiles()
        {
            return _repository.MediaFiles;
        }

        [HttpGet]
        public IQueryable<FieldNoteReporter> FieldNoteReporters()
        {
            return _repository.FieldNoteReporters;
        }

        [HttpGet]
        public IQueryable<TaskAllocatedReporter> TaskAllocatedReporters()
        {
            return _repository.TaskAllocatedReporters;
        }

        [HttpGet]
        public IQueryable<TaskAllowedReporter> TaskAllowedReporters()
        {
            return _repository.TaskAllowedReporters;
        }


        /// <summary>
        /// Query returing a 1-element array with a lookups object whose 
        /// properties are all Rooms, Tracks, and TimeSlots.
        /// </summary>
        /// <returns>
        /// Returns one object, not an IQueryable, 
        /// whose properties are "rooms", "tracks", "timeslots".
        /// The items arrive as arrays.
        /// </returns>
        [HttpGet]
        public object Lookups()
        {
            /*
            var rooms = _repository.Rooms;
            var tracks = _repository.Tracks;
            var timeslots = _repository.TimeSlots;
            return new { rooms, tracks, timeslots };
            **/
            var reporters = _repository.Reporters;
            var activities = _repository.Activities;
            var tasks = _repository.Tasks;
            var locations = _repository.Locations;
            var fieldNotes = _repository.FieldNotes;
            var mediaFileTags = _repository.MediaFileTags;
            var mediaFiles = _repository.MediaFiles;
            var tags = _repository.Tags;
            var taskAllocatedReporters = _repository.TaskAllocatedReporters;
            var taskAllowedReporters = _repository.TaskAllowedReporters;
            var fieldNoteReporters = _repository.FieldNoteReporters;

            return new { reporters, activities, tasks, locations,
                fieldNotes, mediaFileTags, mediaFiles, tags,
                taskAllocatedReporters, taskAllowedReporters, fieldNoteReporters
            };
        }

        // Diagnostic
        [HttpGet]
        public string Ping()
        {
            return "pong";
        }
    }
}