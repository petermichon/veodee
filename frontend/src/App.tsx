import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TopNav } from '@/components/ui/top-nav';
import { BottomNav } from '@/components/ui/bottom-nav';
import { AddFab } from '@/components/ui/add/add-fab';
import { VideoProvider } from '@/contexts/video-context';
import { SubscriptionsProvider } from '@/contexts/subscriptions-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { Player } from '@/pages/Player';
import { Home } from '@/pages/Home';
import { Following } from '@/pages/Following';
import { Terms, Privacy } from '@/pages/Legal';
import { isYouTubeHostedUrl } from '@/lib/youtube';

function AppContent() {
  const [backgroundImage, setBackgroundImage] = useState(() => {
    return localStorage.getItem('home-background');
  });
  const [backgroundMode, setBackgroundMode] = useState<'normal' | 'custom'>(
    () => {
      const savedMode = localStorage.getItem('background-mode');
      if (savedMode === 'normal' || savedMode === 'custom') {
        return savedMode;
      }
      return 'custom';
    }
  );
  const [youtubePermission, setYoutubePermission] = useState(
    () => localStorage.getItem('youtube-permission') !== 'false'
  );

  useEffect(() => {
    const handleGranted = () => setYoutubePermission(true);
    const handleRevoked = () => setYoutubePermission(false);
    window.addEventListener('youtube-permission-granted', handleGranted);
    window.addEventListener('youtube-permission-revoked', handleRevoked);
    return () => {
      window.removeEventListener('youtube-permission-granted', handleGranted);
      window.removeEventListener('youtube-permission-revoked', handleRevoked);
    };
  }, []);

  const showBackground =
    backgroundMode === 'custom' &&
    !!backgroundImage &&
    (youtubePermission || !isYouTubeHostedUrl(backgroundImage));

  useEffect(() => {
    const handleBackgroundChange = () => {
      setBackgroundImage(localStorage.getItem('home-background'));
      const savedMode = localStorage.getItem('background-mode');
      if (savedMode === 'normal' || savedMode === 'custom') {
        setBackgroundMode(savedMode);
      } else {
        setBackgroundMode('custom');
      }
    };
    window.addEventListener('background-changed', handleBackgroundChange);
    return () =>
      window.removeEventListener('background-changed', handleBackgroundChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (!showBackground) {
      root.style.removeProperty('--app-background-image');
      return;
    }
    const isGradient =
      backgroundImage.startsWith('linear-gradient') ||
      backgroundImage.startsWith('radial-gradient');
    root.style.setProperty(
      '--app-background-image',
      isGradient ? backgroundImage : `url(${backgroundImage})`
    );
  }, [showBackground, backgroundImage]);

  return (
    <>
      {showBackground && (
        <div
          className="fixed inset-0 pointer-events-none backdrop-blur-[100px]"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 0 }}
        />
      )}
      <div className="relative z-10">
        <TopNav />
        <main className="app-layout min-h-dvh pt-16 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/watch" element={<Player />} />
            <Route path="/following" element={<Following />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </main>
        <BottomNav />
        <AddFab />
      </div>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <VideoProvider>
          <SubscriptionsProvider>
            <AppContent />
          </SubscriptionsProvider>
        </VideoProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
