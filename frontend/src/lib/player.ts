// YouTube Required Minimum Functionality: an embedded player's viewport must be
// at least 200x200 CSS px (16:9 recommended at least 480x270).
// https://developers.google.com/youtube/terms/required-minimum-functionality
export const PLAYER_MIN_SIZE_PX = 200;

export const SQUARE_RATIO_STORAGE_KEY = 'force-square-ratio';

// Square Ratio is enabled by default; users who explicitly turn it off keep it
// off. Only an explicit "false" disables it.
export function isSquareRatioEnabled(
  storage: Pick<Storage, 'getItem'> = localStorage
): boolean {
  return storage.getItem(SQUARE_RATIO_STORAGE_KEY) !== 'false';
}
