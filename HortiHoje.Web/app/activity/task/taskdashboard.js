(function () {
    'use strict';

    var controllerId = "taskdashboard";

    angular
        .module('app')
        .controller(controllerId, ['$location', '$modal', '$routeParams', '$scope', '$timeout', 'common', 'config', 'datacontext', taskdashboard]);

    function taskdashboard($location, $modal, $routeParams, $scope, $timeout, common, config, datacontext) {
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var events = config.events;


        var logError = common.logger.getLogFn(controllerId, 'error');

        vm.title = 'taskdashboard';

        vm.task = {};
        vm.others = [];
        vm.location = {};
        vm.fieldNotes = [];


        activate();

        function activate() {
            common.activateController([getRequestedTask(), onHasChanges()], controllerId)
                .then(function () {
                    if (!allowedIn()) {
                        logError("No permissions to be watching this task");
                        $location.path('/activity/' + vm.task.idActivity);
                    }
                    getOtherTasksInActivity();
                });
        }

        function allowedIn() {
            console.log(vm.task.allowedReporters);
            return vm.task.allowedReporters.some(function (el) {
                return (el.idReporter == sessionStorage.userId);
            });
        }

        function canEdit() {
            return vm.task.allocatedReporters.some(function (el) {
                return (el.idReporter == sessionStorage.userId);
            });
        }

        function compareTasks(a, b) {
            if (a.order < b.order) {
                return -1;
            } else if (a.order > b.order) {
                return 1;
            } else {
                return 0;
            }

        }

        function getOtherTasksInActivity() {
            var data = datacontext.task.getAllOthers(vm.task.id, vm.task.idActivity);

            console.log("Other Tasks: ", data);

            vm.others = data.sort(compareTasks);
            /* Err code
            logError("Unable to find other tasks" + val);
            $location.path("/");
            */
        }

        function getRequestedTask() {
            var val = $routeParams.id;

            return datacontext.task.getById(val)
                .then(function (data) {

                    vm.task = data;
                    vm.location = data.location;
                    vm.fieldNotes = data.fieldNotes;

                }, function (error) {
                    logError("Unable to get Task with id " + val);
                    $location.path('/');
                });
        }

        // Event Callback
        function onHasChanges() {
            $scope.$on(config.events.hasChangesChanged, function (event, data) {
                $timeout(function () {
                    //any code in here will automatically have an apply run afterwards
                    if (vm.task.id < 0) {
                        $location.path('/activities/');
                    }
                    getRequestedTask();
                    getOtherTasksInActivity();
                });
            });
        }

        // Scope Functions
        vm.editTask = function () {

            if (!canEdit()) {
                return;
            }

            var modalInstance = $modal.open({
                animation: true,
                templateUrl: './app/modals/newTask.html',
                controller:
                    ['$scope', '$modalInstance', 'tasks', 'task',
                        function ($scope, $modalInstance, tasks, task) {

                            var userId = sessionStorage.userId;
                            var $q = common.$q;
                            $scope.tasks = tasks;
                            $scope.tempTask = {};

                            $scope.tempTask.completed = task.completed;
                            $scope.tempTask.name = task.name;
                            $scope.tempTask.description = task.description;

                            var bestCase = {order: 0};
                            tasks.forEach(function(el) {
                                if ((el.order < task.order) && (el.order > bestCase.order)) {
                                    bestCase = el;
                                }
                            });
                            $scope.tempTask.previousTask = (bestCase.order == 0) ? {} : bestCase;

                            $scope.selectedAllocated = task.allocatedReporters;
                            $scope.selectedAllocated.forEach(function(el) {
                                el.name = el.reporter.name;
                                el.id = el.reporter.id;
                            });
                            $scope.selectedAllowed = task.allowedReporters;
                            $scope.selectedAllowed.forEach(function (el) {
                                el.name = el.reporter.name;
                                el.id = el.reporter.id;
                            });


                            datacontext.reporter.getPartials().then(function (data) {

                                console.log("heard from getPartials", data);
                                $scope.allowedReps = data.filter(function (el) {
                                    return !($scope.selectedAllowed.indexOf(el) == -1);
                                });
                                console.log("after filter: ", $scope.allowedReps);
                                $scope.allocatedReps = data.filter(function (el) {
                                    return !$scope.selectedAllocated.includes(el);
                                });
                                $scope.currentAllowed = $scope.allowedReps[0];
                                $scope.currentAllocated = $scope.allocatedReps[0];
                            });



                            var location;
                            var initMap = function () {
                                var options = {
                                    zoom: 5,
                                    center: new google.maps.LatLng(40.178, -9.041),
                                    mapTypeId: google.maps.MapTypeId.ROADMAP
                                };
                                var rootMap = new google.maps.Map(document.getElementById('newTaskMap'), options);
                                google.maps.event.trigger(rootMap, 'resize');

                                placeMarker(new google.maps.LatLng(parseFloat($scope.locLat), parseFloat($scope.locLng)));

                                google.maps.event.addListener(rootMap, 'click', function (event) {
                                    placeMarker(event.latLng);
                                });

                                function placeMarker(newLocation) {

                                    if (location) {
                                        location.setMap(null);
                                    }

                                    location = new google.maps.Marker({
                                        position: newLocation,
                                        map: rootMap
                                    });

                                    $scope.locLat = newLocation.lat();
                                    $scope.locLng = newLocation.lng();
                                }
                            }

                            $scope.preloadMap = function () {
                                initMap();
                            }

                            $scope.locLat = task.location.lat;
                            $scope.locLng = task.location.long;

                            $scope.addNewAllowed = function () {
                                var self = this;
                                $timeout(function () {
                                    var rep = self.currentAllowed;
                                    if (!rep) {
                                        return;
                                    }

                                    self.allowedReps = self.allowedReps.filter(function (el) {
                                        return (el.id != rep.id);
                                    });
                                    self.currentAllowed = self.allowedReps[0];

                                    self.selectedAllowed.push(rep);
                                });
                            }

                            $scope.removeSelectedAllowed = function (rep) {
                                var self = this;
                                $timeout(function () {

                                    self.selectedAllowed = self.selectedAllowed.filter(function (el) {
                                        return (el.id != rep.id);
                                    });

                                    $scope.selectedAllowed = self.selectedAllowed;
                                    self.allowedReps.push(rep);
                                });
                            }


                            $scope.addNewAllocated = function () {
                                var self = this;
                                $timeout(function () {
                                    var rep = self.currentAllocated;
                                    if (!rep) {
                                        return;
                                    }

                                    self.allocatedReps = self.allocatedReps.filter(function (el) {
                                        return (el.id != rep.id);
                                    });
                                    self.currentAllocated = self.allocatedReps[0];

                                    self.selectedAllocated.push(rep);
                                });
                            }

                            $scope.removeSelectedAllocated = function (rep) {
                                var self = this;
                                $timeout(function () {

                                    self.selectedAllocated = self.selectedAllocated.filter(function (el) {
                                        return (el.id != rep.id);
                                    });

                                    $scope.selectedAllocated = self.selectedAllocated;
                                    self.allocatedReps.push(rep);
                                });
                            }

                            $scope.newTask = function () {
                                var tempTask = $scope.tempTask;
                                var allowedReps = $scope.selectedAllowed;
                                var allocatedReps = $scope.selectedAllocated;
                                var lat = $scope.locLat;
                                var lng = $scope.locLng

                                var prevOrder = (tempTask.previousTask.order || 0);
                                tempTask.order = prevOrder + 1;

                                console.log("prevTask:", tempTask.previousTask.name);
                                console.log("prevOrder:", prevOrder);

                                task.location.lat = lat;
                                task.location.long = lng;

                                task.allowedReporters = allowedReps;
                                task.allocatedReporters = allocatedReps;

                                task.name = tempTask.name;
                                task.description = tempTask.description;
                                task.completed = tempTask.completed;
                                task.order = tempTask.order;


                                common.$broadcast(events.hasChangesChanged, { hasChanges: false });

                                $modalInstance.close('add');
                            };
                            $scope.cancelNewTask = function () { $modalInstance.dismiss('cancel'); };
                        }
                    ],
                resolve: {
                    tasks: function () {
                        return vm.others;
                    },
                    task: function() {
                        return vm.task;
                    }
                }
            });
        }
    }
})();
