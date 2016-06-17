(function () {
    'use strict';
    var controllerId = 'dashboard';
    angular.module('app').controller(controllerId, ['common', 'datacontext', dashboard]);

    function dashboard(common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;
        vm.news = {
            title: 'Hot Towel Angular',
            description: 'Hot Towel Angular is a SPA template for Angular developers.'
        };
        vm.activitiesCount = 0;
        vm.people = [];
        vm.title = 'Dashboard';
        vm.tasks = [];
        vm.activities = [];
        activate();

        function activate() {
            var promises = [getActivitiesCount(), getActivitiesByManager(), getTasksByReporter()];
            common.activateController(promises, controllerId)
                .then(function () { log('Activated Dashboard View'); });
        }

        function getActivitiesCount() {
            return datacontext.activity.getCount().then(function (data) {
                return vm.activitiesCount = data;
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
    }
})();