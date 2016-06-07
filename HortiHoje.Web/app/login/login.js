(function () {
    'use strict';

    var controllerId = 'login';

    angular
        .module('app')
        .controller(controllerId, ['$scope','$location', '$window', '$rootScope', 'common', 'datacontext', login]);

    function login($scope, $location, $window, $rootScope, common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var logError = getLogFn(controllerId, 'error');
        var logSuccess = getLogFn(controllerId, 'success');

        var vm = this;
        vm.title = 'Login';

        activate();

        $scope.doLogin = function () {
            /*
            sessionStorage.isAuthenticated = true;
            sessionStorage.userName = $scope.username;
            
            $location.path("/");
            $window.location.reload();
            */


            $("#submitButton").button("disable");
            $("#submitButton")
                .html("<i class='fa fa-circle-o-notch fa-spin'></i> Loading");

            datacontext.doLogin($scope.username, $scope.password).then(function (data) {
                if (!data) {

                    logError('Login Failed - Invalid Credentials');

                    $("#submitButton").button("enable");
                    $("#submitButton")
                        .html("<i class='fa fa-sign-in'></i> Sign In");


                    $scope.username = "";
                    $scope.password = "";


                    return;
                }
                sessionStorage.isAuthenticated = true;
                sessionStorage.userName = data.userName;
                sessionStorage.name = data.name;

                $location.path("/");
                $window.location.reload();
            });
        }


        function activate() {

            if (sessionStorage.isAuthenticated)
                $location.path('/');

            common.activateController([], controllerId)
                .then(function () { log('Activated Login View'); });
        }
    }
})();
