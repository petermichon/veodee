import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import type { PlayerRendererProps } from './types';

const hoisted = vi.hoisted(() => ({
  props: undefined as PlayerRendererProps | undefined,
}));

vi.mock('./engines/registry', () => {
  const FakeRenderer = (props: PlayerRendererProps) => {
    hoisted.props = props;
    return (
      <div>
        <button onClick={props.onReady}>emit-ready</button>
        <button onClick={() => props.onError(new Error('boom'))}>
          emit-error
        </button>
      </div>
    );
  };
  return { PLAYER_RENDERERS: { iframe: FakeRenderer, plyr: FakeRenderer } };
});

import { PlayerSurface } from './player-surface';

function renderSurface(
  overrides: Partial<ComponentProps<typeof PlayerSurface>> = {}
) {
  const props: ComponentProps<typeof PlayerSurface> = {
    videoId: 'abc12345678',
    engine: 'iframe',
    cookiesEnabled: false,
    autoPlay: false,
    loop: false,
    forcedAspectRatio: null,
    fillScreen: false,
    fullscreenMode: 'cover',
    showPermissionModal: false,
    onGrantPermission: vi.fn(),
    ...overrides,
  };
  render(<PlayerSurface {...props} />);
  return props;
}

describe('PlayerSurface', () => {
  beforeEach(() => {
    hoisted.props = undefined;
    vi.restoreAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('shows the permission prompt when requested', async () => {
    const user = userEvent.setup();
    const props = renderSurface({
      videoId: null,
      showPermissionModal: true,
    });

    expect(screen.getByText('Allow YouTube Connection')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Allow' }));
    expect(props.onGrantPermission).toHaveBeenCalledTimes(1);
  });

  it('hides the loading cover once the engine is ready', async () => {
    const user = userEvent.setup();
    renderSurface();

    expect(screen.getByTestId('player-loading-cover')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'emit-ready' }));
    expect(
      screen.queryByTestId('player-loading-cover')
    ).not.toBeInTheDocument();
  });

  it('surfaces an error and retries by remounting the engine', async () => {
    const user = userEvent.setup();
    renderSurface();

    await user.click(screen.getByRole('button', { name: 'emit-error' }));
    expect(screen.getByText('Failed to load video')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(screen.queryByText('Failed to load video')).not.toBeInTheDocument();
    expect(hoisted.props).toBeDefined();
  });

  it('passes the cookie preference through to the engine', () => {
    renderSurface({ cookiesEnabled: true });
    expect(hoisted.props?.cookiesEnabled).toBe(true);
  });
});
