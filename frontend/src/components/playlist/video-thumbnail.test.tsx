import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { VideoThumbnail } from './video-thumbnail';

const OEMBED_HQ = 'https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg';
const CONSTRUCTED_HQ = 'https://img.youtube.com/vi/abcdefghijk/hqdefault.jpg';

describe('VideoThumbnail', () => {
  it('uses the provided oEmbed thumbnail URL', () => {
    render(
      <VideoThumbnail videoId="abcdefghijk" src={OEMBED_HQ} alt="cover" />
    );

    expect(screen.getByAltText('cover')).toHaveAttribute('src', OEMBED_HQ);
  });

  it('falls back to the constructed hqdefault URL', () => {
    render(<VideoThumbnail videoId="abcdefghijk" alt="cover" />);

    expect((screen.getByAltText('cover') as HTMLImageElement).src).toBe(
      CONSTRUCTED_HQ
    );
  });

  it('lazy-loads and decodes asynchronously', () => {
    render(<VideoThumbnail videoId="abcdefghijk" alt="cover" />);
    const img = screen.getByAltText('cover');

    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('never requests maxres', () => {
    render(
      <VideoThumbnail
        videoId="abcdefghijk"
        src={OEMBED_HQ}
        cropLetterbox
        alt="cover"
      />
    );

    expect((screen.getByAltText('cover') as HTMLImageElement).src).toBe(
      OEMBED_HQ
    );
    expect(
      (screen.getByAltText('cover') as HTMLImageElement).src
    ).not.toContain('maxresdefault');
  });

  it('forwards the load event', () => {
    const onLoad = vi.fn();
    render(
      <VideoThumbnail videoId="abcdefghijk" alt="cover" onLoad={onLoad} />
    );

    fireEvent.load(screen.getByAltText('cover'));

    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it('does not crop by default', () => {
    render(<VideoThumbnail videoId="abcdefghijk" alt="cover" />);

    expect(
      (screen.getByAltText('cover') as HTMLImageElement).style.transform
    ).toBe('');
  });

  it('zooms to crop the letterbox when cropLetterbox is set', () => {
    render(<VideoThumbnail videoId="abcdefghijk" cropLetterbox alt="cover" />);

    expect(
      (screen.getByAltText('cover') as HTMLImageElement).style.transform
    ).toContain('scale(');
  });
});
