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

## Advanced configuration
Since Ember 3.11 extra configuration can be passed to observers to allow them to be configured synchronous or asynchronous. To configure the synchronous state of the observer in `changeGate` pass a config object as the last param with the `sync` property set appropriately.

For example:

```js
// synchronous observer
trimmedName: changeGate('name', function(value) {
  return value.trim();
}, { sync: true }),

//asynchronous observer
trimmedName: changeGate('name', function(value) {
  return value.trim();
}, { sync: false }),
```

See [this RFC](https://emberjs.github.io/rfcs/0494-async-observers.html) and [blog post](https://www.pzuraq.com/ember-octane-update-async-observers/) for more informationa about async observers.


## Watch a screencast showing how this addon was built below

[![Image](https://cloud.githubusercontent.com/assets/2526/4349867/d399b15e-41c9-11e4-8319-43c2e06186aa.png)](https://www.youtube.com/watch?v=PDgvMAyA8ic)

Questions? Ping me [@gavinjoyce](https://twitter.com/gavinjoyce)

## Installation

This is an Ember CLI addon, to install:

`ember install ember-computed-change-gate`

## Development Instructions

* `git clone` this repository
* `npm install`
* `bower install`

### Linting

* `npm run lint:js`
* `npm run lint:js -- --fix`

### Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `ember try:each` – Runs the test suite against multiple Ember versions

### Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).