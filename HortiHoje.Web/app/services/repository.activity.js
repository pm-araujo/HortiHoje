(function () {
    'use strict';

    var serviceId = 'repository.activity';
    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', RepositoryActivity]);

    function RepositoryActivity(model, AbstractRepository) {
        var Predicate = breeze.Predicate;
        var entityName = model.entityNames.activity;
        var EntityQuery = breeze.EntityQuery;
        var orderBy = 'name';

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;

            // Exposed data access functions
            this.getCount = getCount;
            this.getPartials = getPartials;
            this.getById = getById;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;


        // getActivityCount
        function getCount() {
            var self = this;

            return self.$q.when(self._getLocalCount(entityName));
        }

        // get Activity by id
        function getById(id, forceRemote) {
            return this._getById(entityName, id, forceRemote);
        }

        // Formerly known as datacontext.getActivityPartials()
        function getPartials(forceRefresh) {
            var self = this;
            var activities;

            if (!forceRefresh) {
                activities = self._getAllLocal(entityName, orderBy);

                return self.$q.when(activities);
            }

            return EntityQuery.from('Activities')
                .select('*')
                .orderBy('name')
                .toType(entityName)
                .using(self.manager).execute()
                .to$q(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                activities = data.results;
                self.log('Retrieved [Activity Partials] from remote data source', activities.length, true);
                return activities;
            }
        }
    }
})();