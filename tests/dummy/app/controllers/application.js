import { observer, computed } from '@ember/object';
import Controller from '@ember/controller';
import changeGate from 'ember-computed-change-gate/change-gate';

export default Controller.extend({
  text: 'Jump over the gate',

  gatedObserverCount: 0,
  gatedWordCount: changeGate('text', function(value) {
    return value.trim().split(/\s+/).length;
  }),
  gatedWordCountChanged: observer('gatedWordCount', function() {
    this.incrementProperty('gatedObserverCount');
  }),

  normalObserverCount: 0,
  normalWordCount: computed('text', function() {
    return this.get('text').trim().split(/\s+/).length;
  }),
  normalWordCountChanged: observer('normalWordCount', function() {
    this.incrementProperty('normalObserverCount');
  })
});
