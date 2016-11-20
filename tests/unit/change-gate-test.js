import Em from 'ember';
import { module, test } from 'qunit';
import changeGate from 'ember-computed-change-gate/change-gate';

module('changeGate');

test('a changeGate with a function', function(assert) {
  var Paragraph = Em.Object.extend({
    text: 'Hello there',
    wordCount: changeGate('text', function(value) {
      return value.split(/\s+/).length;
    })
  });

  var paragraph = Paragraph.create({ text: 'This is an interesting sentence' });
  assert.equal(paragraph.get('wordCount'), '5');

  var textObserverCount = 0;
  var wordCountObserverCount = 0;

  paragraph.addObserver('text', function() {
    textObserverCount++;
  });

  paragraph.addObserver('wordCount', function() {
    wordCountObserverCount++;
  });

  paragraph.set('text', 'This also has five words');
  assert.equal(textObserverCount, 1);
  assert.equal(wordCountObserverCount, 0, 'the gated observer does not fire when the value does not change');

  paragraph.set('text', 'This has four words');
  assert.equal(textObserverCount, 2);
  assert.equal(wordCountObserverCount, 1, 'the gated observer fires when the value changes');
});

test('a changeGate without a function', function(assert) {
  var Hippo = Em.Object.extend({
    name: 'Alex',
    trimmedName: Em.computed('name', function() {
      return this.get('name').trim();
    }),
    gatedTrimmedName: changeGate('trimmedName')
  });

  var hippo = Hippo.create({ name: 'Sarah' });
  assert.equal(hippo.get('gatedTrimmedName'), 'Sarah');

  var observerCount = 0;
  var gatedObserverCount = 0;

  hippo.addObserver('trimmedName', function() {
    observerCount++;
  });

  hippo.addObserver('gatedTrimmedName', function() {
    gatedObserverCount++;
  });

  hippo.set('name', 'Sarah');
  assert.equal(observerCount, 0, 'the observer does not fire when the value does not change');
  assert.equal(gatedObserverCount, 0, 'the gated observer does not fire when the value does not change');

  hippo.set('name', ' Sarah ');
  assert.equal(observerCount, 1, 'the observer does fire when the value does not change significantly');
  assert.equal(gatedObserverCount, 0, 'the gated observer does not fire when the value does not change significantly');

  hippo.set('name', 'Gavin');
  assert.equal(observerCount, 2, 'the observer does fire when the value changes significantly');
  assert.equal(gatedObserverCount, 1, 'the gated observer does not when the value changes significantly');
});

test('a changeGate without a function and multiple property dependencies', function(assert) {
  assert.throws(function() {
    Em.Object.extend({
      dep1: '',
      dep2: '',
      result: changeGate('dep1', 'dep2')
    });
  }, new Error('Assertion Failed: When depending on multiple properties a function must be passed as the last argument.'));
});

test('a changeGate with multiple property dependencies', function(assert) {
  var Paragraph = Em.Object.extend({
    text1: '',
    text2: '',
    wordCount: changeGate('text1', 'text2', function(val1, val2) {
      var c1 = val1.split(/\s+/).length;
      var c2 = val2.split(/\s+/).length;
      return c1 + c2;
    })
  });

  var paragraph = Paragraph.create({text1: 'hello', text2: 'world'});
  assert.equal(paragraph.get('wordCount'), '2');

  var text1ObserverCount = 0;
  var text2ObserverCount = 0;
  var wordCountObserverCount = 0;

  paragraph.addObserver('text1', function() {
    text1ObserverCount++;
  });

  paragraph.addObserver('text2', function() {
    text2ObserverCount++;
  });

  paragraph.addObserver('wordCount', function() {
    wordCountObserverCount++;
  });

  // same count for both
  paragraph.set('text1', 'hi');
  paragraph.set('text2', 'everyone');
  assert.equal(text1ObserverCount, 1, 'the observer does fire when the value changes significantly');
  assert.equal(text2ObserverCount, 1, 'the observer does fire when the value changes significantly');
  assert.equal(wordCountObserverCount, 0, 'the gated observer does not fire when the value does not change');

  // different count for text1
  paragraph.set('text1', 'hi hi');
  assert.equal(text1ObserverCount, 2, 'the text1 observer does fires when the value changes significantly');
  assert.equal(wordCountObserverCount, 1, 'the wordCount observer does fire when the value changes significantly');

  // different count for text2
  paragraph.set('text2', 'hi hi');
  assert.equal(text2ObserverCount, 2, 'the text2 observer does fire when the value changes significantly');
  assert.equal(wordCountObserverCount, 2, 'the wordCount observer does fire when the value changes significantly');

  // different count for text1 and text2
  paragraph.set('text1', 'a b c');
  paragraph.set('text2', 'd e f');
  assert.equal(text1ObserverCount, 3, 'the text1 observer does fire when the value changes significantly');
  assert.equal(text2ObserverCount, 3, 'the text2 observer does fire when the value changes significantly');
  assert.equal(wordCountObserverCount, 4, 'the wordCount observer does fire when the value changes significantly');

  assert.equal(paragraph.get('wordCount'), 6, 'wordCount has the correct value');
});

test('a changeGate on multiple instances of same class', function(assert) {
  var Paragraph = Em.Object.extend({
    text: 'Hello there',
    wordCount: changeGate('text', function(value) {
      return value.split(/\s+/).length;
    })
  });

  var p1 = Paragraph.create({text: 'Foo Bar baz'});
  var p2 = Paragraph.create({text: 'Bar Foo'});

  assert.equal(p1.get('wordCount'), 3);
  assert.equal(p2.get('wordCount'), 2);

  var p1Observer = 0;
  var p2Observer = 0;

  p1.addObserver('wordCount', function() {
    p1Observer++;
  });

  p2.addObserver('wordCount', function() {
    p2Observer++;
  });

  p1.set('text', 'Foo Bar Bar Boo');
  assert.equal(p1Observer, 1, "the observer fires once when the value is changed on p1");

  p2.set('text', "Bar Foo Foo");
  assert.equal(p2Observer, 1, "the observer fires once when the value is changed on p2");

  p1.set('text', 'Foo Bar Bar Bar Baa');
  assert.equal(p1Observer, 2, "change to p1 is only recorded on this object, not the other");
});

test('multiple changeGate properties on same object', function(assert) {
  var Paragraph = Em.Object.extend({
    text: 'Hello there',
    wordCount: changeGate('text', function(value) {
      return value.split(/\s+/).length;
    }),
    letterCount: changeGate('text', function(value) {
      return value.split('').length;
    })
  });

  var p = Paragraph.create();

  var wordCountObserverCount = 0;
  var letterCountObserverCount = 0;

  p.addObserver('wordCount', function() {
    wordCountObserverCount++;
  });

  p.addObserver('letterCount', function(){
    letterCountObserverCount++;
  });

  assert.equal(p.get('wordCount'), 2);
  assert.equal(p.get('letterCount'), 11);

  p.set('text', 'Hello  there');
  assert.equal(p.get('wordCount'), 2);
  assert.equal(p.get('letterCount'), 12);
  assert.equal(letterCountObserverCount, 1, "uneffected observer does not fire when another observer is fired");

  p.set('text', 'Hello there you');
  assert.equal(p.get('letterCount'), 15);
  assert.equal(p.get('wordCount'), 3);

  assert.equal(letterCountObserverCount, 2, "intended observer fires when effected");
  assert.equal(wordCountObserverCount, 1, "uneffected observer does not fire when another observer is fired");
});

test("changeGate filter is bound to instance that it's attached to", function(assert) {
  assert.expect(1);

  var instance;

  var Paragraph = Em.Object.extend({
    text: 'Hello there',
    wordCount: changeGate('text', function(value) {
      assert.equal(this, instance);
      return value.split(/\s+/).length;
    })
  });

  instance = Paragraph.create();
  instance.get('wordCount');
});
