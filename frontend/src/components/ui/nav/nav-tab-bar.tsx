import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NAVIGATION_ITEMS } from '@/lib/navigation';

export function NavTabBar() {
  const location = useLocation();

  return (
    <nav className="bottom-nav md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/80 dark:bg-neutral-950/80 backdrop-blur-lg pb-[env(safe-area-inset-bottom)] select-none-touch">
      <div className="flex h-14 items-stretch">
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              onContextMenu={(e) => e.preventDefault()}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors',
                isActive ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
