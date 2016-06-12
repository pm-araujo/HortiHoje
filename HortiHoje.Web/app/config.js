(function () {
    'use strict';

    var app = angular.module('app');

    // Configure Toastr
    toastr.options.timeOut = 4000;
    toastr.options.positionClass = 'toast-bottom-right';

    // For use with the HotTowel-Angular-Breeze add-on that uses Breeze
    var remoteServiceName = 'breeze/Breeze';

    var baseDownloadPath = "../content/files/";

    var keyCodes = {
        backspace: 8,
        tab: 9,
        enter: 13,
        esc: 27,
        space: 32,
        pageup: 33,
        pagedown: 34,
        end: 35,
        home: 36,
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        insert: 45,
        del: 46
    };

    var events = {
        controllerActivateSuccess: 'controller.activateSuccess',
        spinnerToggle: 'spinner.toggle'
    };

    function resolveFileImage(file) {
        var arr = file.split('.');
        var unknown = "fa fa-file fa-5x";
        var base = "fa fa-";
        var ext = "";

        if (ext = arr[arr.length - 1]) {

            switch(ext.toLowerCase()) {
                case 'jpg':
                case 'jpeg':
                case 'png':
                case 'gif':
                case 'tiff':
                case 'bmp':
                case 'svg':
                    base += "file-image-o ";
                    break;

                case 'mp4':
                case 'mkv':
                case 'avi':
                case 'ogv':
                case 'wmv':
                case 'flv':
                case 'webm':
                case 'mpeg':
                    base += "file-video-o ";
                    break;

                case 'zip':
                case 'rar':
                case 'tar':
                case 'gz':
                case '7z':
                    base += "file-archive-o ";
                    break;

                case 'mp3':
                case 'fmpg':
                case 'aac':
                case 'flac':
                case 'ogg':
                case 'wav':
                case 'wma':
                    base += "file-audio-o ";
                    break;

                case 'pdf':
                    base += "file-pdf-o ";
                    break;

                case 'docx':
                case 'doc':
                    base += "file-word-o ";
                    break;

                case 'pptx':
                case 'ppt':
                    base += "file-powerpoint-o ";
                    break;

                case 'csv':
                case 'xls':
                case 'xlsx':
                    base += "file-excel-o ";
                    break;

                default:
                    base += "file"
            }

        } else {
            base += "file";
        }

        return base += " fa-4x stack";
    }

    var config = {
        appErrorPrefix: '[HH Error] ', //Configure the exceptionHandler decorator
        docTitle: 'HortiHoje: ',
        events: events,
        keyCodes: keyCodes,
        remoteServiceName: remoteServiceName,
        resolveFileImage: resolveFileImage,
        baseDownloadPath: baseDownloadPath,
        version: '0.1.0'
    };

    app.value('config', config);
    
    app.config(['$logProvider', function ($logProvider) {
        // turn debugging off/on (no info or warn)
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(true);
        }
    }]);
    
    //#region Configure the common services via commonConfig
    app.config(['commonConfigProvider', function (cfg) {
        cfg.config.controllerActivateSuccessEvent = config.events.controllerActivateSuccess;
        cfg.config.spinnerToggleEvent = config.events.spinnerToggle;
    }]);
    //#endregion
})();