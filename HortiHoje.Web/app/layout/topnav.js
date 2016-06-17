(function () {
    'use strict';

    var controllerId = "topnav";

    angular
        .module('app')
        .controller(controllerId, ['$scope', '$rootScope', '$location', '$window', 'config', 'model', 'datacontext', topnav]);

    function topnav($scope, $rootScope, $location, $window, config, model, datacontext) {
        var vm = this;
        vm.title = controllerId;
        var EntityQuery = breeze.EntityQuery;
        var entityName = model.entityNames.reporter;
        $scope.changeList = $rootScope.changeList;
        $scope.changesOutgoing = $scope.changeList.filter(function (el) { return (el.type === "outgoing"); });
        $scope.changesIncoming = $scope.changeList.filter(function (el) { return (el.type === "incoming"); });


        $scope.connectedList = [];
        
        activate();

        function activate() {
            if ( !sessionStorage.isAuthenticated )
                return;

            onHasChanges();
            onNotifyConnected();

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
            sessionStorage.removeItem('isManager');

            $location.path('/login');
            $window.location.reload();
        }

        $scope.doProfile = function () {
            datacontext.hubHello();
            console.log($rootScope.changeList);
        }

        vm.cancelChanges = function() {
            return datacontext.cancel();
        }

        vm.saveChanges = function () {
            return datacontext.sync();
        }

        function onHasChanges() {
            $scope.$on(config.events.hasChangesChanged, function (event, data) {
                $scope.changesOutgoing = $rootScope.changeList.filter(function (el) { return (el.type === "outgoing"); });
                $scope.changesIncoming = $rootScope.changeList.filter(function (el) { return (el.type === "incoming"); });
            });
        }

        function onNotifyConnected() {
            $scope.$on(config.events.notifyConnected,
                function(event, data) {
                    $scope.connectedList = data;
                    $scope.connectedCount = data.length;
                    $scope.$apply();
                });
        }

    }
})();
