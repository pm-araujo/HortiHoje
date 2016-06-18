(function () {
    'use strict';

    var serviceId = 'repository.task';
    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', RepositoryTask]);

    function RepositoryTask(model, AbstractRepository) {
        var Predicate = breeze.Predicate;
        var entityName = model.entityNames.task;
        var EntityQuery = breeze.EntityQuery;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;

            // Exposed data access functions
            this.create = create;
            this.getCount = getCount;
            this.getPartials = getPartials;
            this.getById = getById;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        // Create New Task
        function create() {
            return this.manager.createEntity(entityName);
        }

        // getTasksCount
        function getCount() {
            var self = this;

            return self.$q.when(self._getLocalCount(entityName));
        }

        // get Task by id
        function getById(id, forceRemote) {
            return this._getById(entityName, id, forceRemote);
        }

        // datacontext.task.getPartials
        function getPartials(forceRefresh) {
            var self = this;
            var tasks;

            if (!forceRefresh) {
                tasks = self._getAllLocal(entityName);

                return self.$q.when(tasks);
            }

            return EntityQuery.from('Tasks')
                .select('*')
                .toType(entityName)
                .using(self.manager).execute()
                .to$q(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                tasks = data.results;
                self.log('Retrieved [Task Partials] from remote data source', tasks.length, true);
                return tasks;
            }
        }
    }
})();