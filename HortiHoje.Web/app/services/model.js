(function () {
    'use strict';

    var serviceId = "model";

    angular
        .module('app')
        .factory(serviceId, model);


    function model() {
        var service = {
            configureMetadataStore: configureMetadataStore
        };

        return service;

        function configureMetadataStore(metadataStore) {
            registerReporter(metadataStore);
        }

        function registerReporter(metadataStore) {
            metadataStore.registerEntityTypeCtor('Reporter', Reporter);

            function Reporter() { }

            Object.defineProperty(Reporter.prototype, 'dateOfBirth', {
                get: function () {
                    // formatting the date
                    var dob = this.doB;
                    var val = moment.utc(dob).format('L');

                    return val;
                }
            });
        }
    }
})();