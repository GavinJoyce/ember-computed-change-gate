import Em from 'ember';
import changeGate from 'ember-computed-change-gate/change-gate';

module('changeGate');

test('a changeGate with a function', function() {
  var Paragraph = Em.Object.extend({
    text: 'Hello there',
    wordCount: changeGate('text', function(value) {
      return value.split(/\s+/).length;
    })
  });

  var paragraph = Paragraph.create({ text: 'This is an interesting sentence' });
  equal(paragraph.get('wordCount'), '5');

  var textObserverCount = 0;
  var wordCountObserverCount = 0;

  paragraph.addObserver('text', function() {
    textObserverCount++;
  });

  paragraph.addObserver('wordCount', function() {
    wordCountObserverCount++;
  });

  paragraph.set('text', 'This also has five words');
  equal(textObserverCount, 1);
  equal(wordCountObserverCount, 0, 'the gated observer does not fire when the value does not change');

  paragraph.set('text', 'This has four words');
  equal(textObserverCount, 2);
  equal(wordCountObserverCount, 1, 'the gated observer fires when the value changes');
});


test('a changeGate without a function', function() {
  var Hippo = Em.Object.extend({
    name: 'Alex',
    trimmedName: function() {
      return this.get('name').trim();
    }.property('name'),
    gatedTrimmedName: changeGate('trimmedName')
  });

  var hippo = Hippo.create({ name: 'Sarah' });
  equal(hippo.get('gatedTrimmedName'), 'Sarah');

  var observerCount = 0;
  var gatedObserverCount = 0;

  hippo.addObserver('trimmedName', function() {
    observerCount++;
  });

  hippo.addObserver('gatedTrimmedName', function() {
    gatedObserverCount++;
  });

  hippo.set('name', 'Sarah');
  equal(observerCount, 0, 'the observer does not fire when the value does not change');
  equal(gatedObserverCount, 0, 'the gated observer does not fire when the value does not change');

  hippo.set('name', ' Sarah ');
  equal(observerCount, 1, 'the observer does fire when the value does not change significantly');
  equal(gatedObserverCount, 0, 'the gated observer does not fire when the value does not change significantly');

  hippo.set('name', 'Gavin');
  equal(observerCount, 2, 'the observer does fire when the value changes significantly');
  equal(gatedObserverCount, 1, 'the gated observer does not when the value changes significantly');
});
