(function () {
    'use strict';

    var controllerId = "activities";
    angular
        .module('app')
        .controller(controllerId, ['$location', 'datacontext', 'config', 'common', 'NgMap', activities]);


    function activities($location, datacontext, config, common, NgMap) {
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var keyCodes = config.keyCodes;
        vm.title = 'Activities';
        vm.activities = [];

        vm.goToActivity = goToActivity;

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
                console.log(data[0].taskList[0].allowedReporters);


                
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
