import { isEqual } from '@ember/utils';
import { computed } from '@ember/object';
import { assert } from '@ember/debug';

const ASYNC_OBSERVERS = true;

export default function() {
  let args = [].slice.call(arguments);
  let filter = null;

  let last = args[args.length-1];
  if (typeof last === 'function') {
    filter = args.pop();
  } else { // no filter function
    // passing a function is optional only for computeds with a single dependency
    let message = 'When depending on multiple properties a function must be passed as the last argument.';
    assert(message, args.length === 1);
  }

  let dependentKeys = args; // for code read-ability

  function computeValue(dependentKeys) {
    let dependentValues = dependentKeys.map(dependentKey => {
      return this.get(dependentKey);
    });

    if (!filter) {
      return dependentValues[0];
    }

    return filter.apply(this, dependentValues);
  }

  let changeGateComputed = computed(function handler(key) {
    let lastValueKey = `__changeGate${key}LastValue`;

    function attemptPropertyChange(dependentKeys) {
      let newValue = computeValue.call(this, dependentKeys);
      let lastValue = this[lastValueKey];

      if(!isEqual(newValue, lastValue)) {
        this[lastValueKey] = newValue;
        this.notifyPropertyChange(key);
      }
    }

    let isFirstRun = !this.hasOwnProperty(lastValueKey);
    if (isFirstRun) {
      this[lastValueKey] = computeValue.call(this, dependentKeys);

      //setup observers responsible for notifying property changes
      let handleDependencyChange = () => {
        return attemptPropertyChange.call(this, dependentKeys);
      };
      for(let dependentKey of dependentKeys) {
        this.addObserver(dependentKey, undefined, handleDependencyChange, ASYNC_OBSERVERS);
      }
    }

    return this[lastValueKey];
  });

  return changeGateComputed;
}
