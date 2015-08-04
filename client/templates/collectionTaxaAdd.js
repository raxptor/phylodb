Template.CollectionTaxaAdd.events({
    'submit #addCollectionTaxonForm': function (event, template) {
        event.preventDefault();
        var taxon = AutoForm.getFormValues(template.find('form').id),
            collection = Collections.findOne();
        Meteor.call('addCollectionTaxon', taxon.insertDoc, collection, function (err, newTaxon) {
            if (err) {
                console.log('An error occurred!');
            } else {
                var exploreTaxa = Session.get('exploreTaxa');
                var taxaSlugs = _.union(_.pluck(exploreTaxa.hide, 'slug'),
                                        _.pluck(exploreTaxa.show, 'slug'));
                if (taxaSlugs.indexOf(newTaxon.slug) == -1) {
                    exploreTaxa.hide.push(newTaxon);
                    exploreTaxa.hide = _.sortBy(exploreTaxa.hide, 'slug');
                    Session.set('exploreTaxa', exploreTaxa);
                }
                UIkit.modal('#collectionTaxonAdd').hide();
            }
        });
        AutoForm.resetForm(template.find('form').id);
    }
});

UIkit.ready(function () {
    // console.log('UIkit is ready');
    UIkit.autocomplete($('#taxaComplete'), {
        source: function (release) {
            try {
                var term = new RegExp(s.escapeHTML(this.value));
                var taxa = Taxa.find({name: {$regex: term, $options: 'i'}}).fetch();
                var output = _.map(taxa, function (taxon) {
                    return {'value': taxon.name, 'title': taxon.name, 'url': '#', 'text': ''};
                });
                release(output);
            } catch (e) {
                // console.log('Error!', e);
            }
        }
    });
})
