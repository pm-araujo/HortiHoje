(function () {
    'use strict';

    var controllerId = "taskdashboard";

    angular
        .module('app')
        .controller(controllerId, ['$location', '$modal', '$routeParams', '$scope', '$timeout', '$window', 'common', 'config', 'datacontext', 'NgMap', taskdashboard]);

    function taskdashboard($location, $modal, $routeParams, $scope, $timeout, $window, common, config, datacontext, NgMap) {
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var events = config.events;
        var keyCodes = config.keyCodes;

        var logError = common.logger.getLogFn(controllerId, 'error');

        vm.title = 'taskdashboard';

        vm.task = {};
        vm.others = [];
        vm.location = {};
        vm.fieldNotes = [];

        vm.files = [];

        vm.canEdit = canEdit;

        vm.filteredFieldnotes = [];
        vm.search = search;
        vm.fieldNotesFilter = fieldNotesFilter;
        vm.fieldNotesSearch = "";
        var applyFilter = function () { }

        activate();

        function activate() {
            common.activateController([getRequestedTask(), onHasChanges()], controllerId)
                .then(function () {
                    if (!allowedIn()) {
                        logError("No permissions to be watching this task");
                        $location.path('/activity/' + vm.task.idActivity);
                    }
                    getOtherTasksInActivity();
                    getTaskFiles();

                    NgMap.getMap({ id: 'taskMap' }).then(function (map) {
                        var loc = {
                            lat: parseFloat(vm.location.lat),
                            lng: parseFloat(vm.location.long)
                        };

                        map.setCenter(loc);
                        map.setZoom(8);


                        return new google.maps.Marker({
                            position: loc,
                            map: map,
                            draggable: false,
                            animation: google.maps.Animation.DROP
                        });
                    });

                    applyFilter = common.createSearchThrottle(vm, "fieldNotes");
                    if (vm.fieldNotesSearch) { applyFilter(true); }
                });
        }

        function allowedIn() {
            return vm.task.allowedReporters.some(function (el) {
                return (el.idReporter == sessionStorage.userId);
            });
        }

        function canEdit() {
            return vm.task.allocatedReporters.some(function (el) {
                return (el.idReporter == sessionStorage.userId);
            });
        }

        function compareTasks(a, b) {
            if (a.order < b.order) {
                return -1;
            } else if (a.order > b.order) {
                return 1;
            } else {
                return 0;
            }

        }

        // Gets Files from fieldnotes in this task
        function getTaskFiles() {
            var data = datacontext.file.getAll();
            var tempNotes = vm.fieldNotes;

            data = data.filter(function (el) {   // Only MediaFiles belonging to a field note remain
                var predicate = (el.idFieldNote != null);

                predicate &= tempNotes.some(function (note) {    // Exclude Check to see if matches any fieldnote
                    return (el.idFieldNote != note.id);  
                });

                return predicate;
            });



            vm.files = data;
        }


        // Gets Other tasks in activity
        function getOtherTasksInActivity() {
            var data = datacontext.task.getAllOthers(vm.task.id, vm.task.idActivity);

            vm.others = data.sort(compareTasks);
            /* Err code
            logError("Unable to find other tasks" + val);
            $location.path("/");
            */
        }

        function getRequestedTask() {
            var val = $routeParams.id;

            return datacontext.task.getById(val)
                .then(function (data) {

                    vm.task = data;
                    vm.location = data.location;
                    data.fieldNotes.forEach(function(el) {
                        el.uniqueReporters = el.reporters.length;
                    });
                    vm.fieldNotes = vm.filteredFieldnotes = data.fieldNotes;

                }, function (error) {
                    logError("Unable to get Task with id " + val);
                    $location.path('/');
                });
        }

        // Go Back
        vm.goBack = function () {
            $window.history.back();
        };

        // Event Callback
        function onHasChanges() {
            $scope.$on(config.events.hasChangesChanged, function (event, data) {
                $timeout(function () {
                    //any code in here will automatically have an apply run afterwards
                    if (vm.task.id < 0) {
                        $location.path('/activities/');
                    }
                    getRequestedTask();
                    getOtherTasksInActivity();
                    getTaskFiles();
                });
            });
        }

        // Scope Functions
        vm.editTask = function () {

            if (!canEdit()) {
                return;
            }

            var modalInstance = $modal.open({
                animation: true,
                templateUrl: './app/modals/newTask.html',
                controller:
                    ['$scope', '$modalInstance', 'tasks', 'task',
                        function ($scope, $modalInstance, tasks, task) {

                            var userId = sessionStorage.userId;
                            var $q = common.$q;
                            $scope.tasks = tasks;
                            $scope.tempTask = {};

                            $scope.tempTask.completed = task.completed;
                            $scope.tempTask.name = task.name;
                            $scope.tempTask.description = task.description;

                            var bestCase = {order: 0};
                            tasks.forEach(function(el) {
                                if ((el.order < task.order) && (el.order > bestCase.order)) {
                                    bestCase = el;
                                }
                            });
                            $scope.tempTask.previousTask = (bestCase.order == 0) ? {} : bestCase;

                            $scope.selectedAllocated = task.allocatedReporters;
                            $scope.selectedAllocated.forEach(function(el) {
                                el.name = el.reporter.name;
                                el.id = el.reporter.id;
                            });
                            $scope.selectedAllowed = task.allowedReporters;
                            $scope.selectedAllowed.forEach(function (el) {
                                el.name = el.reporter.name;
                                el.id = el.reporter.id;
                            });


                            datacontext.reporter.getPartials().then(function (data) {

                                $scope.allowedReps = data.filter(function (el) {
                                    var isSelected = $scope.selectedAllowed.some(function(a) {
                                        return (a.idReporter == el.id);
                                    });
                                    return !(isSelected);
                                });

                                $scope.allocatedReps = data.filter(function (el) {
                                    var isSelected = $scope.selectedAllocated.some(function (a) {
                                        return (a.idReporter == el.id);
                                    });
                                    return !(isSelected);
                                });
                                $scope.currentAllowed = $scope.allowedReps[0];
                                $scope.currentAllocated = $scope.allocatedReps[0];
                            });



                            var location;
                            var initMap = function () {
                                var options = {
                                    zoom: 5,
                                    center: new google.maps.LatLng(40.178, -9.041),
                                    mapTypeId: google.maps.MapTypeId.ROADMAP
                                };
                                var rootMap = new google.maps.Map(document.getElementById('newTaskMap'), options);
                                google.maps.event.trigger(rootMap, 'resize');

                                placeMarker(new google.maps.LatLng(parseFloat($scope.locLat), parseFloat($scope.locLng)));

                                google.maps.event.addListener(rootMap, 'click', function (event) {
                                    placeMarker(event.latLng);
                                });

                                function placeMarker(newLocation) {

                                    if (location) {
                                        location.setMap(null);
                                    }

                                    location = new google.maps.Marker({
                                        position: newLocation,
                                        map: rootMap
                                    });

                                    $scope.locLat = newLocation.lat();
                                    $scope.locLng = newLocation.lng();
                                }
                            }

                            $scope.preloadMap = function () {
                                initMap();
                            }

                            $scope.locLat = task.location.lat;
                            $scope.locLng = task.location.long;

                            $scope.addNewAllowed = function () {
                                var self = this;
                                $timeout(function () {
                                    var rep = self.currentAllowed;
                                    if (!rep) {
                                        return;
                                    }

                                    self.allowedReps = self.allowedReps.filter(function (el) {
                                        return (el.id != rep.id);
                                    });
                                    self.currentAllowed = self.allowedReps[0];

                                    self.selectedAllowed.push(rep);
                                });
                            }

                            $scope.removeSelectedAllowed = function (rep) {
                                var self = this;
                                $timeout(function () {

                                    self.selectedAllowed = self.selectedAllowed.filter(function (el) {
                                        return (el.id != rep.id);
                                    });

                                    $scope.selectedAllowed = self.selectedAllowed;
                                    self.allowedReps.push(rep);
                                });
                            }


                            $scope.addNewAllocated = function () {
                                var self = this;
                                $timeout(function () {
                                    var rep = self.currentAllocated;
                                    if (!rep) {
                                        return;
                                    }

                                    self.allocatedReps = self.allocatedReps.filter(function (el) {
                                        return (el.id != rep.id);
                                    });
                                    self.currentAllocated = self.allocatedReps[0];

                                    self.selectedAllocated.push(rep);
                                });
                            }

                            $scope.removeSelectedAllocated = function (rep) {
                                var self = this;
                                $timeout(function () {

                                    self.selectedAllocated = self.selectedAllocated.filter(function (el) {
                                        return (el.id != rep.id);
                                    });

                                    $scope.selectedAllocated = self.selectedAllocated;
                                    self.allocatedReps.push(rep);
                                });
                            }

                            // editTask
                            $scope.newTask = function () {
                                var tempTask = $scope.tempTask;
                                var allowedReps = $scope.selectedAllowed;
                                var allocatedReps = $scope.selectedAllocated;
                                var lat = $scope.locLat;
                                var lng = $scope.locLng

                                var prevOrder = (tempTask.previousTask.order || 0);
                                tempTask.order = prevOrder + 1;

                                console.log("prevTask:", tempTask.previousTask.name);
                                console.log("prevOrder:", prevOrder);

                                task.location.lat = lat;
                                task.location.long = lng;

                                task.allowedReporters = allowedReps;
                                task.allocatedReporters = allocatedReps;

                                task.name = tempTask.name;
                                task.description = tempTask.description;
                                task.completed = tempTask.completed;
                                task.order = tempTask.order;


                                common.$broadcast(events.hasChangesChanged, { hasChanges: false });

                                $modalInstance.close('add');
                            };
                            $scope.cancelNewTask = function () { $modalInstance.dismiss('cancel'); };
                        }
                    ],
                resolve: {
                    tasks: function () {
                        return vm.others;
                    },
                    task: function() {
                        return vm.task;
                    }
                }
            });
        }

        vm.newFieldNote = function() {

            if (!canEdit()) {
                return;
            }

            var modalInstance = $modal.open({
                animation: true,
                templateUrl: './app/modals/newFieldNote.html',
                controller:
                    ['$scope', '$modalInstance', 'Upload', 'datacontext', 'task',
                        function ($scope, $modalInstance, Upload, datacontext, task) {

                            var userId = sessionStorage.userId;
                            var $q = common.$q;

                            // Recording Stuff

                            // Variables Record
                            var leftchannel = [];
                            var rightchannel = [];
                            var recorder = null;
                            var recording = false;
                            var recordingLength = 0;
                            var volume = null;
                            var audioInput = null;
                            var sampleRate = null;
                            var audioContext = null;
                            var context = null;

                            $scope.isRecording = false;

                            $scope.tempFieldNote = {};

                            $scope.tempFieldNote.title = "";
                            $scope.tempFieldNote.description = "";

                            $scope.files = [];
                            $scope.tags = [];


                            // editTask
                            $scope.newFieldNote = function () {
                                    var tempFieldNote = $scope.tempFieldNote;
                                    var files = $scope.files;
                                    var tags = $scope.tags;

                                    var fieldNote = datacontext.fieldnote.create();
                                    
                                    // If there's files
                                    for (var i = 0; i < files.length; i++) {
                                        var newFile = datacontext.file.create();

                                        newFile.name = files[i].name;
                                        //datacontext.generateChange(newFile);
                                        if (tags && (tags.length != 0)) {
                                            var arrTags = tags.split(',');
                                            arrTags.forEach(function(tagStr) {
                                                var tag = datacontext.tag.create();
                                                tag.name = tagStr;
                                                var mft = datacontext.mediafiletag.create({
                                                    idTag: tag.id,
                                                    idMediaFile: newFile.id
                                                });
                                                //datacontext.generateChange(tag);
                                                //datacontext.generateChange(mft);
                                            });
                                        }

                                        newFile.idFieldNote = fieldNote.id;
                                        doSave(files[i]);
                                    }

                                    var fieldNoteReporter = datacontext.fieldnotereporter.create({
                                        idReporter: userId
                                    });

                                    fieldNoteReporter.idFieldNote = fieldNote.id;

                                    fieldNote.title = tempFieldNote.title;
                                    fieldNote.description = tempFieldNote.description;
                                    fieldNote.idTask = task.id;

                                    common.$broadcast(events.hasChangesChanged, { hasChanges: false });
                                
                                    $modalInstance.close('add');
                                };

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

                            $scope.toggleRecord = toggleRecord;


                            // Function Record

                            function toggleRecord() {

                                console.log("hey, " + $scope.isRecording);

                                if ($scope.isRecording) { // stop recording
                                    $scope.isRecording = false;
                                    recorder.disconnect();
                                    saveRecording();
                                } else { // start recording

                                    setupRecorder();
                                    $scope.isRecording = true;
                                    // reset the buffers for the new recording
                                    leftchannel.length = rightchannel.length = 0;
                                    recordingLength = 0;

                                }

                            }

                            function startRecording(e) {
                                // creates the audio context
                                audioContext = window.AudioContext || window.webkitAudioContext;
                                context = new audioContext();

                                // retrieve the current sample rate to be used for WAV packaging
                                sampleRate = context.sampleRate;

                                // creates a gain node
                                volume = context.createGain();

                                // creates an audio node from the microphone incoming stream
                                audioInput = context.createMediaStreamSource(e);

                                // connect the stream to the gain node
                                audioInput.connect(volume);

                                /* From the spec: This value controls how frequently the audioprocess event is 
                                dispatched and how many sample-frames need to be processed each call. 
                                Lower values for buffer size will result in a lower (better) latency. 
                                Higher values will be necessary to avoid audio breakup and glitches */
                                var bufferSize = 2048;
                                recorder = context.createScriptProcessor(bufferSize, 2, 2);

                                recorder.onaudioprocess = function (e) {
                                    console.log('recording');
                                    var left = e.inputBuffer.getChannelData(0);
                                    var right = e.inputBuffer.getChannelData(1);
                                    // we clone the samples
                                    leftchannel.push(new Float32Array(left));
                                    rightchannel.push(new Float32Array(right));
                                    recordingLength += bufferSize;
                                }

                                // we connect the recorder
                                volume.connect(recorder);
                                recorder.connect(context.destination);
                            }

                            function saveRecording() {

                                // we flat the left and right channels down
                                var leftBuffer = mergeBuffers(leftchannel, recordingLength);
                                var rightBuffer = mergeBuffers(rightchannel, recordingLength);
                                // we interleave both channels together
                                var interleaved = interleave(leftBuffer, rightBuffer);

                                // we create our wav file
                                var buffer = new ArrayBuffer(44 + interleaved.length * 2);
                                var view = new DataView(buffer);

                                // RIFF chunk descriptor
                                writeUTFBytes(view, 0, 'RIFF');
                                view.setUint32(4, 44 + interleaved.length * 2, true);
                                writeUTFBytes(view, 8, 'WAVE');
                                // FMT sub-chunk
                                writeUTFBytes(view, 12, 'fmt ');
                                view.setUint32(16, 16, true);
                                view.setUint16(20, 1, true);
                                // stereo (2 channels)
                                view.setUint16(22, 2, true);
                                view.setUint32(24, sampleRate, true);
                                view.setUint32(28, sampleRate * 4, true);
                                view.setUint16(32, 4, true);
                                view.setUint16(34, 16, true);
                                // data sub-chunk
                                writeUTFBytes(view, 36, 'data');
                                view.setUint32(40, interleaved.length * 2, true);

                                // write the PCM samples
                                var lng = interleaved.length;
                                var index = 44;
                                var volume = 1;
                                for (var i = 0; i < lng; i++) {
                                    view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
                                    index += 2;
                                }

                                // our final binary blob
                                var blob = new Blob([view], { type: 'audio/wav' });
                                blob.lastModifiedDate = new Date();
                                blob.name = "output.wav";

                                var result = doSaveDefault(blob).then(function(result) {

                                    datacontext.transcript(result.data.returnData);
                                });
                                // let's save it locally
                                /*
                                var url = (window.URL || window.webkitURL).createObjectURL(blob);
                                var link = window.document.createElement('a');
                                link.href = url;
                                link.download = 'output.wav';
                                var click = document.createEvent("Event");
                                click.initEvent("click", true, true);
                                link.dispatchEvent(click);
                                */
                            }

                            function doSaveDefault($file) {
                                return Upload.upload({
                                    url: "./api/files/uploadStock", // webapi url
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
                                    return data;
                                }).error(function (data, status, headers, config) {
                                    // file failed to upload
                                    console.log("Error");
                                    console.log(data);
                                });
                            }

                            function setupRecorder() {
                                if (!navigator.getUserMedia)
                                    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                                                  navigator.mozGetUserMedia || navigator.msGetUserMedia;

                                if (navigator.getUserMedia) {
                                    navigator.getUserMedia({ audio: true }, startRecording, function (e) {
                                        logError('Error capturing audio: ' + e.message);
                                        return;
                                    });
                                } else { logError('Microphone not supported in this browser'); }
                            }

                            function interleave(leftChannel, rightChannel) {
                                var length = leftChannel.length + rightChannel.length;
                                var result = new Float32Array(length);

                                var inputIndex = 0;

                                for (var index = 0; index < length;) {
                                    result[index++] = leftChannel[inputIndex];
                                    result[index++] = rightChannel[inputIndex];
                                    inputIndex++;
                                }
                                return result;
                            }

                            function mergeBuffers(channelBuffer, recordingLength) {
                                var result = new Float32Array(recordingLength);
                                var offset = 0;
                                var lng = channelBuffer.length;
                                for (var i = 0; i < lng; i++) {
                                    var buffer = channelBuffer[i];
                                    result.set(buffer, offset);
                                    offset += buffer.length;
                                }
                                return result;
                            }

                            function writeUTFBytes(view, offset, string) {
                                var lng = string.length;
                                for (var i = 0; i < lng; i++) {
                                    view.setUint8(offset + i, string.charCodeAt(i));
                                }
                            }
                            $scope.cancelNewFieldNote = function () { $modalInstance.dismiss('cancel'); };
                        }
                    ],
                resolve: {
                    task: function() {
                        return vm.task;
                    }
                }
            });
        }

        // Search Stuff
        function search($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.fieldNotesSearch = '';
                applyFilter(true);
            }
            else {
                applyFilter();
            }
        }

        function searchInReporters(reporters, search) {
            var textContains = common.textContains;

            var predicate = reporters.some(function(el) {
                return textContains(el.reporter.name, search);
            });

            return predicate;
        }

        function searchInFiles(files, search) {
            var textContains = common.textContains;

            var predicate = files.some(function (el) {
                return textContains(el.name, search);
            });

            predicate |= files.some(function (el) {
                return el.tags.some(function (tag) {
                    return textContains(tag.tag.name, search);
                });
            });

            return predicate;
        }

        function fieldNotesFilter(fieldNote) {
            var textContains = common.textContains;
            var searchText = vm.fieldNotesSearch;

            var isMatch = searchText
                ? textContains(fieldNote.title, searchText) ||
                  searchInReporters(fieldNote.reporters, searchText) || searchInFiles(fieldNote.mediaFiles, searchText)
                : true;

            return isMatch;
        }

    }
})();
