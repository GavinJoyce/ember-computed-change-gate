import Em from 'ember';

var get = Em.get;

var defaultFilter = function(value) { console.log('value', value); return value; };

export default function(dependentKey, filter) {
  filter = filter || defaultFilter;

  var computed = Em.computed(function handler(key) {
    var meta = computed.meta();
    var isFirstRun = !meta.hasObserver;

    var result;
    if(isFirstRun) { //setup an observer which is responsible for notifying property changes
      var value = filter(get(this, dependentKey));

      meta.hasObserver = true;
      meta.lastValue = value;

      this.addObserver(dependentKey, function() {
        var meta = computed.meta();
        var newValue = filter(get(this, dependentKey));
        var lastValue = meta.lastValue;

        if(newValue !== lastValue) {
          meta.lastValue = newValue;
          computed.meta(meta);
          this.notifyPropertyChange(key);
        }
      });

      result = value;
    } else {
      result = meta.lastValue;
    }
    computed.meta(meta);
    return result;
  });

  return computed;
}
