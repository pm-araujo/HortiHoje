(function () {
    'use strict';

    var controllerId = "activities";
    angular
        .module('app')
        .controller(controllerId, ['datacontext', 'common', activities]);


    function activities(datacontext, common) {
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        vm.title = 'Activities';
        vm.activities = [];

        activate();

        function activate() {
            common.activateController([getActivities()], controllerId)
                .then(function () { log('Activated Activities View') });
        }

        function getActivities() {
            return datacontext.getActivityPartials().then(function (data) {
                return vm.activities = data;
            });
        }
    }
})();
