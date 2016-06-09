(function () {
    'use strict';

    var controllerId = "activities";
    angular
        .module('app')
        .controller(controllerId, ['datacontext', 'config', 'common', activities]);


    function activities(datacontext, config, common) {
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var keyCodes = config.keyCodes;
        vm.title = 'Activities';
        vm.activities = [];

        // Search bindings
        vm.activitiesFilter = activitiesFilter;
        vm.filteredActivities = [];
        vm.search = search;
        var applyFilter = function () { }


        activate();

        function activate() {
            common.activateController([getActivities()], controllerId)
                .then(function () {
                    applyFilter = common.createSearchThrottle(vm, 'activities');
                    if (vm.activitiesSearch) { applyFilter(true); }

                    log('Activated Activities View');
                });
        }

        function getActivities() {
            return datacontext.activity.getPartials().then(function (data) {
                return vm.activities = vm.filteredActivities = data;
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
    }
})();
