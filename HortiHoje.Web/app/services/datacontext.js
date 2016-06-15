(function () {
    'use strict';

    var serviceId = 'datacontext';
    angular.module('app').factory(serviceId,
        ['breeze', 'common', 'entityManagerFactory', 'config', 'model', 'repositories', datacontext]);

    function datacontext(breeze, common, emFactory, config, model, repositories) {
        var Predicate = breeze.Predicate;
        var EntityQuery = breeze.EntityQuery;
        var entityNames = model.entityNames;

        // SignalR
        var hub = {};

        var events = config.events;

        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(serviceId);
        var logError = getLogFn(serviceId, 'error');
        var logSuccess = getLogFn(serviceId, 'success');

        var manager = emFactory.newManager();
        var $q = common.$q;

        var repoNames = ['activity', 'location', 'lookup', 'file', 'reporter', ];

        var primePromise;

        var service = {
            primeData: primeData,

            getPeople: getPeople,
            getMessageCount: getMessageCount,

            cancel: cancel,
            save: save,

            // SignalR
            hubHello: hubHello

            // Repositories to be added on demand:
            //      reporter
            //      lookups
            //      activity
            //      file
        };

        init();

        return service;

        function init() {
            repositories.init(manager);
            defineLazyLoadedRepos();
            setupEventForHasChangesChanged();
        }

        function initHub() {
            hub = $.connection.hubPoint;
            
            hub.client.helloToAll = function (data) {
                console.log('server replied');
                log('Server Replied with ' + data);
            }

            hub.client.notifyConnected = function(connectedList) {
                console.log('ConnectedNotification:');
                console.log(connectedList);
                common.$broadcast(events.notifyConnected, connectedList);
            }
            $.connection.hub.qs = {
                name: sessionStorage.userFullName,
                previousConnection: ""
            };
            $.connection.hub.start().done(function (res) {
                log('Connected to Server on SignalR');
                $.connection.hub.qs.previousConnection = res.id;
            });
        }

        function hubHello() {
            console.log('calling...');
            hub.server.send("teststring");

        }

        // Add ES5 property to datacontext for each named repo
        function defineLazyLoadedRepos() {
            repoNames.forEach(function (name) {
                Object.defineProperty(service, name, {
                    configurable: true, // will redefine this property once
                    get: function () {
                        // The 1st time the repo is request via this property, 
                        // we ask the repositories for it (which will inject it).
                        var repo = repositories.getRepo(name);
                        // Rewrite this property to always return this repo;
                        // no longer redefinable
                        Object.defineProperty(service, name, {
                            value: repo,
                            configurable: false,
                            enumerable: true
                        });
                        return repo;
                    }
                });
            });
        }

        function primeData() {

            if (primePromise) return primePromise;

            if (!sessionStorage.isAuthenticated)
                return;

            primePromise = $q.all([service.lookup.getAll()])
                .then(extendMetadata)
                .then(setupEventForEntityChanged)
                .then(initHub)
                .then(success);

            return primePromise;

            function success() {
                service.lookup.setLookups();
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

        // Cancel Changes
        function cancel() {
            manager.rejectChanges();
            logSuccess("Local Changes Cancelled", null, true);
        }

        function setupEventForHasChangesChanged() {
            manager.hasChangesChanged.subscribe(function(eventArgs) {
                var data = {
                    hasChanges: eventArgs.hasChanges,
                    eventArgs: eventArgs
                };
                // send the message (the ctrl receives it)
                common.$broadcast(events.hasChangesChanged, data)
                console.log('Changes Made');
                console.log(data);
            });
        }

        function setupEventForEntityChanged() {
            manager.entityChanged.subscribe(function(eventArgs) {
                var data = {
                    eventArgs: eventArgs
                };
                // broadcast to subscribers
                common.$broadcast(events.entityChanged, data);
                console.log('Entity Changed');
                console.log(data);

            });
        }

        // Save Changes
        function save() {

            if (!manager.hasChanges()) {
                return;
            }
            return manager.saveChanges()
                .to$q(saveSucceeded, saveFailed);

            function saveSucceeded(result) {
                logSuccess('Saved Data to Server', result, true);
            }
            function saveFailed(error) {
                var msg = config.appErrorPrefix +
                    'Save Failed' +
                    breeze.saveErrorMessageService.getErrorMessage(error);

                error.message = msg;
                logError(msg, error);

                throw error;
            }
        }

        // Sample Queries
        function getMessageCount() {
            return $q.when(72);
        }

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


    }
})();