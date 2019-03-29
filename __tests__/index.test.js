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
  test('all parameters are optional`', () => {
    testHook(() => {
      useVisibilityChange();
    });
  });

  test('returns an object containing lastSeenDate=null if user has never visited your site`', () => {
    let result;
    testHook(() => {
      result = useVisibilityChange(undefined, undefined, createMockStorage(null));
    });

    expect(result).toEqual({ lastSeenDate: null });
  });

  test('returns an object containing lastSeenDate=Date if user has visited previously`', () => {
    let result;
    testHook(() => {
      result = useVisibilityChange(undefined, undefined, createMockStorage(date.toISOString()));
    });

    expect(result).toEqual({ lastSeenDate: date });
  });

  test('will call saveCallback when leaving from view`', () => {
    const handler = jest.fn();
    const mockElement = createMockElement();

    testHook(() => {
      useVisibilityChange(handler, undefined, createMockStorage(), mockElement);
    });

    mockElement.visibilityState = 'hidden';
    mockElement.dispatchEvent(new Event('visibilitychange'));

    expect(handler).toHaveBeenCalled();
  });

  test('will call restoreCallback when returning to view`', () => {
    const handler = jest.fn();
    const mockElement = createMockElement();

    testHook(() => {
      useVisibilityChange(undefined, handler, createMockStorage(date.toISOString()), mockElement);
    });
    mockElement.visibilityState = 'visible';
    mockElement.dispatchEvent(new Event('visibilitychange'));

    expect(handler).toHaveBeenCalledWith({ lastSeenDate: date });
  });
});
