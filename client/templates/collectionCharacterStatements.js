Template.BreadcrumbCollectionCharacterStatements.helpers({
    oneCollection: function () {
        return Collections.findOne();
    }
});

Template.CollectionCharacterStatements.helpers({
    oneCollection: function () {
        return Collections.findOne();
    },
    collectionCharacterStatements: function () {
        return CharacterStatements.find().fetch();
    }
});

Template.CollectionCharacterStatements.events({
    'show.uk.modal #collectionCharacterStatementsAdd': function () {
        _.each($('form'), function (form) {
            AutoForm.resetForm(form.id);
        });
    },
    'click .removeCharacterStatement': function (event, template) {
        Meteor.call('removeCollectionCharacterStatement', this, Collections.findOne());
    },
});
