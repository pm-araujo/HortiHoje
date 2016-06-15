(function () {
    'use strict';

    var controllerId = "activitydashboard";

    angular
        .module('app')
        .controller( controllerId, ['$window', '$scope', '$routeParams', '$timeout', '$modal', 'datacontext', 'model', 'common', 'NgMap', activitydashboard]);
 

    function activitydashboard($window, $scope, $routeParams, $timeout, $modal, datacontext, model, common, NgMap) {
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');

        vm.title = 'activitydashboard';
        vm.activityId = $routeParams.id;
        vm.activity = undefined;

        vm.doEdit = doEdit;

        var entityNames = model.entityNames;

        vm.locations = [];

        vm.tasks = [];
        vm.lastLocation = undefined;
        vm.getTitle = getTitle;


        activate();

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
                    ['$scope', '$modalInstance', 'tasks',
                        function ($scope, $modalInstance, tasks) {

                            $scope.tasks = tasks;

                            $scope.tempTask = {
                                name: "",
                                description: "",
                                order: 0,
                                previousTask: (vm.tasks[vm.tasks.length - 1] || {}),
                                completed: false,
                                idActivity: vm.activity.id,
                                idLocation: 0
                            }
                            $scope.newTask = function () {
                                var tempTask = $scope.tempTask;
                                var prevOrder = ( tempTask.previousTask.order || 0);
                                tempTask.order = prevOrder;

                                console.log(tempTask);
                                //TODO: write new location code
                                //TODO: write new task code
                                $modalInstance.close('add');
                            };
                            $scope.cancelNewTask = function () { $modalInstance.dismiss('cancel'); };
                        }
                    ],
                resolve: {
                    tasks: function() {
                        return vm.tasks;
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

        function activate() {
            common.activateController([getRequestedActivity()], controllerId).then(function() {
                
                NgMap.getMap({id:'activityMap'}).then(function(map) {
                    if (vm.locations)
                        vm.lastLocation = vm.locations[(vm.locations.length - 1)];
                    kickstartLocations(map);
                });
                
            });
        }

        function doEdit() {
            
        }

        function getTitle() {
            return activity.name;
        }

        function getRequestedActivity() {
            var val = $routeParams.id;

            return datacontext.activity.getById(val)
                .then(function(data) {
                    

                    data.taskList.sort(compareTasks);

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
    }
})();
