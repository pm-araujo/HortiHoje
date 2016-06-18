(function () {
    'use strict';
    var controllerId = 'dashboard';
    angular.module('app').controller(controllerId, ['$scope', '$location', 'config', 'common', 'datacontext', dashboard]);

    function dashboard($scope, $location,config, common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;
        vm.news = {
            title: 'Hot Towel Angular',
            description: 'Hot Towel Angular is a SPA template for Angular developers.'
        };
        $scope.connectedCount = 0;
        vm.activitiesCount = 0;
        vm.taskCount = 0;
        vm.fileCount = 0;
        vm.userCount = 0;
        vm.people = [];
        vm.title = 'Dashboard';
        vm.tasks = [];
        vm.activities = [];

        vm.goToActivity = goToActivity;
        vm.goToTask = goToTask;

        activate();

        function activate() {
            var promises = [getActivitiesCount(), getActivitiesByManager(), getFileCount(), getTaskCount(), getTasksByReporter(), onNotifyConnected()];
            common.activateController(promises, controllerId)
                .then(function() {
                    // log('Activated Dashboard View');
                });
        }

        function getActivitiesCount() {
            return datacontext.activity.getCount().then(function (data) {
                return vm.activitiesCount = data;
            });
        }

        function onNotifyConnected() {
            $scope.$on(config.events.notifyConnected,
                function (event, data) {
                    $scope.connectedCount = data.length;
                    vm.userCount = data.length;
                });
        }

        function getTaskCount() {
            return datacontext.task.getCount().then(function (data) {
                return vm.taskCount = data;
            });
        }

        function getFileCount() {
            return datacontext.file.getCount().then(function (data) {
                return vm.fileCount = data;
            });
        }

        function getPeople() {
            return datacontext.getPeople().then(function (data) {
                return vm.people = data;
            });
        }

        function getTasksByReporter() {
            var userID = sessionStorage.userId;

            var reporter = {};
            
            datacontext.reporter.getById(userID).then(function(data) {
                reporter = data;
                vm.tasks = datacontext.getActivitiesWithIncompleteTasksByReporter(userID);
                console.log(vm.tasks);
            });
        }

        function getActivitiesByManager() {
            var userID = sessionStorage.userId;
            if (sessionStorage.isManager) {
                var reporter = {};

                datacontext.reporter.getById(userID).then(function (data) {
                    reporter = data;
                    vm.activities = datacontext.getActivitiesWithIncompleteTasksByReporter(userID);
                    console.log(vm.activities);
                });
            }

        }

        function goToActivity(activity) {
            if (activity && activity.id) {
                $location.path('/activity/' + activity.id);
            }
        }

        function goToTask(task) {
            if (task && task.id) {
                $location.path('/task/' + task.id);
            }
        }
    }
})();