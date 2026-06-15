import { Play, Home, UserPlus } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const NAVIGATION_ITEMS = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Player', href: '/player', icon: Play },
  { name: 'Channels', href: '/channels', icon: UserPlus },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-border/20 bg-background/80 backdrop-blur-md shadow-lg z-50">
      <div className="flex h-full items-center justify-around px-2">
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg text-xs font-medium transition-colors flex-1',
                isActive && 'text-foreground',
                !isActive && 'text-muted-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
