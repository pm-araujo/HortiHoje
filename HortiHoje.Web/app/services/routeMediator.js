(function () {
    'use strict';

    var serviceId = "routeMediator";

    angular
        .module('app')
        .factory( serviceId, ['$rootScope', '$location', 'logger', 'config', routeMediator]);


    function routeMediator($rootScope, $location, logger, config) {
        var service = {
            setupRoutingHandlers: setupRoutingHandlers
        };
        var handleRouteChangeError = false;

        return service;

        function setupRoutingHandlers() {
            authCheck();
            handleRoutingErrors();
            updateDocTitle();
        }

        function handleRoutingErrors() {
            $rootScope.$on("$routeChangeError",
                function (event, current, previous, reason) {

                    if (handleRouteChangeError) { return; }
                    handleRouteChangeError = true;

                    var msg = "Error Routing - " + (current && current.name) +
                        ": " + (reason.msg || '');
                    logger.logWarning(msg, current, serviceId, true);
                    $location.path("/");
                });
        }

        function updateDocTitle() {

            $rootScope.$on('$routeChangeSuccess',
                function (event, current, previous) {
                    handleRouteChangeError = false;
                    var title = config.docTitle + ' ' + (current.title || '');

                    $rootScope.title = title;
                });
        }

        function authCheck() {
            $rootScope.$on('$routeChangeStart',
                function (e, next, current) {
                    if (!sessionStorage.isAuthenticated) {
                        if (next.templateUrl === "app/login/login.html") {
                        } else {
                            e.preventDefault();
                            $location.path("/login");
                        }
                    }
                });
        }

    }
})();