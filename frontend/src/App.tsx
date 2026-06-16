import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TopNav } from '@/components/ui/top-nav';
import { BottomNav } from '@/components/ui/bottom-nav';
import { VideoProvider } from '@/contexts/video-context';
import { SubscriptionsProvider } from '@/contexts/subscriptions-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { SearchProvider } from '@/contexts/search-context';
import { Player } from '@/pages/Player';
import { Home } from '@/pages/Home';
import { Following } from '@/pages/Following';

function AppContent() {
  return (
    <>
      <div>
        <TopNav />
        <div className="pt-16 pb-16 md:pb-0 app-layout">
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/player" element={<Player />} />
              <Route path="/following" element={<Following />} />
            </Routes>
          </main>
        </div>
        <BottomNav />
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
            <SearchProvider>
              <AppContent />
            </SearchProvider>
          </SubscriptionsProvider>
        </VideoProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
