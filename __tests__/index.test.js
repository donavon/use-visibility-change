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

  test('returns an object containing lastSeenDate=Date if user has visited previously`', () => {
    let result;
    testHook(() => {
      result = useVisibilityChange({ storageProvider: createMockStorage(date.toISOString()) });
    });

    expect(result).toEqual({ lastSeenDate: date });
  });

  test('will call onSave when leaving from view`', () => {
    const handler = jest.fn();
    const element = createMockElement();
    const storageProvider = createMockStorage(null);

    testHook(() => {
      useVisibilityChange({ onHide: handler, storageProvider, element });
    });

    element.visibilityState = 'hidden';
    element.dispatchEvent(new Event('visibilitychange'));

    expect(handler).toHaveBeenCalled();
  });

  test('will call restoreCallback when returning to view`', () => {
    const handler = jest.fn();
    const element = createMockElement();
    const storageProvider = createMockStorage(date.toISOString());

    testHook(() => {
      useVisibilityChange({ onShow: handler, storageProvider, element });
    });
    element.visibilityState = 'visible';
    element.dispatchEvent(new Event('visibilitychange'));

    expect(handler).toHaveBeenCalledWith({ lastSeenDate: date });
  });
});
