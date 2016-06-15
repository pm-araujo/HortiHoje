(function () {
    'use strict';

    var controllerId = "taskdashboard";

    angular
        .module('app')
        .controller(controllerId, ['datacontext', taskdashboard]);

    function taskdashboard(datacontext) {
        var vm = this;

        vm.title = 'taskdashboard';

        activate();

        function activate() { }
    }
})();
