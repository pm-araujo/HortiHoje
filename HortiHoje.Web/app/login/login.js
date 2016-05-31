(function () {
    'use strict';

    var controllerId = 'login';

    angular
        .module('app')
        .controller(controllerId, ['$scope','$location', '$window', '$rootScope', 'common', login]);

    function login($scope, $location, $window, $rootScope, common) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;
        vm.title = 'Login';

        activate();

        $scope.doLogin = function () {
            sessionStorage.isAuthenticated = true;
            sessionStorage.userName = $scope.username;

            $location.path("/");
            $window.location.reload();
        }


        function activate() {
            if (sessionStorage.isAuthenticated)
                $location.path('/');

            common.activateController([], controllerId)
                .then(function () { log('Activated Login View'); });
        }
    }
})();
