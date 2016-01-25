import Em from 'ember';

let get = Em.get;
let defaultFilter = function(value) { return value; };

export default function(dependentKey, filter) {
  filter = filter || defaultFilter;

  let computed = Em.computed(function handler(key) {
    let lastValueKey = `__changeGate${key}LastValue`;

    let isFirstRun = !this.hasOwnProperty(lastValueKey);
    if (isFirstRun) { //setup an observer which is responsible for notifying property changes
      this[lastValueKey] = filter.call(this, get(this, dependentKey));

      this.addObserver(dependentKey, function() {
        let newValue = filter.call(this, get(this, dependentKey));
        let lastValue = this[lastValueKey];

        if(newValue !== lastValue) {
          this[lastValueKey] = newValue;
          this.notifyPropertyChange(key);
        }
      });
    }

    return this[lastValueKey];
  });

  return computed;
}
