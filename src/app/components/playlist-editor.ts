export function newPlaylistEditor(
  actions: HTMLDivElement,
  videoFeed: HTMLElement
): DocumentFragment {
  const videosManager = document.createDocumentFragment()
  // videosManager.className =
  //   'h-screen flex flex-col w-full overflow-y-scroll scrollbar-neutral-400' // max-h-screen

  videosManager.appendChild(actions)

  videosManager.appendChild(videoFeed)

  const footer = document.createElement('div')
  footer.className = 'h-full bg-neutral-950'
  videosManager.appendChild(footer)

  return videosManager
}

function newRemoveAllButton(): HTMLElement {
  const button = document.createElement('button')
  button.className =
    'font-bold px-4 py-1 rounded-3xl bg-neutral-800 hover:bg-neutral-700 cursor-pointer'
  // button.style.fontFamily = "'Roboto', sans-serif"
  button.textContent = 'Clear videos'
  button.addEventListener('click', () => {
    const answer = confirm('Delete all videos ?')
    if (answer) {
      localStorage.clear()
    }
  })
  return button
}
