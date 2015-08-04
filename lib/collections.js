/*global Collections:true Taxa:true Specimens:true Measurements:true
Characters:true CharacterStatements:true References:true*/
Collections = new Mongo.Collection('collections');
Taxa = new Mongo.Collection('taxa');
Specimens = new Mongo.Collection('specimens');
Measurements = new Mongo.Collection('measurements');
Characters = new Mongo.Collection('characters');
CharacterStatements = new Mongo.Collection('character_statements');
References = new Mongo.Collection('references');

SimpleSchema.messages({
    'qualifierRequired': 'Qualifier required for quantitative character',
    'noQualitativeAuto': 'Qualitative character with auto assignable statements not permitted',
    'noQualifierNeoQual': 'Qualifier not permitted with neomorphic or qualitative character',
    'noCombinedNeoQual': 'Combined character not compatible with neomorphic or qualitative statements',
    'combinedVariableMismatch': 'Combined characters must have the same variable',
    'badNeomorphicCharacter': 'Neomorphic character must have 1 or 2 components',
    'badTransformationalCharacter': 'Transformational character must have 2 or 3 components',
    'noNeomorphicQuantitative': 'Cannot use neomorphic states with a quantitative character',
    'noOrderedBinary': 'Cannot set ordering for a binary character statement',
    'secondaryLocatorRequired': 'Secondary locator required for quantitative character statement',
    'thresholdInequality': 'Threshold inequality',
    'referenceRefTypeRequired': 'Valid reference type (TY) required on first line',
    'referenceDateRequired': 'Year (PY or Y1) or date (DA) field required',
    'referenceTitleRequired': 'Title field (TI or T1) required',
    'referenceAuthorsRequired': 'Author fields (AU or A1) required',
    'referencePublicationRequired': 'Publication field (T2 or JO) required',
    'referencePageRequired': 'Page field (SP/EP) required',
    regEx: [
            {exp: AlphaNum, msg: 'Only alphanumeric, space, - and / characters permitted'}
        ]
});

var AlphaNum = RegExp(/^[A-Za-z0-9\/\-\s]+$/);

Schemas = {};

// Collection schemas

Schemas.Collection = new SimpleSchema({
    name: {
        type: String
    },
    description: {
        type: String
    },
    reference: {
        type: String,
        optional: true
    },
    createdBy: {
        type: String,
        defaultValue: 'Default User'
    },
    createdAt: {
        type: Date,
        defaultValue: new Date()
    },
    slug: {
        type: String,
        unique: true,
        autoValue: function () {
            return s.slugify(this.field('name').value);
        }
    }
});

Collections.attachSchema(Schemas.Collection);

Schemas.Taxon = new SimpleSchema({
    name: {
        type: String,
        unique: true,
        regEx: AlphaNum,
        autoValue: function () {
            return s.humanize(this.field('name').value);
        }
    },
    slug: {
        type: String,
        autoValue: function () {
            return s.slugify(this.field('name').value);
        }
    },
    collections: {
        type: [String],
        defaultValue: []
    },
    createdBy: {
        type: String,
        defaultValue: 'Default User'
    },
    createdAt: {
        type: Date,
        defaultValue: new Date()
    }
});

Taxa.attachSchema(Schemas.Taxon);

Schemas.Specimen = new SimpleSchema({
    taxon: {
        type: String
    },
    accessionNum: {
        type: String
    },
    isHolotype: {
        type: Boolean
    },
    createdBy: {
        type: String,
        defaultValue: 'Default User'
    },
    createdAt: {
        type: Date,
        defaultValue: new Date()
    }
});

Specimens.attachSchema(Schemas.Specimen);

Schemas.Measurement = new SimpleSchema({
    specimen: {
        type: String
    },
    character: {
        type: String
    },
    value: {
        type: Number
    },
    notes: {
        type: String
    },
    reference: {
        type: String
    },
    createdBy: {
        type: String,
        defaultValue: 'Default User'
    },
    createdAt: {
        type: Date,
        defaultValue: new Date()
    }
});

Measurements.attachSchema(Schemas.Measurement);

Schemas.Character = new SimpleSchema({
    locatorPrimary: {
        type: String,
        autoValue: function () {
            return s.humanize(this.value);
        }
    },
    locatorSecondary: {
        type: String,
        optional: true,
        autoValue: function () {
            return s.humanize(this.value);
        },
    },
    variable: {
        type: String,
        optional: true,
        autoValue: function () {
            return s.humanize(this.value);
        }
    },
    fullName: {
        type: String,
        unique: true,
        autoValue: function () {
            output = []
            if (this.field('locatorSecondary').value) {
                output.push(this.field('locatorSecondary').value);
            }
            output.push(this.field('locatorPrimary').value);
            if (this.field('variable').value) {
                output.push(this.field('variable').value);
            }
            return s.humanize(output.join(', '));
        }
    }
});

Characters.attachSchema(Schemas.Character);

/* Start CharacterStatement helpers */

var operators = {
    '>': {inv: '<=',
        op: function (a, b) {
            'use strict';
            return a > b;
        },
        text: function (a) {
            'use strict';
            return 'Greater than ' + a;
        }
    },
    '>=': {inv: '<',
        op: function (a, b) {
            'use strict';
            return a >= b;
        }, text: function (a) {
            'use strict';
            return 'Greater than or equal to ' + a;
        }
    },
    '<': {inv: '>=',
        op: function (a, b) {
            'use strict';
            return a < b;
        },
        text: function (a) {
            'use strict';
            return 'Less than ' + a;
        }
    },
    '<=': {inv: '>',
        op: function (a, b) {
            'use strict';
            return a <= b;
        },
        text: function (a) {
            'use strict';
            return 'Less than or equal to ' + a;
        }
    }
};

var parseCharacter = function (character, isNeomorphic) {
    'use strict';
    character = s.join(' ', character).split(/\s*;\s*/)
    var keys = ['locatorSecondary', 'locatorPrimary', 'variable'];
    var list = [];
    _.each(character, function (c) {
        if (s.clean(c)) {
            var parts = c.split(/\s*,\s*/);
            if (isNeomorphic) {
                parts.push('');
            }
            if (parts.length === 2) {
                parts.splice(0, 0, '');
            }
            list.push(_.object(keys, parts));
        }
    });
    return list;
};

var checkCombined = function (characters) {
    'use strict';
    if (Meteor.isServer) {
        characters = Characters.find({_id: {$in: characters}}).fetch();
    }
    var uniqueVariables = _.unique(_.map(characters, function (character) {
        if (character.variable) {
            return character.variable.toLowerCase();
        }
        return '';
    }));
    if (Boolean(uniqueVariables.length - 1)) {
        return 'combinedVariableMismatch';
    }
};

var checkAutoStatements = function (statements) {
    'use strict';
    var prevS = statements[0];
    var direction = prevS.operator[0];
    for (var i = 1; i < statements.length - 1; i++) {
        if (!operators[statements[i].operator].op(prevS.value, statements[i].value) || !operators[prevS.operator].op(prevS.value, statements[i].value) || statements[i].operator[0] !== direction) {
            return 'thresholdInequality';
        }
        prevS = statements[i];
    };
}

var characterWrite = function (charObj) {
    var output = charObj[0].variable + ' of ' + charObj[0].locatorPrimary;
    if (charObj.length > 1) {
        var locators = _.pluck(charObj, 'locatorPrimary');
        var middles = locators.slice(1, locators.length - 1).join(', ');
        output = 'combined ' + output
        if (middles) {
            output += ', ' + middles;
        }
        output += ' and ' + locators[locators.length - 1];
    }
    return output
}

/* End CharacterStatement helpers */

Schemas.CharacterStatement = new SimpleSchema({
    collections: {
        type: [String],
        defaultValue: []
    },
    character: {
        type: [String],
        minCount: 1,
        autoValue: function () {
            return parseCharacter(this.value, this.field('isNeomorphic').value)
        },
        custom: function () {
            if (this.field('isQuantitative').value) {
                var characters = this.value;
                if (Meteor.isServer) {
                    characters = Characters.find({_id: {$in: characters}}).fetch();
                }
                if (!_.every(_.pluck(characters, 'locatorSecondary'))) {
                    return 'secondaryLocatorRequired';
                }
            } else {
                if (this.field('isAutoAssignable').value) {
                    return 'noQualitativeAuto';
                }
            }
            if (this.field('isNeomorphic').value && this.field('isQuantitative').value) {
                return 'noNeomorphicQuantitative';
            }
            if (this.value.length > 1) {
                if (this.field('isNeomorphic').value || !this.field('isQuantitative').value) {
                    return 'noCombinedNeoQual';
                }
                return checkCombined(this.value);
            }
        }
    },
    qualifier: {
        type: [String],
        optional: true,
        autoValue: function () {
            return parseCharacter(this.value, this.field('isNeomorphic').value)
        },
        custom: function () {
            if (this.value.length) {
                if (this.field('isNeomorphic').value || !this.field('isQuantitative').value) {
                    return 'noQualifierNeoQual';
                }
                if (this.value.length > 1) {
                    return checkCombined(this.value);
                }
            } else {
                if (this.field('isQuantitative').value) {
                    return 'qualifierRequired';
                }
            }
        }
    },
    statements: {
        type: [Object],
        minCount: 2,
        maxCount: 10,
        custom: function () {
            if (this.field('isAutoAssignable').value) {
                return checkAutoStatements(this.value);
            }
        }
    },
    'statements.$.description': {
        type: String
    },
    'statements.$.value': {
        type: Number,
        optional: true
    },
    'statements.$.operator': {
        type: String,
        optional: true,
        regEx: /^([<>]=*)\s+(\d+(?:\.\d+)*)$/
    },
    isNeomorphic: {
        type: Boolean,
        defaultValue: false
    },
    isQuantitative: {
        type: Boolean,
        defaultValue: false,
    },
    isOrdered: {
        type: Boolean,
        label: 'Yes',
        defaultValue: false,
        custom: function () {
            if (this.field('statements').value.length < 3 && this.value) {
                return 'noOrderedBinary';
            }
        }
    },
    isAutoAssignable: {
        type: Boolean,
        defaultValue: false
    },
    citedBy: {
        type: [String],
        defaultValue: []
    },
    'cited_by.$.reference': {
        type: String
    },
    'cited_by.$.number': {
        type: String
    },
    'cited_by.$.notes': {
        type: String
    },
    qualType: {
        type: String,
        optional: true,
        allowedValues: ['Form', 'Appearance', 'Topology', 'Composition', 'Ontogeny'],
        custom: function () {
            if (!this.isSet && !this.field('isQuantitative').value && !this.field('isNeomorphic').value) {
                return 'required';
            }
        }
    },
    quantType: {
        type: String,
        optional: true,
        allowedValues: ['Absolute', 'Linear', 'Geometric'],
        custom: function () {
            if (!this.isSet && this.field('isQuantitative').value) {
                return 'required';
            }
        }
    },
    status: {
        type: String,
        optional: true,
        allowedValues: ['Uninformative', 'Miscoded', 'Correlated', 'Overlapping', 'Ambiguous']
    },
    notes: {
        type: String,
        optional: true,
        defaultValue: ''
    },
    createdAt: {
        type: Date,
        defaultValue: new Date()
    },
    createdBy: {
        type: String,
        defaultValue: 'Default User'
    },
    fullName: {
        type: String,
        unique: true,
        autoValue: function () {
            var charString = []
            var charObj = this.field('character').value;
            var qualObj = this.field('qualifier').value;

            if (charObj[0].locatorSecondary) {
                charString.push(charObj[0].locatorSecondary);
            }
            charString.push(charObj[0].locatorPrimary);

            if (this.field('isQuantitative').value) {
                charString.pop()
                if (this.field('isAutoAssignable').value) {
                    charString.push('ratio of ' + characterWrite(charObj) + ' relative to ' + characterWrite(qualObj));
                } else {
                    charString.push(characterWrite(charObj) + ' relative to ' + characterWrite(qualObj));
                }
            } else if (!this.field('isNeomorphic').value) {
                charString.push(charObj[0].variable);
            }
            return s.humanize(charString.join(', '));
        }
    }
});

var combiner = function (charObj) {
    var locators = _.pluck(charObj, 'locatorPrimary');
    return 'combined ' + charObj[0].variable + ' of ' + locators.splice(0, locators.length - 1).join(', ') + ' and ' + locators[locators.length - 1];
}

CharacterStatements.attachSchema(Schemas.CharacterStatement);

Schemas.Reference = new SimpleSchema({
    refType: {
        type: String
    },
    authors: {
        type: [Object],
        minCount: 1
    },
    'authors.$.lastname': {
        type: String
    },
    'authors.$.initials': {
        type: String
    },
    date: {
        type: Date
    },
    title: {
        type: String
    },
    publication: {
        type: String
    },
    volume: {
        type: String,
        optional: true
    },
    issue: {
        type: String,
        optional: true
    },
    page: {
        type: String
    },
    doi: {
        type: String,
        optional: true,
        unique: true
    },
    url: {
        type: String,
        optional: true,
        regEx: SimpleSchema.RegEx.Url
    },
    shortName: {
        type: String,
        autoValue: function () {
            var authors = this.field('authors').value;
            var year = this.field('date').value.getFullYear();
            if (authors.length > 3) {
                return authors[0].lastname + ' et al. (' + year + ')';
            }
            if (authors.length === 2) {
                return authors[0].lastname + ' and ' + authors[1].lastname + ' (' + year + ')';
            }
            return authors[0].lastname + ' (' + year + ')';
        }
    },
    fullName: {
        type: String,
        autoValue: function () {
            var output = [];
            if (this.field('refType').value === 'journal-article') {
                output.push(_.map(this.field('authors').value, function (a) { return a.lastname + ' ' + a.initials; }).join(', '));
                output.push(this.field('date').value.getFullYear());
                output.push(this.field('title').value);
                output.push(this.field('publication').value + ' ' + this.field('volume').value + ':' + this.field('page').value);
            } else {
                output.push('invalid type!');
            }
            return output.join('. ') + '.';
        }
    }
});

References.attachSchema(Schemas.Reference);

// Non-collection schemas

var risTags = /([A-Z0-9]{2})\s{2}-\s+([\s\S]+?)\n/g;

var refParse = function (string) {
    var reference = {};
    var types = {'JOUR': 'journal-article'}
    var insertable = false;
    if (string) {
        string.replace(risTags, function (match, type, content) {
            if (insertable) {
                if (type === 'T1' || type === 'TI') {
                    reference.title = s.clean(content);
                } else if (type === 'T2' || type === 'JO') {
                    reference.publication = s.clean(content);
                } else if (type === 'PY' || type === 'Y1') {
                    reference.date = new Date(s.clean(content));
                } else if (type === 'DA') {
                    reference.date = new Date(s.clean(content).replace('/', '-', 'g'));
                } else if (type === 'VL') {
                    reference.volume = s.clean(content);
                } else if (type === 'IS') {
                    reference.issue = s.clean(content);
                } else if (type === 'SP') {
                    if (reference.page) {
                        reference.page = s.clean(content) + '-' + reference.page;
                    } else {
                        reference.page = s.clean(content);
                    }
                } else if (type === 'EP') {
                    if (reference.page) {
                        reference.page += '-' + s.clean(content);
                    }
                } else if (type === 'A1' || type === 'AU') {
                    if (!reference.authors) {
                        reference.authors = [];
                    }
                    var names = content.split(/\s*\,\s*/);
                    var initials = _.map(names[1].split(' '), function (n) { return n[0]; })
                    reference.authors.push({
                        initials: initials.join('').toUpperCase(),
                        lastname: s.clean(names[0])
                    });
                } else if (type === 'UR') {
                    reference.url = s.clean(content);
                } else if (type === 'ER') {
                    insertable = false;
                }
            } else {
                if (type === 'TY' && !_.keys(reference).length) {
                    reference.refType = types[s.clean(content)];
                    insertable = true;
                }
            }
        });
    }
    return reference;
}

Schemas.addReference = new SimpleSchema({
    reference: {
        type: String,
        autoValue: function () {
            return JSON.stringify(refParse(this.value));
        },
        custom: function () {
            var parsed = JSON.parse(this.value);
            if (!_.keys(parsed).length) {
                return 'required';
            }
            var cleaned = References.simpleSchema().clean(parsed);
            try {
                check(cleaned, References.simpleSchema());
            } catch (err) {
                var field = s.capitalize(err.invalidKeys[0].name);
                return 'reference' + field + 'Required';
            }
        }
    }
});

Schemas.importCollection = new SimpleSchema({
    name: {
        type: String
    },
    description: {
        type: String
    },
    matrix: {
        type: String
    },
    createdBy: {
        type: String,
        defaultValue: 'Default User'
    },
    createdAt: {
        type: Date,
        defaultValue: new Date()
    },
    slug: {
        type: String,
        autoValue: function () {
            return s.slugify(this.field('name').value);
        }
    }
});
