import { NavTabBar } from '@/components/ui/nav/nav-tab-bar';

/**
 * Mobile bottom navigation. Uses the docked tab bar.
 *
 * The previous glassmorphism nav is preserved in components/ui/nav-pill.tsx
 * (NavPill) if we want to switch back.
 */
export function BottomNav() {
  return <NavTabBar />;
}
