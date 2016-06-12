(function () {
    'use strict';
    var controllerId = "files";


    angular
        .module('app')
        .controller(controllerId, ['common', 'config', 'datacontext', files]);


    function files(common, config, datacontext) {
        var keyCodes = config.keyCodes;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;


        vm.title = 'Files';
        vm.activate = activate;
        vm.files = [];

        // Search bindings
        vm.filesFilter = filesFilter;
        vm.filteredFiles = [];
        vm.search = search;
        var applyFilter = function () { }

        activate();

        function activate() {
            common.activateController([getFiles()], controllerId)
                .then(function () {
                    applyFilter = common.createSearchThrottle(vm, 'files');
                    if (vm.filesSearch) { applyFilter(true); }
                    log('Activated Files View');
                });
        }

        function getFiles(forceRefresh) {
            return datacontext.file.getPartials(forceRefresh).then(function (data) {

                // Adding tags for each file as a local file variable, for searching purposes
                data.forEach(function(f) {
                    f.tagsSearchable = "";
                    f.tags.forEach(function(t) {
                        f.tagsSearchable += t.tag.name + " ";
                    });
                });

                return vm.files = vm.filteredFiles = data;
            });
        }


        function search($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.filesSearch = '';
                applyFilter(true);
            }
            else {
                applyFilter();
            }
        }

        function filesFilter(file) {
            var textContains = common.textContains;
            var searchText = vm.filesSearch;

            var isMatch = searchText
                ? textContains(file.name, searchText) ||
                  textContains(file.tagsSearchable, searchText)
                : true;

            return isMatch;
        }
    }
})();
