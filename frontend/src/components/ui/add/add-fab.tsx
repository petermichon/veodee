import { Plus } from 'lucide-react';
import { openAddDialog, useShowAdd } from '@/components/ui/add/open-add';

/**
 * Floating add action, bottom-right above the tab bar. Dispatches the
 * open-add-dialog event; the current page decides what to add.
 */
export function AddFab() {
  const show = useShowAdd();
  if (!show) return null;

  return (
    <button
      onClick={openAddDialog}
      aria-label="Add"
      className="md:hidden fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card/80 dark:bg-neutral-950/80 backdrop-blur-lg text-foreground shadow-lg transition-transform active:scale-95 select-none-touch"
    >
      <Plus className="h-6 w-6" />
    </button>
  );
}
