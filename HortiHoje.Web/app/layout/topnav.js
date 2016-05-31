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

            vm.user = sessionStorage.userName;
        }

        $scope.haveUser = function () {
            return sessionStorage.isAuthenticated;
        }

        $scope.doLogout = function() {

            sessionStorage.removeItem('isAuthenticated');
            sessionStorage.removeItem('userName');

            $location.path('/login');
            $window.location.reload();
        }
    }
})();
