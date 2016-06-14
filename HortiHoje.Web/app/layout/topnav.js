(function () {
    'use strict';

    var controllerId = "topnav";

    angular
        .module('app')
        .controller(controllerId, ['$scope', '$rootScope', '$location', '$window', 'config', 'model', 'datacontext', topnav]);

    function topnav($scope, $rootScope, $location, $window, config, model, datacontext) {
        var vm = this;
        vm.title = controllerId;
        var EntityQuery = breeze.EntityQuery;
        var entityName = model.entityNames.reporter;

        activate();

        function activate() {
            if ( !sessionStorage.isAuthenticated )
                return;

            onHasChanges();

            vm.user = sessionStorage.userFullName;
            sessionStorage.isAuthenticated = true;
        }

        $scope.haveUser = function () {
            return sessionStorage.isAuthenticated;
        }

        $scope.doLogout = function() {

            sessionStorage.removeItem('isAuthenticated');
            sessionStorage.removeItem('userName');
            sessionStorage.removeItem('userFullName');
            sessionStorage.removeItem('userId');

            $location.path('/login');
            $window.location.reload();
        }

        $scope.doProfile = function () {

        }

        vm.cancelChanges = function() {
            return datacontext.cancel();
        }

        vm.saveChanges = function () {
            return datacontext.save();
        }

        function onHasChanges() {
            $scope.$on(config.events.hasChangesChanged, function(event, data) {
                console.log(controllerId + ": detected has changes");
                console.log(data);
            });
        }
    }
})();
