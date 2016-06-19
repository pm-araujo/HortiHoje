(function () {
    'use strict';

    var app = angular.module('app');

    // Collect the routes
    app.constant('routes', getRoutes());
    
    // Configure the routes and route resolvers
    app.config(['$routeProvider', 'routes', routeConfigurator]);
    function routeConfigurator($routeProvider, routes) {

        routes.forEach(function (r) {
            // $routeProvider.when(r.url, r.config);
            setRoute(r.url, r.config);
        });
        $routeProvider.otherwise({ redirectTo: '/login' });

        function setRoute(url, definition) {
            // Sets resolvers for all of the routes
            //      by extending any existing resolvers (or creating a new one ).
            definition.resolve = angular.extend(definition.resolve || {}, {
                prime: prime
            });
            $routeProvider.when(url, definition);
            return $routeProvider;
        }
    }

    prime.$inject = ['datacontext'];
    function prime(datacontext) {
        return datacontext.primeData();
    }

    // Define the routes 
    function getRoutes() {
        return [
            {
                url: '/login',
                config: {
                    templateUrl: 'app/login/login.html',
                    title: 'login',
                }
            },
            {
                url: '/',
                config: {
                    templateUrl: 'app/dashboard/dashboard.html',
                    title: 'dashboard',
                    settings: {
                        nav: 1,
                        content: '<i class="fa fa-dashboard"></i> Dashboard'
                    }
                }
            }, {
                url: '/activities',
                config: {
                    title: 'activities',
                    templateUrl: 'app/activity/activities.html',
                    settings: {
                        nav: 2,
                        content: '<i class="fa fa-calendar"></i> Activities'
                    }
                }
            }, {
                url: '/activity/:id',
                config: {
                    title: 'activity',
                    templateUrl: 'app/activity/activitydashboard.html'
                }
            }, {
                url: '/task/:id',
                config: {
                    title: 'task',
                    templateUrl: 'app/activity/task/taskdashboard.html'
                }
            }, {
                url: '/files',
                config: {
                    title: 'files',
                    templateUrl: 'app/file/files.html',
                    settings: {
                        nav: 3,
                        content: '<i class="fa fa-file"></i> Files'
                    }
                }
            }
        ];
    }
})();