(function () {
    'use strict';

    var controllerId = "topnav";

    angular
        .module('app')
        .controller(controllerId, ['$scope', '$rootScope', '$location', '$window', 'common', 'config', 'model', 'datacontext', topnav]);

    function topnav($scope, $rootScope, $location, $window, common, config, model, datacontext) {
        var vm = this;
        vm.title = controllerId;
        var EntityQuery = breeze.EntityQuery;
        var entityName = model.entityNames.reporter;
        var $q = common.$q;
        $scope.changeList = [];

        $scope.changesOutgoing = 0;
        $scope.changesIncoming = 0;


        $scope.connectedList = [];
        
        activate();

        function activate() {
            if ( !sessionStorage.isAuthenticated )
                return;

            onHasChanges();
            onNotifyConnected();
            onNotifyChange();

            $scope.changeList = $rootScope.changeList;

            $scope.changesOutgoing = $scope.changeList.filter(function (el) { return (el.type === "outgoing"); });
            $scope.changesIncoming = $scope.changeList.filter(function (el) { return (el.type === "incoming"); });

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
            $q.when(datacontext.cancel()).then(function() {
                $scope.changesOutgoing = $rootScope.changeList.filter(function (el) { return (el.type === "outgoing"); });
                $scope.changesIncoming = $rootScope.changeList.filter(function (el) { return (el.type === "incoming"); });
            });
        }

        vm.saveChanges = function () {
            $q.when(datacontext.sync()).then(function() {
                    $scope.changesOutgoing = $rootScope.changeList.filter(function (el) { return (el.type === "outgoing"); });
                    $scope.changesIncoming = $rootScope.changeList.filter(function (el) { return (el.type === "incoming"); });
            });
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

        function onNotifyChange() {
            $scope.$on(config.events.notifyChange, function (event, data) {
                $scope.changesOutgoing = $rootScope.changeList.filter(function (el) { return (el.type === "outgoing"); });
                $scope.changesIncoming = $rootScope.changeList.filter(function (el) { return (el.type === "incoming"); });
                $scope.$apply();
            });
        }


    }
})();
