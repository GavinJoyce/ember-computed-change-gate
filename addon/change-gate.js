import Em from 'ember';

var get = Em.get;

var defaultFilter = function(value) { return value; };

export default function(dependentKey, filter) {
  filter = filter || defaultFilter;

  var computed = Em.computed(function handler(key) {
    var meta = computed.meta();
    meta.hasObserver = false;
    meta.lastValue = null;
    var isFirstRun = !meta.hasObserver;

    if(isFirstRun) { //setup an observer which is responsible for notifying property changes
      var value = filter(get(this, dependentKey));

      meta.hasObserver = true;
      meta.lastValue = value;

      this.addObserver(dependentKey, function() {
        var newValue = filter(get(this, dependentKey));
        var lastValue = meta.lastValue;

        if(newValue !== lastValue) {
          meta.lastValue = value;
          this.notifyPropertyChange(key);
        }
      });

      return value;
    } else {
      return meta.lastValue;
    }
  });

  return computed;
}
