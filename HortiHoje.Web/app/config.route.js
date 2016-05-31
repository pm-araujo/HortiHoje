(function () {
    'use strict';

    var app = angular.module('app');

    // Collect the routes
    app.constant('routes', getRoutes());
    
    // Configure the routes and route resolvers
    app.config(['$routeProvider', 'routes', routeConfigurator]);
    function routeConfigurator($routeProvider, routes) {

        routes.forEach(function (r) {
            $routeProvider.when(r.url, r.config);
        });
        $routeProvider.otherwise({ redirectTo: '/login' });
    }

    // Define the routes 
    function getRoutes() {
        return [
            {
                url: '/login',
                authenticate: false,
                config: {
                    templateUrl: 'app/login/login.html',
                    title: 'login',
                }
            },
            {
                url: '/',
                authenticate: true,
                config: {
                    templateUrl: 'app/dashboard/dashboard.html',
                    title: 'dashboard',
                    settings: {
                        nav: 1,
                        content: '<i class="fa fa-dashboard"></i> Dashboard'
                    }
                }
            }, {
                url: '/admin',
                authenticate: true,
                config: {
                    title: 'admin',
                    templateUrl: 'app/admin/admin.html',
                    settings: {
                        nav: 2,
                        content: '<i class="fa fa-lock"></i> Admin'
                    }
                }
            }, {
                url: '/reporters',
                authenticate: true,
                config: {
                    title: 'reporters',
                    templateUrl: 'app/reporter/reporters.html',
                    settings: {
                        nav: 3,
                        content: '<i class="fa fa-calendar"></i> Reporters'
                    }
                }
            }
        ];
    }
})();