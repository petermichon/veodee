import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

export interface Subscription {
  channelId: string;
  channelName: string;
  channelUrl: string;
}

const STORAGE_KEY = 'subscriptions';
const STORAGE_VERSION = 1;

interface SubscriptionsContextType {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
  removeSubscription: (channelId: string) => void;
  updateSubscription: (channelId: string, subscription: Subscription) => void;
}

const SubscriptionsContext = createContext<
  SubscriptionsContextType | undefined
>(undefined);

const initializeDefaultStorage = (): Subscription[] => {
  const defaultSubscriptions: Subscription[] = [];

  const storage = {
    version: STORAGE_VERSION,
    subscriptions: defaultSubscriptions,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  return defaultSubscriptions;
};

export function SubscriptionsProvider({ children }: { children: ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.version === STORAGE_VERSION) {
          return parsed.subscriptions;
        }
        return initializeDefaultStorage();
      } catch {
        return initializeDefaultStorage();
      }
    }
    return initializeDefaultStorage();
  });

  const addSubscription = useCallback(
    (subscriptionData: Subscription) => {
      const updatedSubscriptions = [...subscriptions, subscriptionData];
      setSubscriptions(updatedSubscriptions);
      const storage = {
        version: STORAGE_VERSION,
        subscriptions: updatedSubscriptions,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
    },
    [subscriptions]
  );

  const removeSubscription = useCallback(
    (channelId: string) => {
      const updatedSubscriptions = subscriptions.filter(
        (s) => s.channelId !== channelId
      );
      setSubscriptions(updatedSubscriptions);
      const storage = {
        version: STORAGE_VERSION,
        subscriptions: updatedSubscriptions,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
    },
    [subscriptions]
  );

  const updateSubscription = useCallback(
    (channelId: string, subscription: Subscription) => {
      const updatedSubscriptions = subscriptions.map((s) =>
        s.channelId === channelId ? subscription : s
      );
      setSubscriptions(updatedSubscriptions);
      const storage = {
        version: STORAGE_VERSION,
        subscriptions: updatedSubscriptions,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
    },
    [subscriptions]
  );

  return (
    <SubscriptionsContext.Provider
      value={{
        subscriptions,
        addSubscription,
        removeSubscription,
        updateSubscription,
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionsContext);
  if (context === undefined) {
    throw new Error(
      'useSubscriptions must be used within a SubscriptionsProvider'
    );
  }
  return context;
}
