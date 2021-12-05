import { renderHook, cleanup } from '@testing-library/react-hooks';
import { useVisibilityChange } from '.';

afterEach(cleanup);

const date = new Date();

const createMockElement = () => {
  const _handlers: Record<string, null | ((event: any) => void)> = {};

  const element = {
    addEventListener: (eventName: any, handler: any) => {
      _handlers[eventName] = handler;
    },
    removeEventListener: (eventName: any) => {
      _handlers[eventName] = null;
    },
    dispatchEvent: (event: any) => {
      _handlers[event.type]?.(event);
    },
  };
  return (element as unknown) as Document;
};

const createMockStorage = (value: any) => ({
  getItem: () => (value === null ? null : value),
  setItem: () => {},
});

describe('useVisibilityChange', () => {
  test('takes an optional config object`', () => {
    renderHook(() => {
      useVisibilityChange();
    });
  });

  test('returns an object containing lastSeenDate=null if user has never visited your site`', () => {
    const storageProvider = createMockStorage(null);

    let result;
    renderHook(() => {
      result = useVisibilityChange({ storageProvider });
    });

    expect(result).toEqual({ lastSeenDate: null });
  });

  test('returns undefined if onShow or onHide is specified`', () => {
    const storageProvider = createMockStorage(null);
    const noop = () => {};
    let result;
    renderHook(() => {
      result = useVisibilityChange({ storageProvider, onShow: noop });
    });
    expect(result).toBeUndefined();

    renderHook(() => {
      result = useVisibilityChange({ storageProvider, onHide: noop });
    });
    expect(result).toBeUndefined();

    renderHook(() => {
      result = useVisibilityChange({
        storageProvider,
        onShow: noop,
        onHide: noop,
      });
    });
    expect(result).toBeUndefined();
  });

  test('returns undefined if onShow or onHide is specified unloess you set shouldReturnResult to true`', () => {
    const storageProvider = createMockStorage(null);
    const noop = () => {};
    let result;
    renderHook(() => {
      result = useVisibilityChange({
        storageProvider,
        onShow: noop,
        shouldReturnResult: true,
      });
    });
    expect(result).toEqual({ lastSeenDate: null });

    renderHook(() => {
      result = useVisibilityChange({
        storageProvider,
        onHide: noop,
        shouldReturnResult: true,
      });
    });
    expect(result).toEqual({ lastSeenDate: null });

    renderHook(() => {
      result = useVisibilityChange({
        storageProvider,
        onHide: noop,
        onShow: noop,
        shouldReturnResult: true,
      });
    });
    expect(result).toEqual({ lastSeenDate: null });
  });

  test('returns an object containing lastSeenDate=Date if user has visited previously`', () => {
    let result;
    renderHook(() => {
      result = useVisibilityChange({
        storageProvider: createMockStorage(date.toISOString()),
      });
    });

    expect(result).toEqual({ lastSeenDate: date });
  });

  test('will call onHide when leaving from view`', () => {
    const handler = jest.fn();
    const element = createMockElement();
    const storageProvider = createMockStorage(null);

    let result;
    renderHook(() => {
      result = useVisibilityChange({
        onHide: handler,
        storageProvider,
        element,
      });
    });

    (element as any).visibilityState = 'hidden';
    element.dispatchEvent(new Event('visibilitychange'));

    expect(handler).toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  test('will call onShow when returning to view (no result)`', done => {
    const handler = jest.fn();
    const element = createMockElement();
    const storageProvider = createMockStorage(date.toISOString());

    let result: any;
    renderHook(() => {
      result = useVisibilityChange({
        onShow: handler,
        storageProvider,
        element,
      });
    });
    expect(result).toBeUndefined();

    (element as any).visibilityState = 'visible';
    element.dispatchEvent(new Event('visibilitychange'));

    expect(handler).toHaveBeenCalledWith({ lastSeenDate: date });
    setTimeout(() => {
      expect(result).toBeUndefined();
      done();
    }, 1);
  });

  test('will call onShow when returning to view (return result)`', done => {
    const handler = jest.fn();
    const element = createMockElement();
    const storageProvider = createMockStorage(date.toISOString());

    let result: any;
    renderHook(() => {
      result = useVisibilityChange({
        onShow: handler,
        storageProvider,
        element,
        shouldReturnResult: true,
      });
    });
    expect(result).toEqual({ lastSeenDate: date });

    (element as any).visibilityState = 'visible';
    element.dispatchEvent(new Event('visibilitychange'));

    expect(handler).toHaveBeenCalledWith({ lastSeenDate: date });
    setTimeout(() => {
      expect(result).toEqual({ lastSeenDate: date });
      done();
    }, 1);
  });
});
