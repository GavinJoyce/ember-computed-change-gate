import { isEqual } from '@ember/utils';
import { computed } from '@ember/object';
import { assert } from '@ember/debug';

export default function() {
  let args = [].slice.call(arguments);
  let filter = null;
  let config = null;

  let last = args[args.length-1];
  if (typeof last === 'function') {
    filter = args.pop();
  } else if (typeof last === 'object' && last.sync !== undefined) {
    let secondLast = args[args.length-2];
    config = args.pop();
    if (typeof secondLast === 'function') {
      filter = args.pop();
    }
  }

  // no filter function
  if (!filter) {
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
        let params = [dependentKey, handleDependencyChange]
        if (config && config.sync !== undefined) {
          // We need to push `null` because the `addObserver` method signature is `addObserver(obj, path, method, target, sync)`
          params.push(null);
          params.push(config.sync);
        }
        this.addObserver(...params);
      }
    }

    return this[lastValueKey];
  });

  return changeGateComputed;
}
