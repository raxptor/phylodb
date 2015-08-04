Template.Collection.helpers({
    oneCollection: function () {
        return Collections.findOne();
    },
    collectionTaxa: function () {
        return Taxa.find();
    },
    collectionCharacterStatements: function () {
        return CharacterStatements.find();
    }
});

Template.BreadcrumbCollection.helpers({
    oneCollection: function () {
        return Collections.findOne();
    }
});

Tracker.autorun(function () {
    if (FlowRouter.subsReady('oneCollection')) {
        Session.set('exploreTaxa', {show: [], hide: Taxa.find().fetch()});
    }
});

UIkit.ready(function (){
    // console.log('UIkit is ready');
    UIkit.autocomplete($('#characterComplete'), {
        source: function (release) {
            release([]);
        }
    });
    UIkit.autocomplete($('#qualifierComplete'), {
        source: function (release) {
            console.log(this);
            release([]);
        }
    });
    /*
    UIkit.$('#taxaComplete').on('selectitem.uk.autocomplete', function (event, data, acobject) {
        var input = event.target.children[0].value.split();
        console.log(input);
        console.log(data);
        console.log(acobject);
    });
    */
});
