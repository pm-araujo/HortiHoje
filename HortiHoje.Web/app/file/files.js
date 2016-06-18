(function () {
    'use strict';
    var controllerId = "files";


    angular
        .module('app')
        .controller(controllerId, ['$scope', '$modal', 'common', 'config', 'datacontext', files]);


    function files($scope, $modal, common, config, datacontext) {
        var keyCodes = config.keyCodes;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;


        vm.title = 'Files';
        vm.activate = activate;
        vm.newFile = newFile;
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

        function newFile() {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: './app/modals/newFile.html',
                controller:
                    ['$scope', '$http', '$timeout', 'Upload', '$modalInstance',
                        function ($scope, $http, $timeout, Upload, $modalInstance) {

                            $scope.tags = [];
                            $scope.upload = [];

                            $scope.update = function ($files) {
                                console.log("updated files", $files);
                                 $scope.files = $files;
                            }

                            $scope.getSize = function (bytes, decimals) {
                                if (bytes == 0) return '0 Byte';
                                var k = 1000;
                                var dm = decimals + 1 || 3;
                                var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
                                var i = Math.floor(Math.log(bytes) / Math.log(k));
                                return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
                            }

                            $scope.newFiles = function () {
                                var files = $scope.files;
                                if (files.length == 0) {
                                    return;
                                }

                                for (var i = 0; i < files.length; i++) {
                                    var newFile = datacontext.file.create({name: files[i].name});

                                    newFile.name = files[i].name;
                                    //datacontext.generateChange(newFile);
                                    var tags = $scope.tags[i];
                                    if (tags && (tags.length != 0)) {
                                        var arrTags = tags.split(',');
                                        arrTags.forEach(function(tagStr) {
                                            var tag = datacontext.tag.create();
                                            tag.name = tagStr;
                                            var mft = datacontext.mediafiletag.create({tag: tag, mediaFile: newFile});
                                            //datacontext.generateChange(tag);
                                            //datacontext.generateChange(mft);
                                        });
                                    }
                                    
                                    
                                    doSave(files[i]);
                                }

                            }

                            function doSave($file) {
                                Upload.upload({
                                    url: "./api/files/upload", // webapi url
                                    method: "POST",
                                    fileName: $file.name,
                                    file: $file
                                }).progress(function (evt) {
                                    // get upload percentage
                                    console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                                }).success(function (data, status, headers, config) {
                                    // file is uploaded successfully
                                    console.log("Success");
                                    console.log(data);
                                }).error(function (data, status, headers, config) {
                                    // file failed to upload
                                    console.log("Error");
                                    console.log(data);
                                });
                            }

                            $scope.abortUpload = function (index) {
                                $scope.upload[index].abort();
                            }
                        }
                    ]
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
