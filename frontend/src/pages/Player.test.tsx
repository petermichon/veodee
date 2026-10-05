import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AUTOPLAY_STORAGE_KEY, LOOP_STORAGE_KEY } from '@/lib/player';
import { VideoProvider } from '@/contexts/video-context';

const hoisted = vi.hoisted(() => ({
  surfaceProps: undefined as Record<string, unknown> | undefined,
}));

vi.mock('@/components/player/player-surface', () => ({
  PlayerSurface: (props: Record<string, unknown>) => {
    hoisted.surfaceProps = props;
    return <div data-testid="player-surface" />;
  },
}));

vi.mock('@/services/youtube-api', () => ({
  YouTubeAPI: {
    getVideoDetails: vi.fn().mockResolvedValue(null),
    clearCache: vi.fn(),
  },
}));

import { Player } from './Player';

function renderPlayer() {
  return render(
    <MemoryRouter initialEntries={['/watch?v=abc12345678']}>
      <VideoProvider>
        <Player />
      </VideoProvider>
    </MemoryRouter>
  );
}

describe('Player settings persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    hoisted.surfaceProps = undefined;
  });

  it('restores persisted autoplay and loop on mount', async () => {
    localStorage.setItem(AUTOPLAY_STORAGE_KEY, 'true');
    localStorage.setItem(LOOP_STORAGE_KEY, 'true');

    renderPlayer();
    // Flush the async video-details fetch so its state update happens in act.
    await act(async () => {});

    expect(hoisted.surfaceProps?.autoPlay).toBe(true);
    expect(hoisted.surfaceProps?.loop).toBe(true);
  });

  it('persists autoplay and loop toggles to storage', async () => {
    const user = userEvent.setup();
    renderPlayer();

    await user.click(screen.getByRole('button', { name: /settings/i }));
    await user.click(screen.getByRole('button', { name: /autoplay/i }));
    await user.click(screen.getByRole('button', { name: /loop/i }));

    expect(localStorage.getItem(AUTOPLAY_STORAGE_KEY)).toBe('true');
    expect(localStorage.getItem(LOOP_STORAGE_KEY)).toBe('true');
    expect(hoisted.surfaceProps?.autoPlay).toBe(true);
    expect(hoisted.surfaceProps?.loop).toBe(true);
  });
});
