(function () {
    'use strict';

    var serviceId = 'repository.location';
    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', RepositoryActivity]);

    function RepositoryLocation(model, AbstractRepository) {
        var Predicate = breeze.Predicate;
        var entityName = model.entityNames.activity;
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

        // Create New Location
        function create() {
            return this.manager.createEntity(entityName);
        }

        // getLocationsCount
        function getCount() {
            var self = this;

            return self.$q.when(self._getLocalCount(entityName));
        }

        // get Location by id
        function getById(id, forceRemote) {
            return this._getById(entityName, id, forceRemote);
        }

        // datacontext.location.getPartials
        function getPartials(forceRefresh) {
            var self = this;
            var locations;

            if (!forceRefresh) {
                locations = self._getAllLocal(entityName);

                return self.$q.when(locations);
            }

            return EntityQuery.from('Locations')
                .select('*')
                .toType(entityName)
                .using(self.manager).execute()
                .to$q(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                locations = data.results;
                self.log('Retrieved [Location Partials] from remote data source', locations.length, true);
                return locations;
            }
        }
    }
})();