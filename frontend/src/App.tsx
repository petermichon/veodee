import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TopNav } from '@/components/ui/top-nav';
import { BottomNav } from '@/components/ui/bottom-nav';
import { VideoProvider } from '@/contexts/video-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { Player } from '@/pages/Player';
import { Thread } from '@/pages/Thread';
function App() {
  return (
    <ThemeProvider>
      <Router>
        <VideoProvider>
          <div className="min-h-screen">
            <div className="flex min-h-screen">
              <div className="flex flex-col flex-1 relative">
                <TopNav />
                <div className="flex pt-16 min-h-screen">
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Thread />} />
                      <Route path="/player" element={<Player />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </div>
          </div>
          <BottomNav />
        </VideoProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
