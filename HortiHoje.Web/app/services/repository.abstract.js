﻿(function () {
    'use strict';

    var serviceId = 'repository.abstract';

    angular.module('app').factory(serviceId, ['$q', 'common', 'config', AbstractRepository]);

    function AbstractRepository($q, common, config) {
        var EntityQuery = breeze.EntityQuery;
        var logError = common.logger.getLogFn(this.serviceId, 'error');

        // Abstract repo gets its derived object's this.manager
        function Ctor() {
        }

        Ctor.extend = function (repoCtor) {
            // Allow this repo to have access to the Abstract Repo's functions,
            // then put its own Ctor back on itself.
            // See http://stackoverflow.com/questions/8453887/why-is-it-necessary-to-set-the-prototype-constructor
            repoCtor.prototype = new Ctor();
            repoCtor.prototype.constructor = repoCtor;
        };

        // Shared by repository classes 
        Ctor.prototype._getAllLocal = _getAllLocal;
        Ctor.prototype._getById = _getById;
        Ctor.prototype._getInlineCount = _getInlineCount;
        Ctor.prototype._getLocalCount = _getLocalCount;
        Ctor.prototype._queryFailed = _queryFailed;
        // Convenience functions for the Repos
        Ctor.prototype.log = common.logger.getLogFn(this.serviceId);
        Ctor.prototype.$q = common.$q;

        return Ctor;


        function _getAllLocal(resource, ordering, predicate) {
            return EntityQuery.from(resource)
                .orderBy(ordering)
                .where(predicate)
                .using(this.manager)
                .executeLocally();
        }

        function _getById(entityName, id, forceRemote) {
            var self = this;
            var manager = self.manager;

            if (!forceRemote) {
                // check cache first
                var entity = manager.getEntityByKey(entityName, id);
                
                if (entity ) {
                    
                    if (entity.entityAspect.entityState.isDeleted()) {
                        entity = null; // hide session marked-for-delete
                    }

                    return self.$q.when(entity);
                }
            }

            // check server
            return manager.fetchEntityByKey(entityName, id)
                .to$q(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                entity = data.entity;
                if (!entity) {
                    self.logError("Error retrieving " + entityName + " from server.");
                    return null;
                }

                return entity;
            }

        }

        function _getLocalCount(resource, predicate) {
            var entities = EntityQuery.from(resource)
                .where(predicate)
                .using(this.manager)
                .executeLocally();
            return entities.length;
        }

        function _getInlineCount(data) { return data.inlineCount; }

        function _queryFailed(error) {
            var msg = config.appErrorPrefix + 'Error retrieving data.' + error.message;
            logError(msg, error);
            throw error;
        }
    }
})();