(function () {
    'use strict';

    angular
        .module('app')
        .controller('topnav', ['$scope', '$rootScope', '$location', '$window', 'model', 'datacontext', topnav]);

    function topnav($scope, $rootScope, $location, $window, model, datacontext) {
        var vm = this;
        vm.title = 'topnav';
        var EntityQuery = breeze.EntityQuery;
        var entityName = model.entityNames.reporter;

        activate();

        function activate() {
            if ( !sessionStorage.isAuthenticated )
                return;

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
    }
})();
