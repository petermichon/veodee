import { newAddVideoButton } from './addVideoButton.ts'
import { newVideoCardElement } from './video-card.ts'

type Video = { id: string; time: string }

export function newPlaylistEditor(): HTMLElement {
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

  const localVideos = localStorage.getItem('videos') || '[]'
  let videos: Video[] = []
  try {
    videos = JSON.parse(localVideos)
  } catch (e) {
    // ...
  }

  {
    const videoFeed = document.createElement('div')
    videoFeed.className =
      'p-2 grid grid-flow-row grid-cols-4 gap-2 w-full bg-neutral-950' // max-h-screen auto-rows-max
    videosManager.appendChild(videoFeed)

    {
      for (const video of videos) {
        const videoCard = newVideoCardElement(video)

        videoCard.addEventListener('click', (event: PointerEvent) => {
          event.preventDefault()
          const customEvent = new CustomEvent('video-click', {
            detail: { video: video },
          })
          videosManager.dispatchEvent(customEvent)
        })

        videoFeed.appendChild(videoCard)
      }
    }

    {
      const footer = document.createElement('div')
      footer.className = 'h-full bg-neutral-950'
      videosManager.appendChild(footer)
    }
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
