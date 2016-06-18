(function() {
    'use strict';

    var serviceId = 'datacontext';
    angular.module('app')
        .factory(serviceId,
        ['$rootScope', '$timeout', 'breeze', 'common', 'entityManagerFactory', 'config', 'model', 'repositories', datacontext]);

    function datacontext($rootScope, $timeout, breeze, common, emFactory, config, model, repositories) {
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

        var repoNames = [
            'activity', 'fieldnote', 'fieldnotereporter', 'file', 'location', 'lookup', 'mediafile', 'mediafiletag',
            'reporter', 'tag', 'task', 'taskallocatedreporter', 'taskallowedreporter'];
        $rootScope.changeList = [];
        var primePromise;

        var unSubKeyHasChange = function(){};

        var service = {
            primeData: primeData,

            getPeople: getPeople,
            getMessageCount: getMessageCount,

            generateChange: generateChange,

            apply: apply,
            cancel: cancel,
            save: save,

            sync: sync,

            getActivitiesWithIncompleteTasksByReporter : getActivitiesWithIncompleteTasksByReporter,

            // SignalR
            hubHello: hubHello,
            importSnapshot: importSnapshot,
            getSnapshot: getSnapshot

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
            onHasChanges();
        }

        function initHub() {
            hub = $.connection.hubPoint;

            hub.client.helloToAll = function(data) {
                console.log('server replied');
                log('Server Replied with ' + data);
            }

            hub.client.notifyConnected = function(connectedList) {
                console.log('ConnectedNotification:');
                console.log(connectedList);
                common.$broadcast(events.notifyConnected, connectedList);
            }

            hub.client.notifyChange = function(changeEl) {

                changeEl = JSON.parse(changeEl);

                changeEl.type = 'incoming';

                $rootScope.changeList.push(changeEl);
                common.$broadcast(events.notifyChange, changeEl);
            }

            $.connection.hub.qs = {
                name: sessionStorage.userFullName,
                previousConnection: ""
            };

            $.connection.hub.disconnected(function () {
                setTimeout(function () {
                    $.connection.hub.start()
                    .done(function(res) {
                        log("Connected to Server on SignalR");
                            $.connection.hub.qs.previousConnection = res.id;
                        });
                }, 5000); // Re-start connection after 5 seconds
            });
            $.connection.hub.start()
                .done(function(res) {
                    log('Connected to Server on SignalR');
                    $.connection.hub.qs.previousConnection = res.id;
                });
        }

        function sync() {

            var changeList = $rootScope.changeList;

            if (changeList.length == 0) {
                return;
            }

            console.log(changeList);

            changeList = changeList.sort(orderByTimeAsc);

            
            unSubKeyHasChange();
            unSubKeyHasChange = 0;


            function doIncoming(el, callback) {
                console.log('haiIn');
                if (el.type === "incoming") {

                    hub.server.confirmApplyChange()
                        .done(function() {

                            manager.importEntities(el.change);
                            manager.acceptChanges();
                            console.log("Success importing entities.");
                            return callback(null, false);
                        })
                        .fail(function(err) {
                            logError("Error communicating with server", err);
                        });

                } else {
                    callback(null, true);
                }
            }

            function doOutgoing(el, callback) {
                console.log('haiOut');
                if (el.type === "outgoing") {
                    hub.server.applyChange(JSON.stringify(el))
                        .done(function() {
                            console.log("Success applying to server")
                            return callback(null, false);
                        })
                        .fail(function(err) {
                            logError("Error Applying change to server", err);
                        });

                } else {
                    callback(null, true);
                }
            }

            function doSave(err, results) {
                var defer = $q.defer();

                
                changeList = results;
                $rootScope.changeList = results;
                defer.resolve();

                return defer.promise;
            }

            async.waterfall([
                function (callback) {
                    async.filter(changeList, doOutgoing, function (err, resultFilter) {
                        // saving changes from outgoing
                        console.log("saving from outgoing");
                        console.log("res: ", resultFilter);

                        // if no more outgoing, save here
                        var outgoing = resultFilter.filter(function (el) { return (el.type === "outgoing"); });

                        if ((outgoing.length == 0) && manager.hasChanges() ) {
                            manager.saveChanges();
                            log("Saved Changes");
                        }

                        callback(null, resultFilter);
                    });
                },
                function (resPrev, callback) {
                    changeList = resPrev;
                    async.filter(changeList, doIncoming, function (err, resultFilter) {
                        // saving changes from incoming
                        console.log("saving from incoming");
                        console.log("res: ", resultFilter);
                        callback(null, resultFilter);
                    });
                }
            ], function (err, result) {
                console.log("reached end")
                console.log("results: ", result);
                console.log("hasChanges: " + manager.hasChanges());

                changeList = result;
                $rootScope.changeList = result;

                if (changeList.length != 0) {
                    logError("Error Syncing");
                }

                if (unSubKeyHasChange == 0) {
                    console.log("restoring event handler");
                    onHasChanges();
                }
                common.$broadcast(events.hasChangesChanged, { hasChanges: false });
            });

        }

        function orderByTimeAsc(a, b) {
            if (a.time < b.time) {
                return -1;
            } else if (a.time > b.time) {
                return 1;
            } else {
                return 0;
            }

        }

        function hubHello() {
            console.log("hasChanges:", manager.hasChanges());
        }

        function onHasChanges() {
            unSubKeyHasChange = $rootScope.$on(config.events.hasChangesChanged, function (event, data) {
                if (data.hasChanges) {
                    console.log("event:", event);
                    console.log("data:", data);
                    var changeEl = {
                        change: getSnapshot(),
                        type: 'outgoing',
                        time: moment()
                    }

                    $rootScope.changeList.push(changeEl);
                }

            });
        }

        function generateChange(entities) {
            var changeEl = {
                change: manager.exportEntities([entities]),
                type: 'outgoing',
                time: moment()
            };

            $rootScope.changeList.push(changeEl);

            common.$broadcast(events.hasChangesChanged, { hasChanges: false });
        }

        function getSnapshot() {
            return manager.exportEntities(manager.getChanges(), false);
            //return manager.exportEntities();
        }

        function importSnapshot(snapshot) {
            manager.importEntities(snapshot);
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

            var changeList = $rootScope.changeList;

            changeList = changeList.filter(function(el) {
                return (el.type === "incoming");
            });

            $rootScope.changeList = changeList;

            

            logSuccess("Local Changes Cancelled", null, true);
        }

        function setupEventForHasChangesChanged() {
            manager.hasChangesChanged.subscribe(function (eventArgs) {
                var data = {
                    hasChanges: eventArgs.hasChanges,
                    eventArgs: eventArgs
                };
                // send the message (the ctrl receives it)
                common.$broadcast(events.hasChangesChanged, data)
            });
        }

        function setupEventForEntityChanged() {
            manager.entityChanged.subscribe(function(eventArgs) {
                var data = {
                    eventArgs: eventArgs
                };
                // broadcast to subscribers
                common.$broadcast(events.entityChanged, data);
            });
        }

        // Apply changes
        function apply() {
            if (!manager.hasChanges()) {
                return;
            }

            return manager.acceptChanges();
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

        function getActivitiesWithIncompleteTasksByReporter(reporterID) {
            var activities = [];

            activities = EntityQuery.from('Task')
                .where('completed', 'eq', false)
                .where('allocatedReporters', 'any', 'idReporter', '==', reporterID)
                .orderBy('activity.name asc')
                .using(manager)
                .executeLocally();

            return activities;

        }

        function getIncompleteActivities(managerID) {
            var activities = [];

            activities = EntityQuery.from('Task')
                .where('completed', 'eq', false)
                .where('activity', 'any', 'idManager', '==', managerID)
                .select('activity')
                .using(manager)
                .executeLocally();

            return activities;
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