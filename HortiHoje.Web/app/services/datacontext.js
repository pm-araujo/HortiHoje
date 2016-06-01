(function () {
    'use strict';

    var serviceId = 'datacontext';
    angular.module('app').factory(serviceId,
        ['common', 'entityManagerFactory', 'breeze', 'config', datacontext]);

    function datacontext(common, emFactory, breeze, config) {
        var EntityQuery = breeze.EntityQuery;

        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(serviceId);
        var logError = getLogFn(serviceId, 'error');
        var logSuccess = getLogFn(serviceId, 'success');

        var manager = emFactory.newManager();
        var $q = common.$q;

        var primePromise;

        var entityNames = {
            activity: 'Activity',
            fieldNote: 'FieldNote',
            fieldNoteReporter: 'FieldNoteReporter',
            location: 'Location',
            manager: 'Manager',
            mediaFile: 'MediaFile',
            mediaFileTag: 'MediaFileTag',
            reporter: 'Reporter',
            tag: 'Tag',
            task: 'Task',
            taskAllocatedReporter: 'TaskAllocatedReporter',
            taskAllowedReporter: 'TaskAllowedReporter'
        };

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

        function _getAllLocal(resource, ordering) {
            return EntityQuery.from(resource)
                .orderBy(ordering)
                .using(manager)
                .executeLocally();
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

        function getReporterPartials() {
            var reporters;

            return EntityQuery.from('Reporters')
                .select('userName, name, passwordHash, doB, nIF, address')
                .orderBy('name, nIF')
                .toType('Reporter')
                .using(manager).execute()
                .to$q(querySucceeded, _queryFailed);

            function querySucceeded(data) {
                reporters = data.results;
                log('Retrieved [Reporters Partials] from remote data source', reporters.length, true);
                return reporters;
            }
        }

        function getActivityPartials() {
            var activities;

            return EntityQuery.from('Activities')
                .select('name, description, manager')
                .orderBy('name')
                .toType('Activities')
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