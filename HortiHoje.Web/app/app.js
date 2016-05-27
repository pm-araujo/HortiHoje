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
        'ui.bootstrap'      // ui-bootstrap (ex: carousel, pagination, dialog)
    ]);
    
    // Handle routing errors and success events
    app.run(['$route', '$rootScope', '$q',
        function ($route, $rootScope, $q) {
        // Include $route to kick start the router.
        breeze.core.extendQ($rootScope, $q);
        }]);        
})();