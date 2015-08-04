Template.BreadcrumbCollectionTaxa.helpers({
    oneCollection: function () {
        return Collections.findOne();
    }
});

Template.CollectionTaxa.helpers({
    collectionTaxa: function () {
        return Taxa.find().fetch();
    },
    oneCollection: function () {
        return Collections.findOne();
    }
});

Template.CollectionTaxa.events({
    'click .removeTaxon': function (event, template) {
        Meteor.call('removeCollectionTaxon', this, Collections.findOne());
        var exploreTaxa = Session.get('exploreTaxa');
        var hideTaxaSlugs = _.pluck(exploreTaxa.hide, 'slug'),
            showTaxaSlugs = _.pluck(exploreTaxa.show, 'slug');
        if (hideTaxaSlugs.indexOf(this.slug) > -1) {
            exploreTaxa.hide.splice(hideTaxaSlugs.indexOf(this.slug), 1);
        } else if (showTaxaSlugs.indexOf(this.slug) > -1) {
            exploreTaxa.show.splice(showTaxaSlugs.indexOf(this.slug), 1);
        }
        Session.set('exploreTaxa', exploreTaxa)
    },
    'show.uk.modal #collectionTaxonAdd': function () {
        _.each($('form'), function (form) {
            AutoForm.resetForm(form.id);
        });
    }
});
