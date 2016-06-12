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
    }
})();
