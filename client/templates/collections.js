Template.Collections.events({
    'click .editCollection': function () {
        alert('This doesn\'t work yet!');
    },
    'click .deleteCollection': function () {
        alert('This doesn\'t work yet!');
        // Meteor.call('deleteCollection', this._id);
    },
    'show.uk.modal #addCollections': function () {
        _.each($('form'), function (form) {
            AutoForm.resetForm(form.id);
        });
    }
});

Template.Collections.helpers({
    allCollections: function () {
        return Collections.find();
    }
});
