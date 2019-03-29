import { testHook, cleanup } from 'react-hooks-testing-library';
import 'jest-dom/extend-expect';

import useVisibilityChange from '../src';

afterEach(cleanup);

const date = new Date();

const createMockElement = () => {
  const element = {
    _handlers: {},
    addEventListener: (eventName, handler) => {
      element._handlers[eventName] = handler;
    },
    removeEventListener: (eventName) => {
      element._handlers[eventName] = null;
    },
    dispatchEvent: (event) => {
      element._handlers[event.type](event);
    },
  };
  return element;
};

const createMockStorage = value => ({
  getItem: () => (value === null ? null : value),
  setItem: () => {},
});

describe('useVisibilityChange', () => {
  test('takes an optional config object`', () => {
    testHook(() => {
      useVisibilityChange();
    });
  });

  test('returns an object containing lastSeenDate=null if user has never visited your site`', () => {
    const storageProvider = createMockStorage(null);

    let result;
    testHook(() => {
      result = useVisibilityChange({ storageProvider });
    });

    expect(result).toEqual({ lastSeenDate: null });
  });

  test('returns undefined if onShow or onHide is specified`', () => {
    const storageProvider = createMockStorage(null);
    const noop = () => {};
    let result;
    testHook(() => {
      result = useVisibilityChange({ storageProvider, onShow: noop });
    });
    expect(result).toBeUndefined();

    testHook(() => {
      result = useVisibilityChange({ storageProvider, onHide: noop });
    });
    expect(result).toBeUndefined();

    testHook(() => {
      result = useVisibilityChange({ storageProvider, onShow: noop, onHide: noop });
    });
    expect(result).toBeUndefined();
  });

  test('returns undefined if onShow or onHide is specified unloess you set shouldReturnResult to true`', () => {
    const storageProvider = createMockStorage(null);
    const noop = () => {};
    let result;
    testHook(() => {
      result = useVisibilityChange({ storageProvider, onShow: noop, shouldReturnResult: true });
    });
    expect(result).toEqual({ lastSeenDate: null });

    testHook(() => {
      result = useVisibilityChange({ storageProvider, onHide: noop, shouldReturnResult: true });
    });
    expect(result).toEqual({ lastSeenDate: null });

    testHook(() => {
      result = useVisibilityChange({
        storageProvider, onHide: noop, onShow: noop, shouldReturnResult: true,
      });
    });
    expect(result).toEqual({ lastSeenDate: null });
  });


  test('returns an object containing lastSeenDate=Date if user has visited previously`', () => {
    let result;
    testHook(() => {
      result = useVisibilityChange({ storageProvider: createMockStorage(date.toISOString()) });
    });

    expect(result).toEqual({ lastSeenDate: date });
  });

  test('will call onHide when leaving from view`', () => {
    const handler = jest.fn();
    const element = createMockElement();
    const storageProvider = createMockStorage(null);

    let result;
    testHook(() => {
      result = useVisibilityChange({ onHide: handler, storageProvider, element });
    });

    element.visibilityState = 'hidden';
    element.dispatchEvent(new Event('visibilitychange'));

    expect(handler).toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  test('will call onShow when returning to view (no result)`', (done) => {
    const handler = jest.fn();
    const element = createMockElement();
    const storageProvider = createMockStorage(date.toISOString());

    let result;
    testHook(() => {
      result = useVisibilityChange({ onShow: handler, storageProvider, element });
    });
    expect(result).toBeUndefined();

    element.visibilityState = 'visible';
    element.dispatchEvent(new Event('visibilitychange'));

    expect(handler).toHaveBeenCalledWith({ lastSeenDate: date });
    setTimeout(() => {
      expect(result).toBeUndefined();
      done();
    }, 1);
  });

  test('will call onShow when returning to view (return result)`', (done) => {
    const handler = jest.fn();
    const element = createMockElement();
    const storageProvider = createMockStorage(date.toISOString());

    let result;
    testHook(() => {
      result = useVisibilityChange({
        onShow: handler, storageProvider, element, shouldReturnResult: true,
      });
    });
    expect(result).toEqual({ lastSeenDate: date });

    element.visibilityState = 'visible';
    element.dispatchEvent(new Event('visibilitychange'));

    expect(handler).toHaveBeenCalledWith({ lastSeenDate: date });
    setTimeout(() => {
      expect(result).toEqual({ lastSeenDate: date });
      done();
    }, 1);
  });
});
