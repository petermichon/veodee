import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NAVIGATION_ITEMS } from '@/lib/navigation';
import { useRipple } from '@/hooks/use-ripple';

type NavItem = (typeof NAVIGATION_ITEMS)[number];

function NavTabLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const { ripples, addRipple, removeRipple } = useRipple();
  const Icon = item.icon;

  return (
    <Link
      to={item.href}
      aria-current={isActive ? 'page' : undefined}
      onPointerDown={addRipple}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        'relative flex flex-1 flex-col items-center justify-center gap-0.5 overflow-hidden text-[11px] font-medium transition-colors',
        isActive ? 'text-foreground' : 'text-muted-foreground'
      )}
    >
      {isActive && <span aria-hidden="true" className="nav-glow" />}
      <Icon
        className={cn('relative z-10 h-5 w-5', isActive && 'stroke-[2.5]')}
      />
      <span className="relative z-10">{item.name}</span>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          aria-hidden="true"
          className="ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            marginLeft: -ripple.size / 2,
            marginTop: -ripple.size / 2,
          }}
          onAnimationEnd={() => removeRipple(ripple.id)}
        />
      ))}
    </Link>
  );
}

export function NavTabBar() {
  const location = useLocation();

  return (
    <nav
      aria-label="Primary"
      className="bottom-nav md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/80 dark:bg-neutral-950/80 backdrop-blur-lg pb-[env(safe-area-inset-bottom)] select-none-touch"
    >
      <div className="flex h-14 items-stretch">
        {NAVIGATION_ITEMS.map((item) => (
          <NavTabLink
            key={item.name}
            item={item}
            isActive={location.pathname === item.href}
          />
        ))}
      </div>
    </nav>
  );
}
