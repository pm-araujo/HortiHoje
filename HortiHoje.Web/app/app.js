(function () {
    'use strict';
    
    var app = angular.module('app', [
        // Angular modules 
        'ngAnimate',        // animations
        'ngRoute',          // routing
        'ngSanitize',       // sanitizes html bindings (ex: sidebar.js)
        'ngMap',

        // Custom modules 
        'common',           // common functions, logger, spinner
        'common.bootstrap', // bootstrap dialog wrapper functions

        // 3rd Party Modules
        'breeze.angular',   // breeze's angular library
        'breeze.directives', // breeze's angular directives plug in
        'ngFileUpload',
        'ui.bootstrap'      // ui-bootstrap (ex: carousel, pagination, dialog)
    ]);
    
    // Handle routing errors and success events
    app.run(['$route', '$rootScope', '$location','$q', 'breeze', 'datacontext', 'routeMediator',
        function ($route, $rootScope, $location, $q, breeze, datacontext, routeMediator) {
        // Include $route to kick start the router.

            routeMediator.setupRoutingHandlers();
        }]);        
})();