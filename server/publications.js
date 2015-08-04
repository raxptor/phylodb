// Meteor.startup(function () {
// Create the user roles
// if ( Roles.find().count() === 0 ) {
//   Roles.insert({name: 'User', description: 'Unprivileged user'});
//   Roles.insert({name: 'Admin', description: 'Administration user'});
// }
// });

Meteor.publish('allCollections', function () {
    return Collections.find();
});

Meteor.publish('oneCollection', function (collectionId) {
//   console.log(Collections.findOne({slug: collectionId}));
    return Collections.find({slug: collectionId});
});

Meteor.publish('collectionTaxa', function (collectionId) {
    var collection = Collections.findOne({slug: collectionId})
    return Taxa.find({collections: {$elemMatch: {$in: [collection._id]}}}, {sort: ['name']});
});

Meteor.publish('collectionCharacterStatements', function (collectionId) {
    var collection = Collections.findOne({slug: collectionId})
    return CharacterStatements.find({collections: {$elemMatch: {$in: [collection._id]}}}, {sort: ['name']});
});

Meteor.publish('allTaxa', function () {
    return Taxa.find();
});

Meteor.publish('allCharacterStatements', function () {
    return CharacterStatements.find();
});

Meteor.publish('allCharacters', function () {
    return Characters.find()
});

Meteor.publish('allReferences', function () {
    return References.find()
});
