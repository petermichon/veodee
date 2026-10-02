import { useCallback, useEffect, useState } from 'react';
import { loadPlayerSettings, savePlayerSettings } from '@/lib/player';
import type { PlayerSettings } from '@/lib/player';

/**
 * Single source of truth for player preferences. Loads (and migrates) once,
 * persists on every change, and exposes a shallow patch updater.
 */
export function usePlayerSettings() {
  const [settings, setSettings] = useState<PlayerSettings>(() =>
    loadPlayerSettings()
  );

  useEffect(() => {
    savePlayerSettings(localStorage, settings);
  }, [settings]);

  const update = useCallback((patch: Partial<PlayerSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  return { settings, update } as const;
}
