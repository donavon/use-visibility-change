import { useState, useCallback } from 'react';
import useEventListener from '@use-it/event-listener';

const visibilityChangeEvent = 'visibilitychange';
const noop = () => {};

type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

export type Config = {
  onHide?: () => void;
  onShow?: (results: ShowResults) => void;
  storageKey?: string;
  shouldReturnResult?: boolean;
  storageProvider?: StorageLike;
  element?: Document;
};

type ShowResults = {
  lastSeenDate: Date | null;
};

export const useVisibilityChange = (config: Config = {}) => {
  const {
    onHide = noop,
    onShow = noop,
    storageKey = 'useSaveRestoreState.lastSeenDateUTC',
    shouldReturnResult = onHide === noop && onShow === noop,
    storageProvider = global.localStorage,
    element = global.document,
  } = config;

  const buildResult = useCallback((): ShowResults => {
    const lastSeenStr = storageProvider.getItem(storageKey);
    return {
      lastSeenDate: lastSeenStr ? new Date(lastSeenStr) : null,
    };
  }, [storageProvider]);

  const initialValue = (shouldReturnResult && buildResult) || undefined;
  const [result, setResult] = useState(initialValue);

  useEventListener(
    visibilityChangeEvent,
    () => {
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
    },
    element
  );

  return result;
};
