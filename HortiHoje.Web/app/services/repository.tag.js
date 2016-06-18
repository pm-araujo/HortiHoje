(function () {
    'use strict';

    var serviceId = 'repository.tag';
    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', RepositoryTag]);

    function RepositoryTag(model, AbstractRepository) {
        var Predicate = breeze.Predicate;
        var entityName = model.entityNames.tag;
        var EntityQuery = breeze.EntityQuery;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;

            // Exposed data access functions
            this.attach = attach;
            this.create = create;
            this.getCount = getCount;
            this.getPartials = getPartials;
            this.getById = getById;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        // Attach New Location
        function attach(loc) {
            return this.manager.attachEntity(loc);
        }

        // Create New Location
        function create() {
            return this.manager.createEntity(entityName);
        }

        // getTagsCount
        function getCount() {
            var self = this;

            return self.$q.when(self._getLocalCount(entityName));
        }

        // get Tag by id
        function getById(id, forceRemote) {
            return this._getById(entityName, id, forceRemote);
        }

        // datacontext.tag.getPartials
        function getPartials(forceRefresh) {
            var self = this;
            var tags;

            if (!forceRefresh) {
                tags = self._getAllLocal(entityName);

                return self.$q.when(tags);
            }

            return EntityQuery.from('Tags')
                .select('*')
                .toType(entityName)
                .using(self.manager).execute()
                .to$q(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                tags = data.results;
                self.log('Retrieved [Tag Partials] from remote data source', tags.length, true);
                return tags;
            }
        }
    }
})();