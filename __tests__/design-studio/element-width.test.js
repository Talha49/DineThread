import { act, render, screen } from '@testing-library/react';
import { useElementWidth } from '@/hooks/use-element-width';

let observers;
beforeEach(() => {
  observers = [];
  global.ResizeObserver = jest.fn(callback => {
    const observer = { callback, observe: jest.fn(), disconnect: jest.fn() };
    observers.push(observer);
    return observer;
  });
});
afterEach(() => { delete global.ResizeObserver; });

function Panel({ loading, replacement = false }) {
  const [ref, width] = useElementWidth(900);
  if (loading) return <p>Loading</p>;
  return <section ref={ref} key={String(replacement)} data-testid="panel">{width}</section>;
}

test('measures a panel that mounts after its loading screen', () => {
  const { rerender, unmount } = render(<Panel loading />);
  expect(observers).toHaveLength(0);
  rerender(<Panel loading={false} />);
  expect(observers).toHaveLength(1);
  expect(observers[0].observe).toHaveBeenCalledWith(screen.getByTestId('panel'));
  act(() => observers[0].callback([{ contentRect: { width: 390 } }]));
  expect(screen.getByTestId('panel')).toHaveTextContent('390');
  unmount();
  expect(observers[0].disconnect).toHaveBeenCalledTimes(1);
});

test('disconnects the old element and observes its replacement', () => {
  const { rerender } = render(<Panel loading={false} />);
  const first = screen.getByTestId('panel');
  rerender(<Panel loading={false} replacement />);
  expect(observers[0].disconnect).toHaveBeenCalledTimes(1);
  expect(observers[1].observe).toHaveBeenCalledWith(screen.getByTestId('panel'));
  expect(screen.getByTestId('panel')).not.toBe(first);
  act(() => observers[1].callback([{ contentRect: { width: 720 } }]));
  expect(screen.getByTestId('panel')).toHaveTextContent('720');
});
