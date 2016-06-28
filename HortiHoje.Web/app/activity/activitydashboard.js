(function () {
    'use strict';

    var controllerId = "activitydashboard";

    angular
        .module('app')
        .controller( controllerId, ['$location', '$modal', '$scope', '$routeParams', '$timeout', '$window', 'config', 'datacontext', 'model', 'common', 'NgMap', activitydashboard]);
 

    function activitydashboard($location, $modal, $scope, $routeParams, $timeout, $window, config, datacontext, model, common, NgMap) {
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var events = config.events;

        vm.title = 'activitydashboard';
        vm.activityId = $routeParams.id;
        vm.activity = undefined;

        var entityNames = model.entityNames;

        vm.locations = [];

        vm.tasks = [];
        vm.lastLocation = undefined;
        vm.getTitle = getTitle;


        activate();


        function activate() {
            common.activateController([getRequestedActivity(), onHasChanges()], controllerId).then(function () {

                NgMap.getMap({ id: 'activityMap' }).then(function (map) {
                    if (vm.locations)
                        vm.lastLocation = vm.locations[(vm.locations.length - 1)];
                    kickstartLocations(map);
                });

                datacontext.doReport(vm.activity);

            });
        }

        vm.goBack = function() {
            $window.history.back();
        };

        vm.canAdd = function () {
            return (vm.activity.idManager == sessionStorage.userId);
        };

        vm.newTask = function () {

            if (!vm.canAdd()) {
                return;
            }

            var modalInstance = $modal.open({
                animation: true,
                templateUrl: './app/modals/newTask.html',
                controller:
                    ['$scope', '$modalInstance', 'tasks', 'manager',
                        function($scope, $modalInstance, tasks, manager) {

                            var userId = sessionStorage.userId;
                            var $q = common.$q;
                            $scope.tasks = tasks;

                            var data = datacontext.reporter.getById(userId);
                            console.log("heard from getById", data);
                            $scope.selectedAllocated = [manager];
                            $scope.selectedAllowed = [manager];

                            data = datacontext.reporter.getAllExcept(userId);
                            console.log("heard from getAllExcept", data);
                            $scope.allowedReps = data;
                            $scope.allocatedReps = data;
                            $scope.currentAllowed = data[0];
                            $scope.currentAllocated = data[0];

                            var location;
                            var initMap = function() {
                                var options = {
                                    zoom: 5,
                                    center: new google.maps.LatLng(40.178, -9.041),
                                    mapTypeId: google.maps.MapTypeId.ROADMAP
                                };
                                var rootMap = new google.maps.Map(document.getElementById('newTaskMap'), options);
                                google.maps.event.trigger(rootMap, 'resize');

                                if (location) {
                                    placeMarker(new google.maps.LatLng(parseFloat($scope.locLat), parseFloat($scope.locLng)));
                                }

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

                            $scope.preloadMap = function() {
                                initMap();
                            }

                            $scope.tempTask = {
                                name: "",
                                description: "",
                                order: 0,
                                previousTask: (vm.tasks[vm.tasks.length - 1] || {}),
                                completed: false,
                                idActivity: vm.activity.id,
                                idLocation: 0
                            }

                            $scope.locLat = "0";
                            $scope.locLng = "0";

                            $scope.addNewAllowed = function () {
                                var self = this;
                                $timeout(function() {
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

                                    self.selectedAllowed = self.selectedAllowed.filter(function(el) {
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

                                var prevOrder = ( tempTask.previousTask.order || 0);
                                tempTask.order = prevOrder + 1;

                                var task = datacontext.task.create();
                                var loc = datacontext.location.create();

                                loc.lat = lat;
                                loc.long = lng;

                                task.idActivity = tempTask.idActivity;
                                task.idLocation = loc.id;


                                allowedReps.forEach(function(el) {
                                    var taskAllow = datacontext.taskallowedreporter.create({
                                        idTask: task.id,
                                        idReporter: el.id
                                    });
                                });

                                allocatedReps.forEach(function(el) {
                                    var taskAlloc = datacontext.taskallocatedreporter.create({
                                        idTask: task.id,
                                        idReporter: el.id
                                    });
                                });



                                task.name = tempTask.name;
                                task.description = tempTask.description;
                                task.order = tempTask.order;

                                common.$broadcast(events.hasChangesChanged, { hasChanges: false });
                                
                                $modalInstance.close('add');
                            };
                            $scope.cancelNewTask = function () { $modalInstance.dismiss('cancel'); };
                        }
                    ],
                resolve: {
                    tasks: function() {
                        return vm.tasks;
                    },
                    manager: function() {
                        return vm.activity.reporter;
                    }
                }
            });
        }

        vm.canEdit = function() {
            return (vm.activity.idManager == sessionStorage.userId);
        };

        vm.editActivity = function () {

            if (!vm.canEdit()) {
                return;
            }

            var modalInstance = $modal.open({
                animation: true,
                templateUrl: './app/modals/editActivity.html',
                controller: 
                    ['$scope', '$modalInstance',
                        function ($scope, $modalInstance) {

                            $scope.tempActivity = {
                                name: vm.activity.name,
                                description : vm.activity.description
                            }
                            $scope.editActivity = function () {
                                vm.activity.name = $scope.tempActivity.name;
                                vm.activity.description = $scope.tempActivity.description;
                                
                                $modalInstance.close('edit');
                            };
                            $scope.cancelActivityEdit = function () { $modalInstance.dismiss('cancel'); };
                        }
                    ]
            });
        }

        vm.goToTask = function(task) {
            if (task && task.id) {
                $location.path('/task/' + task.id);
            }
        }

        vm.sendReport = function() {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: './app/modals/sendReport.html',
                controller:
                    ['$scope', '$modalInstance', 'datacontext', 'activity',
                        function ($scope, $modalInstance, datacontext, activity) {

                            $scope.info = {
                                email: ""
                            };

                            $scope.doSendReport = function() {
                                var email = $scope.info.email;
                                datacontext.sendReport(email);

                                $modalInstance.close('add');
                            };

                            $scope.cancelSendReport = function () { $modalInstance.dismiss('cancel'); };
                        }
                    ],
                resolve: {
                    activity: function () { return vm.activity; }
                }
            });
        }

        $scope.indexChar = function (index) {
            return String.fromCharCode(65 + index);
        };

        $scope.zoomToIncludeMarkers = function (locations) {
            var bounds = new google.maps.LatLngBounds();
            locations.forEach(function (l) {
                bounds.extend(l);
            });
            vm.map.fitBounds(bounds);
            if (locations.length == 1) {
                vm.map.setZoom(5);
            }
        };

        function getTitle() {
            return activity.name;
        }

        function getRequestedActivity() {
            var val = $routeParams.id;

            return datacontext.activity.getById(val)
                .then(function(data) {
                    

                    data.taskList = data.taskList.sort(compareTasks);
                    vm.tasks = [];
                    vm.locations = [];

                    data.taskList.forEach(function (t) {
                        
                        if (t.description.length > 23) {
                            t.shortenedDescript = t.description.substring(0, 20) + "...";
                        } else {
                            t.shortenedDescript = t.description;
                        }

                        t.finished = t.completed ? "check" : "times";
                        
                        vm.tasks.push(t);

                        if (t.location) {
                           var newMarker = new google.maps.LatLng(t.location.lat, t.location.long);
                           vm.locations.push(newMarker);

                        }

                    });

                    vm.activity = data;
                }, function(error) {
                    logError("Unable to get Activity with id " + val);
                });
        }

        function kickstartLocations(map) {

            var iterator = 0;

            vm.map = map = new google.maps.Map(document.getElementById('activityMap'), {
                zoom: 12,
                center: vm.lastLocation
            });

            for (var i = 0; i < vm.locations.length; i++) {
                $timeout(function() {
                        // add a marker this way does not sync. marker with <marker> tag
                        new google.maps.Marker({
                            position: vm.locations[iterator++],
                            map: map,
                            draggable: false,
                            label: String.fromCharCode(64 + iterator),
                            animation: google.maps.Animation.DROP
                        });
                        $scope.zoomToIncludeMarkers(vm.locations);
                    },
                    i * 200);

            }
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

        function onHasChanges() {
            $scope.$on(config.events.hasChangesChanged, function (event, data) {
                $timeout(function () {
                    //any code in here will automatically have an apply run afterwards
                    if (vm.activityId < 0) {
                        $location.path('/activities/');
                    }
                    getRequestedActivity();
                });
            });
        }
    }
})();
