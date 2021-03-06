﻿(function () {
    'use strict';

    var controllerId = "activities";
    angular
        .module('app')
        .controller(controllerId, ['$location', '$modal', '$scope', '$timeout', 'datacontext', 'config', 'common', 'NgMap', activities]);


    function activities($location, $modal, $scope, $timeout, datacontext, config, common, NgMap) {
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var keyCodes = config.keyCodes;
        vm.title = 'Activities';
        vm.activities = [];

        vm.canAdd = function () {
            return (sessionStorage.isManager === "true");
        };
        vm.newActivity = newActivity;
        vm.goToActivity = goToActivity;

        // Search bindings
        vm.activitiesFilter = activitiesFilter;
        vm.filteredActivities = [];
        vm.search = search;
        var applyFilter = function () { }

        activate();


        function activate() {
            common.activateController([getActivities(), onHasChanges()], controllerId)
                .then(function () {
                    applyFilter = common.createSearchThrottle(vm, 'activities');
                    if (vm.activitiesSearch) { applyFilter(true); }

                    //log('Activated Activities View');
                });
        }

        function getActivities() {
            return datacontext.activity.getPartials().then(function (data) {
                data.forEach(function (e) {
                    // Setting Last Task Location
                    var last = 0;
                    var location = "";
                    e.lastTaskLocation = "";

                    if ((last = e.taskList.length)) {
                        location = '[' +
                            e.taskList[last - 1].location.lat +
                            ',' +
                            e.taskList[last - 1].location.long +
                            ']';
                    } else {
                        location = "";
                    }

                    NgMap.getMap({ id: e.id }).then(function (map) {

                        map.setCenter(vm.lastLocation);

                    });

                    e.lastTaskLocation = location;

                });

                vm.activities = vm.filteredActivities = data;

                return vm.activities = vm.filteredActivities = data;
            });
        }

        function goToActivity(activity) {
            if (activity && activity.id) {
                $location.path('/activity/' + activity.id);
            }
        }

        function newActivity() {

            if (!vm.canAdd()) {
                return;
            }

            var modalInstance = $modal.open({
                animation: true,
                templateUrl: './app/modals/editActivity.html',
                controller:
                    ['$scope', '$modalInstance',
                        function ($scope, $modalInstance) {

                            $scope.tempActivity = {
                                name: "",
                                description: ""
                            }
                            $scope.editActivity = function () {
                                var newActivity = datacontext.activity.create();

                                newActivity.name = $scope.tempActivity.name;
                                newActivity.description = $scope.tempActivity.description;
                                newActivity.idManager = sessionStorage.userId;

                                common.$broadcast(config.events.hasChangesChanged, { hasChanges: false });

                                $modalInstance.close('edit');
                            };
                            $scope.cancelActivityEdit = function () { $modalInstance.dismiss('cancel'); };
                        }
                    ]
            });
        }

        function search($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.activitiesSearch = '';
                applyFilter(true);
            }
            else {
                applyFilter();
            }
        }

        function activitiesFilter(activity) {
            var textContains = common.textContains;
            var searchText = vm.activitiesSearch;

            var isMatch = searchText
                ? textContains(activity.name, searchText )
                    || textContains(activity.description, searchText )
                    || textContains( activity.reporter.name, searchText )
                : true;

            return isMatch;
        }

        function onHasChanges() {
            $scope.$on(config.events.hasChangesChanged, function (event, data) {
                $timeout(function () {
                    //any code in here will automatically have an apply run afterwards
                    getActivities();
                });
            });
        }
    }
})();
