(function () {
    'use strict';

    var serviceId = 'datacontext';
    angular.module('app').factory(serviceId,
        ['breeze', 'common', 'entityManagerFactory', 'config', 'model', datacontext]);

    function datacontext(breeze, common, emFactory, config, model) {
        var EntityQuery = breeze.EntityQuery;
        var entityNames = model.entityNames;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(serviceId);
        var logError = getLogFn(serviceId, 'error');
        var logSuccess = getLogFn(serviceId, 'success');

        var manager = emFactory.newManager();
        var $q = common.$q;

        var primePromise;

        var service = {
            getPeople: getPeople,
            getMessageCount: getMessageCount,
            getReporterPartials: getReporterPartials,
            getActivityPartials: getActivityPartials,

            doLogin: doLogin,
            primeData: primeData
        };

        return service;

        function doLogin(userName, pw) {

            if (userName === undefined ||
                pw === undefined)
                return $q.when();

            var unamePred = new breeze.Predicate('userName', '==', userName);
            var pwPred = new breeze.Predicate('passwordHash', '==', pw);

            return EntityQuery.from('Reporters')
                .where(unamePred.and(pwPred) )
                .select('id, userName, name')
                .toType('Reporter')
                .using(manager).execute()
                .to$q(querySucceeded, _queryFailed);

            function querySucceeded(data) {
                return data.results[0];
            }

        }

        function primeData() {

            if (primePromise) return primePromise;

            primePromise = $q.all([getLookups()])
                .then(extendMetadata)
                .then(success);

            return primePromise;

            function success() {
                setLookups();
                log('Data Primed');
            }

            function extendMetadata() {
                var metadataStore = manager.metadataStore;
                var types = metadataStore.getEntityTypes();

                types.forEach(function (type) {
                    if( type instanceof breeze.EntityType)
                        set(type.shortName, type)
                });

                function set(resourceName, entityName) {
                    metadataStore.setEntityTypeForResourceName(resourceName, entityName);
                }
            }
        }

        function setLookups(data) {
            service.lookupCacheData = {
                reporters: _getAllLocal(entityNames.reporter, 'name, nIF'),
                activities: _getAllLocal(entityNames.activity, 'name')
            }
        }

        function getLookups() {
            return EntityQuery.from('Lookups')
                .using(manager)
                .execute(querySucceeded, _queryFailed);

            function querySucceeded(data) {
                log('Retrieved [Lookups] from remote data source', data, true);
                return true;
            }
        }

        function _getAllLocal(resource, ordering, predicate) {
            return EntityQuery.from(resource)
                .orderBy(ordering)
                .where(predicate)
                .using(manager)
                .executeLocally();
        }

        function _queryFailed(error) {
            var msg = config.appErrorPrefix + 'Error retrieving data' + error.message;
            logError(msg, error);
            throw error;
        }





        // Server Queries
        function getMessageCount() { return $q.when(72); }

        function getPeople() {
            var people = [
                { firstName: 'John', lastName: 'Papa', age: 25, location: 'Florida' },
                { firstName: 'Ward', lastName: 'Bell', age: 31, location: 'California' },
                { firstName: 'Colleen', lastName: 'Jones', age: 21, location: 'New York' },
                { firstName: 'Madelyn', lastName: 'Green', age: 18, location: 'North Dakota' },
                { firstName: 'Ella', lastName: 'Jobs', age: 18, location: 'South Dakota' },
                { firstName: 'Landon', lastName: 'Gates', age: 11, location: 'South Carolina' },
                { firstName: 'Haley', lastName: 'Guthrie', age: 35, location: 'Wyoming' }
            ];

            return $q.when(people);
        }

        function getReporterPartials(forceRemote) {
            var reporters;

            // Fetching the data from cache
            if( !forceRemote ) {
                reporters = _getAllLocal(entityNames.reporter, 'name, nIF');
                return $q.when(reporters);
            }
            

            // Fetching the data from remote source
            return EntityQuery.from('Reporters')
                .select('userName, name, passwordHash, doB, nIF, address, isManager')
                .orderBy('name, nIF')
                .toType(entityNames.reporter)
                .using(manager).execute()
                .to$q(querySucceeded, _queryFailed);

            function querySucceeded(data) {
                reporters = data.results;
                log('Retrieved [Reporters Partials] from remote data source', reporters.length, true);
                return reporters;
            }
            
        }

        function getActivityPartials(forceRemote) {
            var activities;

            // Fetching the data from cache
            if (!forceRemote) {
                activities = _getAllLocal(entityNames.activity, 'name');
                return $q.when(activities);
            }

            
            // Fetching the data from remote source
            return EntityQuery.from('Activities')
                .select('name, description, idManager')
                .orderBy('name')
                .toType( entityNames.activity )
                .using(manager).execute()
                .to$q(querySucceeded, _queryFailed);

            function querySucceeded(data) {
                activities = data.results;
                log('Retrieved [Activities Partials] from remote data source', activities.length, true);
                return activities;
            
            }

        }
    }
})();