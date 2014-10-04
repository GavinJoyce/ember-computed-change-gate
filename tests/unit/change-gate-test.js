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

test('a changeGate on multiple instances of same class', function(){

  var Paragraph = Em.Object.extend({
    text: 'Hello there',
    wordCount: changeGate('text', function(value) {
      return value.split(/\s+/).length;
    })
  });

  var p1 = Paragraph.create({text: 'Foo Bar baz'});
  var p2 = Paragraph.create({text: 'Bar Foo'});

  equal(p1.get('wordCount'), 3);
  equal(p2.get('wordCount'), 2);


  var p1Observer = 0;
  var p2Observer = 0;

  p1.addObserver('wordCount', function() {
    p1Observer++;
  });

  p2.addObserver('wordCount', function() {
    p2Observer++;
  });

  p1.set('text', 'Foo Bar Bar Boo');
  equal(p1Observer, 1, "the observer fires once when the value is changed on p1");

  p2.set('text', "Bar Foo Foo");
  equal(p2Observer, 1, "the observer fires once when the value is changed on p2");

  p1.set('text', 'Foo Bar Bar Bar Baa');
  equal(p1Observer, 2, "change to p1 is only recorded on this object, not the other");
});

test('multiple changeGate properties on same object', function() {

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

  equal(p.get('wordCount'), 2); 
  equal(p.get('letterCount'), 11);

  p.set('text', 'Hello  there');
  equal(p.get('wordCount'), 2);  
  equal(p.get('letterCount'), 12);
  equal(letterCountObserverCount, 1, "uneffected observer does not fire when another observer is fired");

  p.set('text', 'Hello there you');
  equal(p.get('letterCount'), 15);
  equal(p.get('wordCount'), 3);

  equal(letterCountObserverCount, 2, "intended observer fires when effected");
  equal(wordCountObserverCount, 1, "uneffected observer does not fire when another observer is fired");

});

test("changeGate filter is bound to instance that it's attached to", function(){

  expect(1);

  var instance;

  var Paragraph = Em.Object.extend({
    text: 'Hello there',
    wordCount: changeGate('text', function(value) {
      equal(this, instance);
      return value.split(/\s+/).length;
    })
  });

  instance = Paragraph.create();
  instance.get('wordCount');
});
