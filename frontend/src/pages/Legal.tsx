import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { YOUTUBE_TOS_URL, GOOGLE_PRIVACY_URL, REPO_URL } from '@/lib/legal';

const LAST_UPDATED = 'September 2026';

function LegalLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-0 sm:pt-4 pb-8">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-2xl font-semibold text-foreground mb-1">{title}</h1>
        <p className="text-xs text-muted-foreground mb-8">
          Last updated: {LAST_UPDATED}
        </p>
        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-medium [&_h2]:text-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Terms() {
  return (
    <LegalLayout title="Terms of Use">
      <p>
        Veodee is an independent, browser-based YouTube player and playlist
        manager. It is not affiliated with, endorsed by, or sponsored by YouTube
        or Google.
      </p>
      <section>
        <h2>YouTube Terms of Service</h2>
        <p>
          Veodee uses YouTube API Services, including the YouTube embedded
          player. By using Veodee, you agree to be bound by the{' '}
          <a href={YOUTUBE_TOS_URL} target="_blank" rel="noopener noreferrer">
            YouTube Terms of Service
          </a>
          . See the{' '}
          <a
            href={GOOGLE_PRIVACY_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Privacy Policy
          </a>{' '}
          for how Google handles your data.
        </p>
      </section>
      <section>
        <h2>Content</h2>
        <p>
          All videos and video metadata are provided by YouTube and remain the
          property of their respective owners. Veodee does not host, download,
          or redistribute any YouTube video content.
        </p>
      </section>
      <section>
        <h2>No warranty</h2>
        <p>
          Veodee is provided &quot;as is&quot; and &quot;as available&quot;,
          without warranty of any kind. Playback availability depends on YouTube
          and may change at any time.
        </p>
      </section>
    </LegalLayout>
  );
}

export function Privacy() {
  return (
    <LegalLayout title="Privacy Policy">
      <p>
        Veodee is a client-side application. It has no accounts and no backend
        server, and we do not collect, transmit, or store your personal data on
        our servers.
      </p>
      <section>
        <h2>Data stored on your device</h2>
        <p>
          Your playlists, followed channels, and preferences (such as theme,
          player settings, and background) are stored locally in your browser's
          localStorage. This data never leaves your device, and you can remove
          it at any time by clearing this site's browser storage.
        </p>
      </section>
      <section>
        <h2>YouTube API Services</h2>
        <p>
          Veodee uses YouTube API Services to load video information and to play
          videos through the embedded YouTube player. When you load a page or
          play a video, YouTube may collect information such as your IP address,
          browser and device information, and viewing activity, as described in
          the{' '}
          <a
            href={GOOGLE_PRIVACY_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Privacy Policy
          </a>
          . Veodee does not access or store this information.
        </p>
      </section>
      <section>
        <h2>Cookies and third parties</h2>
        <p>
          The embedded YouTube player may set cookies or use similar
          technologies. When privacy-enhanced (no-cookie) mode is used, YouTube
          does not store information about you until you play a video.
        </p>
      </section>
      <section>
        <h2>Your choices</h2>
        <p>
          You can revoke Veodee's access to YouTube at any time in Settings, and
          you can delete all locally stored data by clearing your browser's
          storage for this site.
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>
          For questions about this policy, open an issue at{' '}
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
            github.com/petermichon/veodee
          </a>
          .
        </p>
      </section>
    </LegalLayout>
  );
}
