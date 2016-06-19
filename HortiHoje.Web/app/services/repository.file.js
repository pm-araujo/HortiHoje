(function () {
    'use strict';

    var serviceId = 'repository.file';
    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', RepositoryFile]);

    function RepositoryFile(model, AbstractRepository) {
        var Predicate = breeze.Predicate;
        var entityName = model.entityNames.mediaFile;
        var EntityQuery = breeze.EntityQuery;
        var orderBy = 'name';

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;

            // Exposed data access functions
            this.attach = attach;
            this.create = create;
            this.getAll = getAll;
            this.getCount = getCount;
            this.getPartials = getPartials;
            this.getFromTask = getFromTask;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        // Attach new file
        function attach(file) {
            return this.manager.attachEntity(file);
        }

        // Create
        function create() {
            return this.manager.createEntity(entityName);
        }

        // getMediaFileCount
        function getCount() {
            var self = this;
            var predicate = Predicate('idFieldNote', '==', null);
            return self.$q.when(self._getLocalCount(entityName, predicate));
        }

        // Get All Files within a given task
        function getFromTask(idTask) {
            var self = this;

            var pred = Predicate("fieldNotes", "any", "idTask", "eq", idTask);

            return EntityQuery.from('Task')
                .where(pred)
                .expand('Task', 'FieldNote')
                .select("fieldNotes.mediaFiles")
                .using(self.manager).executeLocally();
        }

        // Get All static like
        function getAll() {
            var self = this;

            return EntityQuery.from(entityName)
                .using(self.manager).executeLocally();
        }

        // getMediaFilePartials
        function getPartials(forceRefresh, fieldNotes) {
            var self = this;
            var predicate = fieldNotes ? null : Predicate('idFieldNote', '==', null);
            var files;

            if (!forceRefresh) {
                files = self._getAllLocal(entityName, orderBy, predicate);
                return self.$q.when(files);
            }

            return EntityQuery.from('MediaFiles')
                .select('*')
                .orderBy(orderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .to$q(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                files = data.results;
                self.log('Retrieved [File Partials] from remote data source', files.length, true);
                return files;
            }
        }
    }
})();