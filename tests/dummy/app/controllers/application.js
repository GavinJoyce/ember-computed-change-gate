import Em from 'ember';
import changeGate from 'ember-computed-change-gate/change-gate';

export default Em.Controller.extend({
  text: 'Jump over the gate',

  gatedObserverCount: 0,
  gatedWordCount: changeGate('text', function(value) {
    return value.trim().split(/\s+/).length;
  }),
  gatedWordCountChanged: Em.observer('gatedWordCount', function() {
    this.incrementProperty('gatedObserverCount');
  }),

  normalObserverCount: 0,
  normalWordCount: Em.computed('text', function() {
    return this.get('text').trim().split(/\s+/).length;
  }),
  normalWordCountChanged: Em.observer('normalWordCount', function() {
    this.incrementProperty('normalObserverCount');
  })
});
