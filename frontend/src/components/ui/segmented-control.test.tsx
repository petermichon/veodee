import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SegmentedControl } from './segmented-control';

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma' },
] as const;

describe('SegmentedControl', () => {
  it('exposes a labelled radiogroup with the selected option checked', () => {
    render(
      <SegmentedControl
        options={options}
        value="b"
        onChange={() => {}}
        ariaLabel="Letters"
      />
    );

    expect(
      screen.getByRole('radiogroup', { name: 'Letters' })
    ).toBeInTheDocument();
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
    expect(radios[1]).toHaveAttribute('aria-checked', 'true');
    expect(radios[2]).toHaveAttribute('aria-checked', 'false');
  });

  it('reports the clicked option', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <SegmentedControl
        options={options}
        value="a"
        onChange={onChange}
        ariaLabel="Letters"
      />
    );

    await user.click(screen.getByRole('radio', { name: 'Gamma' }));
    expect(onChange).toHaveBeenCalledWith('c');
  });

  it('moves selection with arrow keys and wraps around', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <SegmentedControl
        options={options}
        value="c"
        onChange={onChange}
        ariaLabel="Letters"
      />
    );

    screen.getAllByRole('radio')[2].focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('a');

    await user.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenLastCalledWith('b');
  });
});
