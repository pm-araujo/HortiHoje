(function () {
    'use strict';
    var controllerId = "reporters";


    angular
        .module('app')
        .controller(controllerId, ['common', 'datacontext', reporters]);


    function reporters(common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;


        vm.title = 'Reporters';
        vm.activate = activate;
        vm.reporters = [];

        activate();

        function activate() {
            common.activateController([getReporters()], controllerId)
                .then(function () { log('Activated Reporters View'); });
        }

        function getReporters(forceRefresh) {
            return datacontext.reporter.getPartials(forceRefresh).then(function (data) {
                return vm.reporters = data;
            });
        }
    }
})();
