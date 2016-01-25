# ember-computed-change-gate

[![Build Status](https://travis-ci.org/GavinJoyce/ember-computed-change-gate.svg)](https://travis-ci.org/GavinJoyce/ember-computed-change-gate)

[![Ember Observer Score](http://emberobserver.com/badges/ember-computed-change-gate.svg)](http://emberobserver.com/addons/ember-computed-change-gate)

Observers on Ember.js computed properties are fired if a dependant key changes, regardless of whether the property value changes or not. `ember-computed-change-gate` only triggers observers when the result of a computed property changes.

Consider the following example:

```javascript
Ember.Object.extend({
  name: 'Gavin',
  trimmedName: Ember.computed('name'), function() {
    return this.get('name').trim();
  }),
  onTrimmedNameChanged: Ember.observer('trimmedName', function() {
    console.log('trimmedName changed');
  })
});
```

Every time `name` changes `onTrimmedNameChanged` will be run, even if the value of `trimmedName` doesn't change.

```javascript
import changeGate from 'ember-computed-change-gate/change-gate';

Ember.Object.extend({
  name: 'Gavin',
  trimmedName: changeGate('name', function(value) {
    return value.trim();
  }),
  onTrimmedNameChanged: Ember.observer('trimmedName', function() {
    console.log('trimmedName changed');
  })
});
```

Using `changeGate` will prevent the `onTrimmedNameChanged` observer from firing unless the value of `trimmedName` changes. Please see the video below for an example of how I've used this when building [Intercom](https://www.intercom.io/):

## Watch a screencast showing how this addon was built below

[![Image](https://cloud.githubusercontent.com/assets/2526/4349867/d399b15e-41c9-11e4-8319-43c2e06186aa.png)](https://www.youtube.com/watch?v=PDgvMAyA8ic)

Questions? Ping me [@gavinjoyce](https://twitter.com/gavinjoyce)

## Installation

This is an Ember CLI addon, to install:

`npm install ember-computed-change-gate --save`

## Development Instructions

* `git clone` this repository
* `npm install`
* `bower install`

### Running

* `ember server`
* Visit your app at http://localhost:4200.
