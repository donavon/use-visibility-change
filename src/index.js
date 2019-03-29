import { useState, useCallback } from 'react';
import useEventListener from '@use-it/event-listener';

const visibilityChangeEvent = 'visibilitychange';
const storageKey = 'useSaveRestoreState.lastSeenDateUTC';
const noop = () => {};

const useVisibilityChange = (
  saveCallback = noop,
  restoreCallback = noop,
  storageProvider = localStorage,
  element = global.document
) => {
  const buildResult = useCallback(
    () => {
      const lastSeenStr = storageProvider.getItem(storageKey);
      const lastSeenDate = lastSeenStr && new Date(lastSeenStr);
      return {
        lastSeenDate,
      };
    },
    [storageProvider]
  );

  const [result, setResult] = useState(buildResult);

  useEventListener(visibilityChangeEvent, () => {
    const isHidden = element.visibilityState === 'hidden';
    if (isHidden) {
      // callback to signal to save the App state
      const sleepDate = new Date().toISOString();
      storageProvider.setItem(storageKey, sleepDate);
      saveCallback();
    } else {
      // callback to have state restored
      const callbackResult = buildResult();
      setResult(callbackResult);
      restoreCallback(callbackResult);
    }
  }, element);

  return result;
};

export default useVisibilityChange;
