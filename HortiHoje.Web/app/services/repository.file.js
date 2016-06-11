﻿(function () {
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
            this.getCount = getCount;
            this.getPartials = getPartials;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        // getMediaFileCount
        function getCount() {
            var self = this;
            var predicate = Predicate('idFieldNote', '==', null);
            return self.$q.when(self._getLocalCount(entityName, predicate));
        }


        // getMediaFilePartials
        function getPartials(forceRefresh) {
            var self = this;
            var predicate = Predicate('idFieldNote', '==', null);
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
                return reporters;
            }
        }
    }
})();