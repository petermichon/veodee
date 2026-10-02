import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

/**
 * Accessible segmented selector. Renders as a radiogroup with roving focus and
 * derives the active-option indicator from measured button positions, so any
 * number of options works without hardcoded indices.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: SegmentedControlProps<T>) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );

  useEffect(() => {
    const button = buttonRefs.current[activeIndex];
    const parent = button?.parentElement;
    if (!button || !parent) return;

    const parentRect = parent.getBoundingClientRect();
    if (parentRect.width === 0) return;

    const buttonRect = button.getBoundingClientRect();
    const center = buttonRect.left - parentRect.left + buttonRect.width / 2;
    setIndicator({ left: center - 8, width: 16 });
  }, [activeIndex, options]);

  const move = (delta: number) => {
    const next = (activeIndex + delta + options.length) % options.length;
    onChange(options[next].value);
    buttonRefs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="flex flex-nowrap items-center gap-1.5 relative"
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          event.preventDefault();
          move(1);
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          event.preventDefault();
          move(-1);
        }
      }}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(element) => {
              buttonRefs.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onMouseEnter={(event) => {
              if (!selected) {
                event.currentTarget.style.color = 'hsl(var(--foreground))';
              }
            }}
            onMouseLeave={(event) => {
              if (!selected) {
                event.currentTarget.style.color =
                  'hsl(var(--muted-foreground))';
              }
            }}
            className="flex items-center gap-2 px-3 py-2 sm:px-4 rounded-lg text-sm font-medium transition-all duration-200 border-none cursor-pointer"
            style={{
              color: selected ? 'white' : 'hsl(var(--muted-foreground))',
            }}
          >
            {option.icon}
            <span className="text-sm">{option.label}</span>
          </button>
        );
      })}

      {indicator.width > 0 && (
        <div
          className="absolute bottom-[-4px] h-0.5 rounded-full transition-all duration-300 ease-out"
          style={{
            left: indicator.left,
            width: indicator.width,
            backgroundColor: 'white',
          }}
        />
      )}
    </div>
  );
}
