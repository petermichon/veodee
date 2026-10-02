import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const hoisted = vi.hoisted(() => ({
  videoProps: undefined as Record<string, unknown> | undefined,
}));

vi.mock('@videojs/react/video', () => ({
  VideoPlayer: ({ children }: { children?: unknown }) => <div>{children}</div>,
  VideoSkin: ({ children }: { children?: unknown }) => <div>{children}</div>,
}));

vi.mock('@videojs/react/media/youtube-video', () => ({
  YouTubeVideo: (props: Record<string, unknown>) => {
    hoisted.videoProps = props;
    return (
      <div>
        <button onClick={() => (props.onLoadedMetadata as () => void)()}>
          emit-metadata
        </button>
        <button onClick={() => (props.onPlaying as () => void)()}>
          emit-playing
        </button>
        <button onClick={() => (props.onError as () => void)()}>
          emit-error
        </button>
      </div>
    );
  },
}));

import VideoJsPlayer from './videojs-player';
import type { PlayerRendererProps } from '../types';

function setup(overrides: Partial<PlayerRendererProps> = {}) {
  const props: PlayerRendererProps = {
    videoId: 'aqz-KE-bpKQ',
    cookiesEnabled: false,
    autoPlayEnabled: false,
    loopEnabled: false,
    forcedAspectRatio: null,
    onReady: vi.fn(),
    onError: vi.fn(),
    ...overrides,
  };
  render(<VideoJsPlayer {...props} />);
  return props;
}

describe('VideoJsPlayer', () => {
  beforeEach(() => {
    hoisted.videoProps = undefined;
  });

  it('maps props onto the YouTube adapter source and options', () => {
    setup({
      cookiesEnabled: true,
      autoPlayEnabled: true,
      loopEnabled: true,
    });

    const source = hoisted.videoProps?.source as {
      src: string;
      engine: { youtube: Record<string, unknown> };
    };
    expect(source.src).toBe('https://www.youtube.com/embed/aqz-KE-bpKQ');
    expect(source.engine.youtube.playlist).toBe('aqz-KE-bpKQ');
    expect(hoisted.videoProps?.autoplay).toBe(true);
    expect(hoisted.videoProps?.muted).toBe(true);
    expect(hoisted.videoProps?.defaultMuted).toBe(true);
    expect(hoisted.videoProps?.loop).toBe(true);
  });

  it('uses the privacy-enhanced host when cookies are disabled', () => {
    setup({ cookiesEnabled: false });
    const source = hoisted.videoProps?.source as { src: string };
    expect(source.src).toBe(
      'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ'
    );
    expect(hoisted.videoProps?.muted).toBe(false);
  });

  it('reports readiness once across metadata and playing', () => {
    const props = setup();
    fireEvent.click(screen.getByRole('button', { name: 'emit-metadata' }));
    fireEvent.click(screen.getByRole('button', { name: 'emit-playing' }));
    expect(props.onReady).toHaveBeenCalledTimes(1);
  });

  it('reports adapter errors', () => {
    const props = setup();
    fireEvent.click(screen.getByRole('button', { name: 'emit-error' }));
    expect(props.onError).toHaveBeenCalledTimes(1);
    expect(props.onError).toHaveBeenCalledWith(expect.any(Error));
  });
});
