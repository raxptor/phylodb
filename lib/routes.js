var home = FlowRouter.group({
    prefix: '/'
});

home.route('/', {
    action: function () {
        FlowLayout.render('Layout', {topbar: 'TopBar', header: 'Header', breadcrumb: 'BreadcrumbHome', main: 'Home'});
    },
    name: 'home'
});

var allCollections = FlowRouter.group({
    prefix: '/collections',
    subscriptions: function () {
        this.register('allReferences', Meteor.subscribe('allReferences'));
    }
});

allCollections.route('/', {
    subscriptions: function () {
        this.register('allCollections', Meteor.subscribe('allCollections'));
    },
    action: function () {
        FlowLayout.render('Layout', {topbar: 'TopBar', header: 'Header', breadcrumb: 'BreadcrumbCollections', main: 'Collections'});
    },
    name: 'allCollections'
});

var oneCollection = allCollections.group({
    prefix: '/:id',
    subscriptions: function (params, queryParams) {
        this.register('oneCollection', Meteor.subscribe('oneCollection', params.id));
        this.register('collectionTaxa', Meteor.subscribe('collectionTaxa', params.id));
        this.register('collectionCharacterStatements', Meteor.subscribe('collectionCharacterStatements', params.id));
    }
});

oneCollection.route('/', {
    action: function () {
        FlowLayout.render('Layout', {topbar: 'TopBar', header: 'Header', breadcrumb: 'BreadcrumbCollection', main: 'Collection'});
    },
    name: 'oneCollection'
});

oneCollection.route('/taxa', {
    action: function () {
        FlowLayout.render('Layout', {topbar: 'TopBar', header: 'Header', breadcrumb: 'BreadcrumbCollectionTaxa', main: 'CollectionTaxa'});
    },
    name: 'oneCollectionTaxa'
});

oneCollection.route('/characters', {
    action: function () {
        FlowLayout.render('Layout', {topbar: 'TopBar', header: 'Header', breadcrumb: 'BreadcrumbCollectionCharacterStatements', main: 'CollectionCharacterStatements'});
    },
    name: 'oneCollectionCharacterStatements'
});

oneCollection.route('/browse', {
    action: function () {
        FlowLayout.render('Layout', {topbar: 'TopBar', header: 'Header', breadcrumb: 'BreadcrumbCollectionBrowse', main: 'CollectionBrowse'});
    },
    name: 'oneCollectionBrowse'
});
