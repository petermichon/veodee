import { newAddVideoButton } from './addVideoButton.ts'

type Video = { id: string; time: string }

export function newPlaylistEditor(videoFeed: HTMLElement): HTMLElement {
  const videosManager = document.createElement('div')
  videosManager.className =
    'flex flex-col w-full overflow-y-scroll scrollbar-dark' // max-h-screen

  {
    const actions = document.createElement('div')
    actions.className =
      'flex flex-row text-sm text-white font-bold p-4 bg-neutral-950'
    {
      const addVideoButton = newAddVideoButton()
      actions.appendChild(addVideoButton)
    }
    videosManager.appendChild(actions)
  }

  {
    videosManager.appendChild(videoFeed)
  }

  {
    const footer = document.createElement('div')
    footer.className = 'h-full bg-neutral-950'
    videosManager.appendChild(footer)
  }

  return videosManager
}

function newRemoveAllButton(): HTMLElement {
  const button = document.createElement('button')
  button.className =
    'text-white font-bold px-4 py-1 rounded-3xl bg-neutral-800 hover:bg-neutral-700 cursor-pointer'
  button.style.fontFamily = "'Roboto', sans-serif"
  button.textContent = 'Clear videos'
  button.addEventListener('click', () => {
    const answer = confirm('Delete all videos ?')
    if (answer) {
      localStorage.clear()
    }
  })
  return button
}
