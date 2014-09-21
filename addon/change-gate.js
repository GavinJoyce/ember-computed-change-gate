import Em from 'ember';

var get = Em.get,
    getMeta = Em.getMeta,
    setMeta = Em.setMeta;

var defaultFilter = function(value) { console.log('value', value); return value; };

export default function(dependentKey, filter) {
  filter = filter || defaultFilter;

  return Em.computed(function(key) {
    var hasObserverKey = '_changeGate:%@:hasObserver'.fmt(key);
    var lastValueKey =   '_changeGate:%@:lastValue'.fmt(key);
    var isFirstRun = !getMeta(this, hasObserverKey);

    if(isFirstRun) { //setup an observer which is responsible for notifying property changes
      var value = filter(get(this, dependentKey));

      setMeta(this, hasObserverKey, true);
      setMeta(this, lastValueKey, value);

      this.addObserver(dependentKey, function() {
        var newValue = filter(get(this, dependentKey));
        var lastValue = getMeta(this, lastValueKey);

        if(newValue !== lastValue) {
          setMeta(this, lastValueKey, newValue);
          this.notifyPropertyChange(key);
        }
      });

      return value;
    } else {
      return getMeta(this, lastValueKey);
    }
  });
}
