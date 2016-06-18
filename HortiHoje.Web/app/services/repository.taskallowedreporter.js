﻿(function()
{
    'use strict';

    var serviceId = 'repository.taskallowedreporter';
    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', RepositoryTaskAllowedReporter]);

    function RepositoryTaskAllowedReporter(model, AbstractRepository) {
        var Predicate = breeze.Predicate;
        var entityName = model.entityNames.taskAllowedReporter;
        var EntityQuery = breeze.EntityQuery;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;

            // Exposed data access functions
            this.create = create;
            this.getCount = getCount;
            this.getPartials = getPartials;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        // Create
        function create(initValues) {
            return this.manager.createEntity(entityName, initValues);
        }
        // getMediaFileCount
        function getCount() {
            var self = this;

            return self.$q.when(self._getLocalCount(entityName));
        }


        // getMediaFilePartials
        function getPartials(forceRefresh) {
            var self = this;
            var files;

            if (!forceRefresh)
            {
                files = self._getAllLocal(entityName, orderBy);
                return self.$q.when(files);
            }

            return EntityQuery.from('TaskAllowedReporter')
                .select('*')
                .toType(entityName)
                .using (self.manager).execute()
                 .to$q(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                files = data.results;
                self.log('Retrieved [TaskAllowedReporter Partials] from remote data source', files.length, true);
                return files;
            }
        }
    }
})();