import { describe, it, expect } from 'vitest';
import { isSquareRatioEnabled, SQUARE_RATIO_STORAGE_KEY } from './player';

const storage = (value: string | null): Pick<Storage, 'getItem'> => ({
  getItem: () => value,
});

describe('isSquareRatioEnabled', () => {
  it('is enabled by default when nothing is stored', () => {
    expect(isSquareRatioEnabled(storage(null))).toBe(true);
  });

  it('stays enabled when explicitly true', () => {
    expect(isSquareRatioEnabled(storage('true'))).toBe(true);
  });

  it('is disabled only when explicitly false', () => {
    expect(isSquareRatioEnabled(storage('false'))).toBe(false);
  });

  it('treats unknown stored values as enabled', () => {
    expect(isSquareRatioEnabled(storage('bogus'))).toBe(true);
  });

  it('reads the force-square-ratio key', () => {
    let readKey: string | null = null;
    isSquareRatioEnabled({
      getItem: (key: string) => {
        readKey = key;
        return null;
      },
    });
    expect(readKey).toBe(SQUARE_RATIO_STORAGE_KEY);
    expect(SQUARE_RATIO_STORAGE_KEY).toBe('force-square-ratio');
  });
});
