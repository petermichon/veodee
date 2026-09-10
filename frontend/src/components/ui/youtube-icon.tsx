import type { SVGProps } from 'react';

/**
 * Official YouTube Icon (red badge + white play mark).
 * Use only per the YouTube Branding Guidelines; any YouTube logo shown in the
 * app must link back to YouTube content.
 * https://developers.google.com/youtube/terms/branding-guidelines
 */
export function YouTubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        fill="#FF0000"
        d="M23.5 6.5a3 3 0 0 0-2.1-2.1C19.6 4 12 4 12 4s-7.6 0-9.4.4A3 3 0 0 0 .5 6.5 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.5 3 3 0 0 0 2.1 2.1C4.4 20 12 20 12 20s7.6 0 9.4-.4a3 3 0 0 0 2.1-2.1A31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.5Z"
      />
      <path fill="#fff" d="M9.6 15.6 15.9 12 9.6 8.4v7.2Z" />
    </svg>
  );
}
