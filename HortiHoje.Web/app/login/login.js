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

            var username = ($scope.username || "");
            var password = ($scope.password || "");


            $("#submitButton").prop("disabled", true);
            $("#submitButton")
                .html("<i class='fa fa-circle-o-notch fa-spin'></i> Loading");

            datacontext.reporter.doLogin(username, password).then(function (data) {
                if (!data) {

                    logError('Login Failed - Invalid Credentials');

                    $("#submitButton").prop("disabled", false);
                    $("#submitButton")
                        .html("<i class='fa fa-sign-in'></i> Sign In");


                    $scope.username = "";
                    $scope.password = "";

                    $("#inputUserName").focus();


                    return;
                }
                sessionStorage.isAuthenticated = true;
                sessionStorage.userName = data.userName;
                sessionStorage.userId = data.id;
                sessionStorage.userFullName = data.name;
                sessionStorage.isManager = data.isManager;


                $location.path("/");
                $window.location.reload();
            });
        }


        function activate() {

            if (sessionStorage.isAuthenticated)
                $location.path('/');

            $("#inputUserName").focus();

            common.activateController([], controllerId)
                .then(function() {
                    // log('Activated Login View');
                });
        }
    }
})();
