export function newPageLayout(
  pageContent: HTMLDivElement,
  panel: HTMLElement
): HTMLElement {
  const playlistElem = document.createElement('div')
  playlistElem.className = 'flex flex-row h-screen text-neutral-100'

  playlistElem.appendChild(panel)

  playlistElem.appendChild(pageContent)

  return playlistElem
}
