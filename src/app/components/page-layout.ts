export function newPageLayout(
  pageContent: HTMLDivElement,
  panel: HTMLElement
): HTMLElement {
  const playlistElem = document.createElement('div')
  playlistElem.className = 'flex flex-row h-screen text-neutral-100 font-medium' // font-[sans-serif]
  // playlistElem.style =
  //   "font-family: 'Roboto', sans-serif font-variant-numeric: tabular-nums;"
  playlistElem.style.fontFamily = 'sans-serif' // system-ui sans-serif monospace
  // playlistElem.style.fontVariantNumeric = 'tabular-nums' // tabular-nums proportional-nums
  // playlistElem.style.lineHeight = '1.0'
  // playlistElem.style.verticalAlign = 'middle'
  // playlistElem.style.fontVariantCaps = 'all-small-caps'

  playlistElem.appendChild(panel)

  playlistElem.appendChild(pageContent)

  return playlistElem
}
