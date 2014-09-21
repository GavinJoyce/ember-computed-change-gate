import Em from 'ember';
import changeGate from 'ember-computed-change-gate/change-gate';

export default Em.Controller.extend({
  text: 'Jump over the gate',
  gatedObserverCount: 0,
  gatedWordCount: changeGate('text', function(value) {
    return value.trim().split(/\s+/).length;
  }),
  gatedWordCountChanged: function() {
    this.incrementProperty('gatedObserverCount');
  }.observes('gatedWordCount'),

  normalObserverCount: 0,
  normalWordCount: function() {
    return this.get('text').trim().split(/\s+/).length;
  }.property('text'),
  normalWordCountChanged: function() {
    this.incrementProperty('normalObserverCount');
  }.observes('normalWordCount')
});
