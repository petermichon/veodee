import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { Footer } from '@/components/ui/footer';
import { useTag } from '@/contexts/tag-context';
import { getYouTubeThumbnailUrl } from '@/lib/color-extractor';

export function Theme() {
  const location = useLocation();
  const { videos } = useTag();
  const [currentBackground, setCurrentBackground] = useState(() => {
    return localStorage.getItem('home-background');
  });

  // Generate all available backgrounds from video thumbnails
  const allBackgrounds = useMemo(() => {
    return videos.map(video => ({
      url: getYouTubeThumbnailUrl(video.id, 'hqdefault'),
      videoId: video.id
    }));
  }, [videos]);

  // Scroll to top when location changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Listen for background changes
  useEffect(() => {
    const handleBackgroundChange = () => {
      setCurrentBackground(localStorage.getItem('home-background'));
    };
    window.addEventListener('background-changed', handleBackgroundChange);
    return () => window.removeEventListener('background-changed', handleBackgroundChange);
  }, []);

  const handleSelectBackground = (backgroundUrl: string | null) => {
    if (backgroundUrl === null) {
      localStorage.removeItem('home-background');
    } else {
      localStorage.setItem('home-background', backgroundUrl);
    }
    setCurrentBackground(backgroundUrl);
    window.dispatchEvent(new CustomEvent('background-changed'));
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      {currentBackground && (
        <div
          className="fixed inset-0"
          style={{
            backgroundImage: currentBackground.startsWith('linear-gradient') || currentBackground.startsWith('radial-gradient')
              ? currentBackground
              : `url(${currentBackground})`,
            backgroundSize: currentBackground?.startsWith('linear-gradient') || currentBackground?.startsWith('radial-gradient') ? 'cover' : 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 0,
            transition: 'background-image 0.5s ease-in-out',
          }}
        >
          <div
            className="absolute inset-0 backdrop-blur-[200px]"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          />
        </div>
      )}

      <div className="relative z-10 md:px-8 md:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Theme</h1>
            <p className="text-muted-foreground">
              Customize your background with custom images
            </p>
          </div>

        {/* Custom Backgrounds */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Custom Backgrounds</h2>
          {allBackgrounds.length === 0 ? (
            <div className="text-center py-16">
              <Upload className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No videos in library yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
              {allBackgrounds.map((bg) => (
                <div
                  key={bg.videoId}
                  className="relative group rounded-lg overflow-hidden cursor-pointer transition-opacity hover:opacity-90"
                  onClick={() => handleSelectBackground(bg.url)}
                >
                  <img
                    src={bg.url}
                    alt={`Video ${bg.videoId}`}
                    className="w-full h-32 object-cover"
                  />
                  {currentBackground === bg.url && (
                    <div className="absolute top-2 right-2 bg-primary text-white p-1.5 rounded-full">
                      <div className="h-3 w-3 rounded-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
      </div>
    </div>
  );
}
