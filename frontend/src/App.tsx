import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import { useEffect } from 'react';
import { TopNav } from '@/components/ui/top-nav';
import { BottomNav } from '@/components/ui/bottom-nav';
import { VideoProvider } from '@/contexts/video-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { Player } from '@/pages/Player';
import { Cinema } from '@/pages/Cinema';
import { Thread } from '@/pages/Thread';

function AppContent() {
  const location = useLocation();
  const isCinema = location.pathname === '/cinema';

  useEffect(() => {
    if (isCinema) {
      document.documentElement.classList.add('cinema-mode');
    } else {
      document.documentElement.classList.remove('cinema-mode');
    }
  }, [isCinema]);

  return (
    <>
      {isCinema ? (
        <Cinema />
      ) : (
        <div className="min-h-screen">
          <div className="flex min-h-screen">
            <div className="flex flex-col flex-1 relative">
              <TopNav />
              <div className="flex min-h-screen pt-16">
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Thread />} />
                    <Route path="/player" element={<Player />} />
                  </Routes>
                </main>
              </div>
            </div>
          </div>
          <BottomNav />
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <VideoProvider>
          <AppContent />
        </VideoProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
