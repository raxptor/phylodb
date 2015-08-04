Template.CollectionBrowse.helpers({
    oneCollection: function () {
        return Collections.findOne();
    },
    exploreTaxa: function () {
        return Session.get('exploreTaxa');
    },
    formatStateSet: function (taxon, character) {
        if (_.has(taxon.stateSet, character._id)) {
            return taxon.stateSet[character._id].join(', ');
        }
        return '?';
    }
});

Template.CollectionBrowse.events({
    'submit #showExploreTaxon': function (event, template) {
        event.preventDefault();
        var exploreTaxa = Session.get('exploreTaxa'),
            taxonSlug = template.find('option:selected').value,
            taxon = _.findWhere(exploreTaxa.hide, {slug: taxonSlug});
        exploreTaxa.show.push(taxon);
        var index = exploreTaxa.hide.indexOf(taxon);
        if (index > -1) {
            exploreTaxa.hide.splice(index, 1);
            Session.set('exploreTaxa', exploreTaxa);
        }
    },
    'click .removeTaxon': function (event) {
        var exploreTaxa = Session.get('exploreTaxa'),
            index = $(event.target).parents('th').index() - 1;
        exploreTaxa.hide.push(this);
        exploreTaxa.show.splice(index, 1);
        Session.set('exploreTaxa', exploreTaxa);
    },
    'click .statementCheckbox': function (event, template) {
        var form = $(event.target).parents('form');
        if (form.find('.statementCheckbox:checked').length) {
            form.find('.unknownCheckbox').attr('checked', false);
        } else {
            $(event.target).prop('checked', true)
        }
    },
    'click .unknownCheckbox': function (event, template) {
        if ($(event.target).prop('checked')) {
            var form = $(event.target).parents('form');
            form.find('.statementCheckbox').attr('checked', false);
        } else {
            $(event.target).prop('checked', true)
        }
    },
    'submit .setState': function (event, template) {
        event.preventDefault();
        var choice = _.map($(event.target).find('input'), function (sel) {
                return $(sel).prop('checked');
            })
        var character = Blaze.getData($(event.target).parents('tr')[0]),
            taxon = this;
        Meteor.call('setCharacterState', choice, character, taxon);
    }
});
