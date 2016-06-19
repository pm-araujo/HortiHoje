(function () {
    'use strict';

    var controllerId = "taskdashboard";

    angular
        .module('app')
        .controller(controllerId, ['$location', '$routeParams', '$scope', 'common', 'config', 'datacontext', taskdashboard]);

    function taskdashboard($location, $routeParams, $scope, common, config, datacontext) {
        var vm = this;

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
            return datacontext.task.getAllOthers(vm.task.id, vm.task.idActivity)
                .then(function (data) {

                    console.log("Other Tasks: ", data);

                    vm.others = data.sort(compareTasks);
                }, function (error) {
                    logError("Unable to find other tasks" + val);
                    $location.path("/");
                });
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
    }
})();
