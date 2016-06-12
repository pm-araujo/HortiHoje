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
        }

        AbstractRepository.extend(Ctor);

        return Ctor;


        // getActivityCount
        function getCount() {
            var self = this;
            var predicate = Predicate("taskList", "any",
                Predicate("allowedReporters", "any", "idReporter", "==", sessionStorage.userId
                ));

            return self.$q.when(self._getLocalCount(entityName, predicate));
        }


        // Formerly known as datacontext.getActivityPartials()
        function getPartials(forceRefresh) {
            var self = this;
            var activities;
            var predicate = Predicate("taskList", "any",
                Predicate("allowedReporters", "any", "reporter.id", "==", sessionStorage.userId
                ));

            if (!forceRefresh) {
                //activities = self._getAllLocal(entityName, orderBy, predicate);

                predicate = Predicate("taskList", "any", "allowedReporters", "any", "reporter.userName", "==", "Silas");
                activities = EntityQuery.from(entityName)
                    .select("taskList")
                    .orderBy(orderBy)
                    .where(predicate)
                    .expand("taskList")
                    .using(this.manager)
                    .executeLocally();

                return self.$q.when(activities);
            }

            return EntityQuery.from('Activities')
                .select('*')
                .orderBy('name')
                .where(predicate)
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