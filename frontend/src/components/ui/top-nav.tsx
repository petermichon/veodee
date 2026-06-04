import { useState, useEffect, useRef, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import {
  User,
  Play,
  Home,
  LogOut,
  LogIn,
  UserPlus,
  WifiOff,
  Settings,
  Youtube,
  Sun,
  Moon,
  SunMoon,
} from 'lucide-react';
import { YouTubeAPI } from '@/services/youtube-api';
import { useLocation, Link } from 'react-router-dom';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';

const NAVIGATION_ITEMS = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Player', href: '/player', icon: Play },
];

interface NavButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  onClick?: () => void;
  href?: string;
  isActive?: boolean;
  className?: string;
  buttonClassName?: string;
}

const NavButton = forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  NavButtonProps
>(
  (
    { icon: Icon, text, onClick, href, isActive, className, buttonClassName },
    ref
  ) => {
    const content = (
      <div className="relative px-3 py-2 -mx-3 -my-2">
        <div className="relative flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span>{text}</span>
        </div>
      </div>
    );

    if (href) {
      return (
        <Link
          to={href}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={cn(
            'flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            isActive && 'text-foreground',
            !isActive && 'text-muted-foreground hover:text-foreground',
            className
          )}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        onClick={onClick}
        className={cn(
          'flex items-center gap-1.5 px-2 py-2 rounded-xl text-sm transition-colors cursor-pointer',
          isActive && 'text-foreground',
          !isActive && 'text-muted-foreground hover:text-foreground',
          buttonClassName
        )}
      >
        {content}
      </button>
    );
  }
);

NavButton.displayName = 'NavButton';

export function TopNav() {
  const location = useLocation();
  const { theme, setTheme, toggleAutoTheme } = useTheme();
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
  }>({ left: 0, width: 0 });
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountPos, setAccountPos] = useState({ top: 0, right: 0 });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsPos, setSettingsPos] = useState({ top: 0, right: 0 });
  const [youtubePermission, setYoutubePermission] = useState(
    () => localStorage.getItem('youtube-permission') === 'true'
  );
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const accountBtnRef = useRef<HTMLButtonElement>(null);
  const accountPopupRef = useRef<HTMLDivElement>(null);
  const settingsBtnRef = useRef<HTMLButtonElement>(null);
  const settingsPopupRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isNavHovered, setIsNavHovered] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const activeIndex = NAVIGATION_ITEMS.findIndex(
      (item) => item.href === location.pathname
    );
    if (activeIndex !== -1 && navRefs.current[activeIndex]) {
      const navItem = navRefs.current[activeIndex];
      const parent = navItem.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        const navRect = navItem.getBoundingClientRect();
        const lineCenter = navRect.left - parentRect.left + navRect.width / 2;
        const width = isNavHovered ? 48 : 16;
        setIndicatorStyle({ left: lineCenter - width / 2, width });
      }
    }
  }, [location.pathname, isNavHovered]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        accountBtnRef.current &&
        !accountBtnRef.current.contains(target) &&
        accountPopupRef.current &&
        !accountPopupRef.current.contains(target)
      ) {
        setAccountOpen(false);
      }
    }
    if (accountOpen) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [accountOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        settingsBtnRef.current &&
        !settingsBtnRef.current.contains(target) &&
        settingsPopupRef.current &&
        !settingsPopupRef.current.contains(target)
      ) {
        setSettingsOpen(false);
      }
    }
    if (settingsOpen) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [settingsOpen]);

  const openAccount = () => {
    if (accountBtnRef.current) {
      const rect = accountBtnRef.current.getBoundingClientRect();
      setAccountPos({ top: 64, right: window.innerWidth - rect.right });
    }
    setSettingsOpen(false);
    setAccountOpen((prev) => !prev);
  };

  const openSettings = () => {
    if (settingsBtnRef.current) {
      const rect = settingsBtnRef.current.getBoundingClientRect();
      setSettingsPos({ top: 64, right: window.innerWidth - rect.right });
    }
    setAccountOpen(false);
    setSettingsOpen((prev) => !prev);
  };

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

  const toggleYoutubePermission = () => {
    const newValue = !youtubePermission;
    setYoutubePermission(newValue);
    localStorage.setItem('youtube-permission', String(newValue));
    if (newValue) {
      YouTubeAPI.clearCache();
      window.dispatchEvent(new CustomEvent('youtube-permission-granted'));
    } else {
      window.dispatchEvent(new CustomEvent('youtube-permission-revoked'));
    }
  };

  return (
    <>
      <header
        className={cn(
          'top-nav fixed top-0 left-0 right-0 h-16 z-50 transition-colors',
          scrolled && 'backdrop-blur-md bg-background/80'
        )}
      >
        <div className="flex h-full items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex items-center rounded-xl p-1">
                <img
                  src="/logo-black.svg"
                  alt="veodee logo"
                  className="h-8 w-auto dark:hidden"
                  width="108"
                  height="32"
                />
                <img
                  src="/logo-white.svg"
                  alt="veodee logo"
                  className="h-8 w-auto hidden dark:block"
                  width="108"
                  height="32"
                />
              </div>
            </Link>

            <div
              className="hidden md:flex items-center ml-4 relative"
              onMouseEnter={() => setIsNavHovered(true)}
              onMouseLeave={() => setIsNavHovered(false)}
            >
              {NAVIGATION_ITEMS.map((item, index) => {
                const isActive = location.pathname === item.href;
                return (
                  <NavButton
                    key={item.name}
                    ref={(el) => {
                      navRefs.current[index] = el as HTMLAnchorElement;
                    }}
                    icon={item.icon}
                    text={item.name}
                    href={item.href}
                    isActive={isActive}
                  />
                );
              })}
              <div
                className="absolute bottom-[-4px] h-0.5 bg-foreground rounded-full transition-all duration-300 ease-out"
                style={{
                  left: indicatorStyle.left,
                  width: indicatorStyle.width,
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isOnline && (
              <div className="flex items-center gap-1.5 px-2 py-2 rounded-xl text-sm text-white transition-colors">
                <WifiOff className="h-4 w-4" />
                <span>Offline</span>
              </div>
            )}
            <NavButton
              icon={Settings}
              text="Settings"
              onClick={openSettings}
              isActive={settingsOpen}
              ref={settingsBtnRef}
              buttonClassName={cn(
                settingsOpen
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            />
            <NavButton
              icon={User}
              text="Account"
              onClick={openAccount}
              isActive={accountOpen}
              ref={accountBtnRef}
              buttonClassName={cn(
                accountOpen
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            />
          </div>
        </div>
      </header>

      {settingsOpen &&
        createPortal(
          <div
            ref={settingsPopupRef}
            className="fixed w-56 rounded-lg border border-border bg-card/20 backdrop-blur-md shadow-lg z-[200]"
            style={{ top: settingsPos.top, right: settingsPos.right }}
          >
            <div className="px-4 py-3 border-b border-border">
              <span className="text-sm font-medium text-foreground">
                Settings
              </span>
            </div>
            <div className="py-1">
              <div className="px-3 py-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Theme
                </span>
                <div className="flex items-center gap-1 mt-2">
                  <button
                    onClick={() => setTheme('light')}
                    disabled={theme === 'auto'}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors',
                      theme === 'light'
                        ? 'text-foreground bg-foreground/10'
                        : 'text-muted-foreground hover:text-foreground',
                      theme === 'auto' && 'opacity-50'
                    )}
                  >
                    <Sun className="h-3.5 w-3.5" />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    disabled={theme === 'auto'}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors',
                      theme === 'dark'
                        ? 'text-foreground bg-foreground/10'
                        : 'text-muted-foreground hover:text-foreground',
                      theme === 'auto' && 'opacity-50'
                    )}
                  >
                    <Moon className="h-3.5 w-3.5" />
                    <span>Dark</span>
                  </button>
                </div>
                <button
                  onClick={toggleAutoTheme}
                  className={cn(
                    'w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors mt-1',
                    theme === 'auto'
                      ? 'text-foreground bg-foreground/10'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <SunMoon className="h-3.5 w-3.5" />
                  <span>System</span>
                </button>
              </div>
              <div className="border-t border-border my-1" />
              <button
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                onClick={toggleYoutubePermission}
              >
                <div className="flex items-center gap-2">
                  <Youtube className="h-4 w-4" />
                  <span>Allow YouTube</span>
                </div>
                <div
                  className={cn(
                    'w-8 h-4 rounded-full transition-colors relative flex-shrink-0',
                    youtubePermission
                      ? 'bg-foreground'
                      : 'bg-muted-foreground/30'
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-0.5 w-3 h-3 rounded-full bg-background transition-transform',
                      youtubePermission ? 'translate-x-4' : 'translate-x-0.5'
                    )}
                  />
                </div>
              </button>
            </div>
          </div>,
          document.getElementById('root')!
        )}

      {accountOpen &&
        createPortal(
          <div
            ref={accountPopupRef}
            className="fixed w-56 rounded-lg border border-border bg-card/20 backdrop-blur-md shadow-lg z-[200]"
            style={{ top: accountPos.top, right: accountPos.right }}
          >
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    Guest
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Not signed in
                  </span>
                </div>
              </div>
            </div>
            <div className="py-1">
              <button
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                onClick={() => setAccountOpen(false)}
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                onClick={() => setAccountOpen(false)}
              >
                <UserPlus className="h-4 w-4" />
                Create account
              </button>
            </div>
            <div className="border-t border-border py-1">
              <button
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                onClick={() => setAccountOpen(false)}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>,
          document.getElementById('root')!
        )}
    </>
  );
}
