import { useState, useCallback } from 'react';
import useEventListener from '@use-it/event-listener';

const visibilityChangeEvent = 'visibilitychange';
const noop = () => {};

const useVisibilityChange = (config = {}) => {
  const {
    onHide = noop,
    onShow = noop,
    storageKey = 'useSaveRestoreState.lastSeenDateUTC',
    shouldReturnResult = onHide === noop && onShow === noop,
    storageProvider = localStorage,
    element = global.document,
  } = config;

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

  const initialValue = (shouldReturnResult && buildResult) || undefined;
  const [result, setResult] = useState(initialValue);

  useEventListener(visibilityChangeEvent, () => {
    const isHidden = element.visibilityState === 'hidden';
    if (isHidden) {
      const sleepDate = new Date().toISOString();
      storageProvider.setItem(storageKey, sleepDate);
      onHide();
    } else {
      // callback to have state restored
      const callbackResult = buildResult();
      if (shouldReturnResult) {
        setResult(callbackResult);
      }
      onShow(callbackResult);
    }
  }, element);

  return result;
};

export default useVisibilityChange;
