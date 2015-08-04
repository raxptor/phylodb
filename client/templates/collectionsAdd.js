Template.CollectionsAdd.events({
    'submit #addCollectionForm': function (event, template) {
        event.preventDefault();
        var collection = AutoForm.getFormValues(event.target.id).insertDoc;
        collection.reference = template.$('select').val()
        Meteor.call('addCollection', collection);
        UIkit.modal('#addCollections').hide();
        AutoForm.resetForm(event.target.id);
    },
    'submit #addReferenceForm': function (event, template) {
        event.preventDefault();
        var document = AutoForm.getFormValues(event.target.id).insertDoc;
        Meteor.call('addReference', document, function (err) {
            if (err) {
                console.log(err);
            } else {
                template.find('ul.uk-subnav li').click();
                AutoForm.resetForm(event.target.id);
            }
        });
    }
});

Template.CollectionsAdd.helpers({
    allReferences: function () {
        return References.find();
    },
    addReference: function () {
        return Schemas.addReference;
    }
});
