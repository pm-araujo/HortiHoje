(function () {
    'use strict';
    
    var app = angular.module('app', [
        // Angular modules 
        'ngAnimate',        // animations
        'ngRoute',          // routing
        'ngSanitize',       // sanitizes html bindings (ex: sidebar.js)

        // Custom modules 
        'common',           // common functions, logger, spinner
        'common.bootstrap', // bootstrap dialog wrapper functions

        // 3rd Party Modules
        'breeze.angular',   // breeze's angular library
        'breeze.directives', // breeze's angular directives plug in

        'ui.bootstrap'      // ui-bootstrap (ex: carousel, pagination, dialog)
    ]);
    
    // Handle routing errors and success events
    app.run(['$route', '$rootScope', '$location','$q', 'breeze', 'datacontext',
        function ($route, $rootScope, $location, $q, breeze, datacontext) {
        // Include $route to kick start the router.
            $rootScope.$on('$routeChangeStart',
                function (e, next, current) {
                    if ( !sessionStorage.isAuthenticated ) {
                        if (next.templateUrl === "app/login/login.html") {
                        } else {
                            e.preventDefault();
                            $location.path("/login");
                        }
                    }
                }
            );

            if( sessionStorage.isAuthenticated )
                datacontext.primeData();
        }]);        
})();