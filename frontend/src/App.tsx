import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TopNav } from '@/components/ui/top-nav';
import { BottomNav } from '@/components/ui/bottom-nav';
import { Footer } from '@/components/ui/footer';
import { VideoProvider } from '@/contexts/video-context';
import { SubscriptionsProvider } from '@/contexts/subscriptions-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { Player } from '@/pages/Player';
import { Home } from '@/pages/Home';
import { Following } from '@/pages/Following';

function AppContent() {
  return (
    <>
      <div className="flex min-h-dvh flex-col">
        <TopNav />
        <main className="app-layout flex-1 pt-16 pb-16 md:pb-0 grid">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/player" element={<Player />} />
            <Route path="/following" element={<Following />} />
          </Routes>
        </main>
        <Footer />
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
            <AppContent />
          </SubscriptionsProvider>
        </VideoProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
