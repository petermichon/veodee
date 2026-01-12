import { goToPage } from '../pages.ts'
import { newAddVideoButton } from './addVideoButton.ts'
import { newImportButton } from './importButton.ts'
import { newVideoCardElement } from './video-card.ts'

type Video = { id: string; time: string }

function newLibraryElement(): HTMLElement {
  const libElem = document.createElement('div')
  libElem.className = 'flex flex-row w-full'

  {
    const panel = document.createElement('div')
    panel.className =
      'w-53.5 flex flex-col gap-10 flex-shrink-0 overflow-y-auto h-screen py-4 p-2 text-white font-bold rounded-lg bg-neutral-950 text-sm scrollbar-dark'
    // 'grid grid-rows-[auto_1fr_auto] overflow-y-auto'
    {
      const importButton = newImportButton()
      panel.appendChild(importButton)
    }
    libElem.appendChild(panel)

    {
      const videosManager = document.createElement('div')
      videosManager.className = 'flex flex-col h-screen'

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
      const videos: Video[] = JSON.parse(localVideos)

      {
        const videoFeed = document.createElement('div')
        videoFeed.className =
          // 'sm:p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-0 sm:gap-3 bg-white text-black dark:bg-neutral-900 dark:text-white'
          // 'grid grid-flow-row auto-cols-max gap-2 overflow-x-auto p-2'
          'bg-neutral-950 p-2 grid grid-flow-row grid-cols-3 auto-rows-max gap-2 overflow-x-auto overflow-auto max-h-screen w-full scrollbar-dark'
        videosManager.appendChild(videoFeed)

        {
          for (const video of videos) {
            const videoCard = newVideoCardElement(video)
            videoFeed.appendChild(videoCard)

            videoCard.addEventListener('click', (event: PointerEvent) => {
              if (event.button === 0) {
                event.preventDefault()
              }

              let tParam = ''
              if (video.time !== '0') {
                tParam = `&t=${video.time}`
              }

              const url = `/video?v=${video.id}` + tParam

              history.pushState({}, '', url)
              goToPage('/video')
            })
          }
        }
      }

      libElem.appendChild(videosManager)
    }
  }

  return libElem
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

export { newLibraryElement }
