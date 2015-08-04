# PhyloDB

PhyloDB is a web application for cataloguing and quantitatively comparing
discrete character information from published phylogenetic analyses and the
construction of novel datasets. PhyloDB borrows from the model of morphological
character construction described by [Sereno (2007)](http://onlinelibrary.wiley.com/doi/10.1111/j.1096-0031.2007.00161.x/abstract)
and from the principles of comparative cladistics outlined in [Sereno (2009)](http://onlinelibrary.wiley.com/doi/10.1111/j.1096-0031.2009.00265.x/abstract)
that were implemented in the unpublished *CharacterSearch* database.

## Project structure

PhyloDB is built on the [Meteor](http://www.meteor.com) reactive framework and uses
 [FlowRouter](https://github.com/meteorhacks/flow-router) and
 [FlowLayout](https://github.com/meteorhacks/flow-layout) for routing and templating
 respectively and [SimpleSchema](https://github.com/aldeed/meteor-simple-schema) and
 [AutoForm](https://github.com/aldeed/meteor-autoform) for input data validation and
 form construction. The user interface is designed with [UIkit](http://getuikit.com).

## Roadmap

PhyloDB is in an early stage of development and is not feature complete. The
following features are currently supported:

  * Creation of collections
  * Creation of bibliographic references
  * Addition and removal of taxa to collections
  * Addition and removal of character statements to collections

The following is a list of functionalities that will be added in the future (in no
specific order):

  * User accounts
  * Setting and displaying state values for character statements
  * Bulk importing of phylogenetic matrices and state data
  * Utilities for performing and displaying results of quantitative cladistics
