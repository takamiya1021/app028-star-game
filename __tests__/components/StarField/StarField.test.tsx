import { render, fireEvent, act } from '@testing-library/react';
import StarField from '@/components/StarField/StarField';
import type { Star } from '@/types/star';

const mockDrawStars = jest.fn();

jest.mock('@/lib/canvas/starRenderer', () => ({
  drawStars: (...args: unknown[]) => mockDrawStars(...(args as Parameters<typeof mockDrawStars>)),
}));

describe('StarField component', () => {
  const stars: Star[] = [
    {
      id: 1,
      ra: 0,
      dec: 0,
      vmag: 2,
      bv: 0.3,
      spectralType: 'A0',
      name: 'Alp Ori',
      hd: 12345,
      hr: 1234,
      parallax: 7.4,
      pmRA: 0.1,
      pmDE: -0.2,
      properName: 'テスト星',
    },
  ];

  beforeAll(() => {
    jest.useFakeTimers();
    // モックした requestAnimationFrame でアニメーションループを制御
    global.requestAnimationFrame = ((cb: FrameRequestCallback) =>
      setTimeout(() => cb(Date.now()), 0)) as unknown as typeof requestAnimationFrame;
    global.cancelAnimationFrame = ((id: number) => {
      clearTimeout(id as unknown as number);
    }) as unknown as typeof cancelAnimationFrame;
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    mockDrawStars.mockReset();
    mockDrawStars.mockReturnValue(stars.length);
    document.body.innerHTML = '<div id="root" style="width:800px;height:600px"></div>';
  });

  const flushTimers = async () => {
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
  };

  it('renders canvas and calls drawStars loop', () => {
    render(<StarField stars={stars} />, { container: document.getElementById('root')! });
    expect(mockDrawStars).toHaveBeenCalled();
  });

  it('reports visible star count through callback', async () => {
    const handleVisible = jest.fn();
    await act(async () => {
      render(<StarField stars={stars} onVisibleCountChange={handleVisible} />, { container: document.getElementById('root')! });
    });
    expect(handleVisible).toHaveBeenCalledWith(stars.length);
  });

  it('zooms in with mouse wheel', async () => {
    render(<StarField stars={stars} />, { container: document.getElementById('root')! });
    await flushTimers();
    const target = document.querySelector('canvas');
    expect(target).toBeTruthy();

    const initialZoom = mockDrawStars.mock.calls[0][3] as number;

    fireEvent.wheel(target!, { deltaY: -120 });
    await flushTimers();

    const zoomAfter = mockDrawStars.mock.calls.at(-1)?.[3] as number;
    expect(zoomAfter).toBeGreaterThan(initialZoom);
  });

  it('pans view with mouse drag', async () => {
    render(<StarField stars={stars} />, { container: document.getElementById('root')! });
    await flushTimers();

    const canvas = document.querySelector('canvas');
    expect(canvas).toBeTruthy();

    const initialView = mockDrawStars.mock.calls[0][2] as { ra: number; dec: number };

    fireEvent.mouseDown(canvas!, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(window, { clientX: 140, clientY: 120 });
    fireEvent.mouseUp(window);

    await flushTimers();

    const newView = mockDrawStars.mock.calls.at(-1)?.[2] as { ra: number; dec: number };
    expect(newView.ra).not.toBeCloseTo(initialView.ra);
    expect(newView.dec).not.toBeCloseTo(initialView.dec);
  });

  it('handles touch pinch zoom', async () => {
    render(<StarField stars={stars} />, { container: document.getElementById('root')! });
    await flushTimers();
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeTruthy();

    const initialZoom = mockDrawStars.mock.calls[0][3] as number;

    const touchStart = new TouchEvent('touchstart', {
      touches: [
        new Touch({ identifier: 1, target: canvas!, clientX: 100, clientY: 100 }) as any,
        new Touch({ identifier: 2, target: canvas!, clientX: 200, clientY: 100 }) as any,
      ],
    });
    await act(async () => {
      canvas!.dispatchEvent(touchStart);
    });

    const touchMove = new TouchEvent('touchmove', {
      touches: [
        new Touch({ identifier: 1, target: canvas!, clientX: 80, clientY: 100 }) as any,
        new Touch({ identifier: 2, target: canvas!, clientX: 220, clientY: 100 }) as any,
      ],
      cancelable: true,
    });
    await act(async () => {
      canvas!.dispatchEvent(touchMove);
    });

    await flushTimers();

    const zoomAfter = mockDrawStars.mock.calls.at(-1)?.[3] as number;
    expect(zoomAfter).toBeGreaterThan(initialZoom);
  });

  it('updates projection mode when prop changes', async () => {
    const { rerender } = render(<StarField stars={stars} projectionMode="orthographic" />, {
      container: document.getElementById('root')!,
    });
    await flushTimers();
    const initialMode = mockDrawStars.mock.calls.at(-1)?.[7];

    rerender(<StarField stars={stars} projectionMode="stereographic" />);
    await flushTimers();
    const modeAfter = mockDrawStars.mock.calls.at(-1)?.[7];
    expect(modeAfter).toEqual('stereographic');
    expect(modeAfter).not.toEqual(initialMode);
  });
});
