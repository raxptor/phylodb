Meteor.methods({
    addCollection: function (collection) {
        var cleaned = Collections.simpleSchema().clean(collection);
        check(cleaned, Collections.simpleSchema());
        Collections.insert(collection);
    },
    addCollectionTaxon: function (taxon, collection) {
        var cleaned = Taxa.simpleSchema().clean(taxon);
        check(cleaned, Taxa.simpleSchema());
        var newTaxaon = Taxa.findOne({name: cleaned.name});
        if (!newTaxon) {
            Taxa.insert(cleaned, {getAutoValues: false})
            newTaxon = Taxa.findOne({name: cleaned.name});
        }
        Taxa.update(newTaxon, {$addToSet: {collections: collection._id}}, {getAutoValues: false});
        return newTaxon
    },
    removeCollectionTaxon: function (taxon, collection) {
        Taxa.update(taxon, {$pull: {collections: collection._id}}, {getAutoValues: false});
        console.log(taxon, collection);
    },
    addCharacter: function (character) {
        var cleaned = Characters.simpleSchema().clean(character);
        check(cleaned, Characters.simpleSchema());
        try {
            Characters.insert(cleaned, {getAutoValues: false});
        } catch (e) {
            console.log(e);
        }
        var newCharacter = Characters.findOne({fullName: cleaned.fullName});
        return newCharacter;
    },
    addCollectionCharacterStatement: function (cs, collection) {
        cs.collections = [collection._id];
        if (collection.reference) {
            cs.citedBy = [collection.reference];
        }
        var cleaned = CharacterStatements.simpleSchema().clean(cs);
        cleaned.character = _.map(cleaned.character, function (character) {
            return Meteor.call('addCharacter', character)._id
        });
        cleaned.qualifier = _.map(cleaned.qualifier, function (character) {
            return Meteor.call('addCharacter', character)._id
        });
        check(cleaned, CharacterStatements.simpleSchema());
        console.log(cleaned);
        CharacterStatements.insert(cleaned, {getAutoValues: false});
    },
    removeCollectionCharacterStatement: function (cs, collection) {
        CharacterStatements.update(cs, {$pull: {collections: collection._id}}, {getAutoValues: false});
        console.log(cs, collection);
    },
    setCharacterState: function (choice, character, taxon) {
        if (_.every(choice, function (i) { return !Boolean(i); })) {
            console.log('You submitted no options!');
            return;
        }
        var unknown = choice.pop(),
            data = [];
        for (var i = 0; i < choice.length; i++) {
            if (choice[i]) {
                data.push(i)
            }
        }
        var state = {};

        if (data.length > 0) {
            state['stateSet.' + character._id] = data;
            console.log('Setting state vales for ' + taxon.name + ':');
            console.log(state);
            Taxa.update(taxon, {$set: state}, {getAutoValues: false});
        } else {
            state['stateSet.' + character._id] = 1;
            console.log('Unsetting state vales for ' + taxon.name);
            Taxa.update(taxon, {$unset: state}, {getAutoValues: false});
        }
    },
    importCollection: function (newCollection) {
        var cleaned = Schemas.importCollection.clean(newCollection);
        check(cleaned, Schemas.importCollection);
    },
    addReference: function (reference) {
        var cleaned = Schemas.addReference.clean(reference);
        var output = JSON.parse(cleaned.reference);
        cleaned = References.simpleSchema().clean(output);
        check(cleaned, References.simpleSchema());
        try {
            References.insert(cleaned, {getAutoValues: false});
        } catch (e) {
            console.log('Caught error:', e);
        }
    }
});
