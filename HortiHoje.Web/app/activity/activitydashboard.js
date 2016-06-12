(function () {
    'use strict';

    var controllerId = "activitydashboard";

    angular
        .module('app')
        .controller( controllerId, ['common', activitydashboard()]);
 

    function activitydashboard(common) {
        var vm = this;

        vm.title = 'activitydashboard';
        vm.activate = activitydashboard();


        activate();

        function activate() {
            common.activateController([], controllerId);
        }
    }
})();
