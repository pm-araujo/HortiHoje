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

        var service = {
            getPeople: getPeople,
            getMessageCount: getMessageCount,
            getReporterPartials: getReporterPartials
        };

        return service;

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

            /*
            return EntityQuery.from('Sessions')
                .select('id, title, code, speakerId, trackId, timeSlotId, roomId, level, tags')
                .orderBy(orderBy)
                .toType('Session')
                .using(manager).execute()
                .to$q(querySucceeded, _queryFailed);
            */
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

        function _queryFailed(error) {
            var msg = config.appErrorPrefix + 'Error retrieving data' + error.message;
            logError(msg, error);
            throw error;
        }
    }
})();