Template.TopBar.events({
    'click #login': function (event) {
        event.preventDefault();
        alert('No user accounts yet!');
    }
});

Meteor.startup(function() {
    $(document.body).attr('data-uk-observe', '1');
    $('head').after('<link href=\'http://fonts.googleapis.com/css?family=Open+Sans:300:400:600:700\' rel=\'stylesheet\' type=\'text/css\'>');
});
