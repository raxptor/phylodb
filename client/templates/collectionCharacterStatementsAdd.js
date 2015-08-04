var isNeomorphic = function (statements) {
    'use strict';
    if (statements) {
        if (statements.length === 2) {
            var matchNeo = _.map(statements, function (s) {
                var match = s.match(/^(?:Absent|Present)\b/i);
                if (match) {
                    return match[0].toLowerCase();
                }
                return '';
            });
            if (matchNeo[0] && matchNeo[1] && matchNeo[0] !== matchNeo[1]) {
                return true;
            } else {
                return false;
            }
        }
    }
    return false;
};

var toggleSessionVar = function (variable, value, widget) {
    if (value) {
        if (!Session.get(variable)) {
            Session.set(variable, true);
            widget.checked = true;
        }
    } else {
        if (Session.get(variable)) {
            Session.set(variable, false);
            widget.checked = false;
        }
    }
}

var checkNeomorphic = function (template) {
    'use strict';
    var statements = AutoForm.getFieldValue('statements', template.find('form').id);
    var widget = template.find('[name=isNeomorphic]');
    var neomorphic = isNeomorphic(statements);
    toggleSessionVar('isNeomorphic', neomorphic, widget);
};

var checkAutoAssignable = function (template) {
    var statements = AutoForm.getFieldValue('statements', template.find('form').id);
    var autoAssignMatches = _.map(statements, function (s) {
        return s.match(/^([<>]={0,1})\s+(\d+(?:\.\d+){0,1})$/);
    });
    var widget = template.find('[name=isAutoAssignable]');
    toggleSessionVar('isAutoAssignable', (autoAssignMatches.length > 1 && _.every(autoAssignMatches)), widget)
}

var parseStatements = function (statements) {
    'use strict';
    return _.map(statements, function (statement) {
        var match = statement.match(/^([<>]={0,1})\s+(\d+(?:\.\d+){0,1})$/);
        if (match) {
            var value = parseInt(match[2]);
            if (match[2].indexOf('.') > -1) {
                value = parseFloat(match[2]);
            }
            return {operator: match[1], value: value, description: ''};
        }
        return {description: statement};
    });
};

var parseAutoStatements = function (statements) {
    'use strict';
    var prevS = null;
    _.each(statements, function (statement, index) {
        if (index < statements.length - 1) {
            if (prevS) {
                statement.description = operators[operators[prevS.operator].inv].text(prevS.value) + ' and ' + operators[statement.operator].text(statement.value);
            } else {
                statement.description = operators[statement.operator].text(statement.value);
            }
            prevS = statement;
        }
    });
    statements[statements.length - 1] = {
        description: operators[operators[prevS.operator].inv].text(prevS.value),
        value: prevS.value,
        operator: operators[prevS.operator].inv
    };
    return statements;
};

Template.CollectionCharacterStatementsAdd.events({
    'submit #addCollectionCharacterStatementForm': function (event, template) {
        event.preventDefault();
        var collection = Collections.findOne(),
            cs = AutoForm.getFormValues(event.target.id).insertDoc;
        cs.isNeomorphic = Session.get('isNeomorphic');
        cs.isAutoAssignable = Session.get('isAutoAssignable');
        cs.isQuantitative = Session.get('isQuantitative');
        cs.statements = parseStatements(cs.statements);
        if (cs.isAutoAssignable) {
            return parseAutoStatements(statements);
        }
        Meteor.call('addCollectionCharacterStatement', cs, collection, function (err) {
            if (err) {
                console.log('Error!', err);
            } else {
                UIkit.modal('#collectionCharacterStatementsAdd').hide();
                AutoForm.resetForm('addCollectionCharacterForm');
            }
        });
    },
    'click .addStatement': function (event, template) {
        console.log(template);
        var formId = template.find('form').id,
            ss = AutoForm.getFormSchema(formId);
        AutoForm.arrayTracker.addOneToField(formId, 'statements', ss);
        checkNeomorphic(template);
    },
    'click .removeStatement': function (event, template) {
        var fieldName = 'statements',
            formId = template.find('form').id,
            ss = AutoForm.getFormSchema(formId),
            stateCount = AutoForm.arrayTracker.info[formId][fieldName].count;
        AutoForm.arrayTracker.removeFromFieldAtIndex(formId, fieldName, stateCount - 1, ss);
        // AutoForm only marks removed array items with a 'removed' attribute
        // rather than actually removing them, which breaks form rendering.
        // Enforcing removal fixes that.
        if (stateCount > ss.schema()[fieldName].minCount) {
            AutoForm.arrayTracker.info[formId][fieldName].array.pop();
        }
        checkNeomorphic(template);
    },
    'change [name="character"], keyup [name="character"]': function (event, template) {
        var isQuantitative = Boolean(event.target.value.match(/\b(length|width|height|depth|number|angle|circumference|diameter)\b/i));
        var widget = template.find('[name=isQuantitative]');
        toggleSessionVar('isQuantitative', isQuantitative, widget);
    },
    'change [name*="statements."], keyup [name*="statements."]': function (event, template) {
        checkNeomorphic(template);
        checkAutoAssignable(template);
    }
});

Tracker.autorun(function () {
    if (FlowRouter.subsReady('allCharacterStatements')) {
        Session.setDefault('isNeomorphic', false);
        Session.setDefault('isQuantitative', false);
        Session.setDefault('isAutoAssignable', false);
    }
});

Template.CollectionCharacterStatementsAdd.helpers({
    isNeomorphic: function () {
        return Session.get('isNeomorphic');
    },
    isQuantitative: function () {
        return Session.get('isQuantitative');
    },
    isAutoAssignable: function () {
        return Session.get('isAutoAssignable');
    }
});
