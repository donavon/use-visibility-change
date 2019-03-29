import { useState, useCallback } from 'react';
import useEventListener from '@use-it/event-listener';

const visibilityChangeEvent = 'visibilitychange';
const noop = () => {};

const useVisibilityChange = (config = {}) => {
  const {
    onHide = noop,
    onShow = noop,
    storageKey = 'useSaveRestoreState.lastSeenDateUTC',
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

  const [result, setResult] = useState(buildResult);

  useEventListener(visibilityChangeEvent, () => {
    const isHidden = element.visibilityState === 'hidden';
    if (isHidden) {
      const sleepDate = new Date().toISOString();
      storageProvider.setItem(storageKey, sleepDate);
      onHide();
    } else {
      // callback to have state restored
      const callbackResult = buildResult();
      setResult(callbackResult);
      onShow(callbackResult);
    }
  }, element);

  return result;
};

export default useVisibilityChange;
