import { Youtube } from 'lucide-react';

interface YouTubePermissionBannerProps {
  onAllow: () => void;
}

export function YouTubePermissionBanner({
  onAllow,
}: YouTubePermissionBannerProps) {
  return (
    <div
      className="mb-6 p-6 cursor-pointer group rounded-lg bg-muted/30"
      onClick={onAllow}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Youtube className="h-10 w-10 text-white flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Allow YouTube Connection
            </h3>
            <p className="text-sm text-muted-foreground">
              YouTube may collect IP address, browser info, and viewing data per
              their privacy policy
            </p>
          </div>
        </div>
        <span className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          Allow
        </span>
      </div>
    </div>
  );
}
