(function () {
    'use strict';

    angular
        .module('app')
        .controller('topnav', ['$scope', '$rootScope', '$location', '$window', topnav]);

    function topnav($scope, $rootScope, $location, $window) {
        var vm = this;
        vm.title = 'topnav';

        activate();

        function activate() {
            if ( !sessionStorage.isAuthenticated )
                return;

            vm.user = sessionStorage.name;
        }

        $scope.haveUser = function () {
            return sessionStorage.isAuthenticated;
        }

        $scope.doLogout = function() {

            sessionStorage.removeItem('isAuthenticated');
            sessionStorage.removeItem('userName');
            sessionStorage.removeItem('name');

            $location.path('/login');
            $window.location.reload();
        }
    }
})();
