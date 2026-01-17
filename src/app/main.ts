import { newPageLayout } from './components/page-layout.ts'
import { newPlaylistEditor } from './components/playlist-editor.ts'
import { newVideoPlayer } from './components/video-player.ts'
import { newMenuCollections } from './components/menu-collections.ts'
import { newMenuPlayer } from './components/menu-player.ts'
import { newVideoCardElement } from './components/video-card.ts'

import { DOMEditor } from './dom-editor.ts'

type Video = { id: string; time: string }

function main() {
  globalThis.document.title = 'Narval - Library'

  const app = globalThis.document.getElementById('app')!
  const domEditor = new DOMEditor(app)

  let pageContent: HTMLElement = document.createElement('div')
  // let pageContent = newPlaylistEditor()

  const collectionsButton = newMenuCollections()
  const playerButton = newMenuPlayer()

  collectionsButton.addEventListener('click', (event: PointerEvent) => {
    globalThis.history.pushState({}, '', '/')
    updatePageContent()
  })

  function playerMenuAction(event: PointerEvent) {
    globalThis.history.pushState({}, '', '/video?v=')
    updatePageContent()
  }

  playerButton.addEventListener('click', playerMenuAction)

  const pageLayout = newPageLayout(pageContent, collectionsButton, playerButton)

  domEditor.replaceContent(pageLayout)

  globalThis.addEventListener('popstate', (event: PopStateEvent) => {
    updatePageContent()
    // goToPage(globalThis.location.pathname)
  })

  function updatePageContent() {
    const pathname = globalThis.document.location.pathname
    const search = globalThis.document.location.search

    if (pathname === '/') {
      // ---
      const localVideos = localStorage.getItem('videos') || '[]'
      let videos: Video[] = []
      try {
        videos = JSON.parse(localVideos)
      } catch (e) {
        // ...
      }
      // ---

      // ---
      const videoFeed = document.createElement('div')
      videoFeed.className =
        'p-2 grid grid-flow-row grid-cols-4 gap-2 w-full bg-neutral-950' // max-h-screen auto-rows-max
      {
        for (const video of videos) {
          const videoCard = newVideoCardElement(video)

          videoCard.addEventListener('click', (event: Event) => {
            event.preventDefault()
            // const video = customEvent.detail.video
            // let tParam = ''
            // if (video.time > 0) {
            //   tParam = `&t=${video.time}`
            // }
            // const url = `/video?v=${video.id}` + tParam
            // history.pushState({}, '', url)
            // goToPage('/video')

            const videoPlayer = newVideoPlayer(video)

            const url = `/video?v=${video.id}`
            globalThis.history.pushState({}, '', url)
            // pageContent.replaceWith(videoPlayer)
            // pageContent = videoPlayer
            updatePageContent()
          })

          videoFeed.appendChild(videoCard)
        }
      }
      // ---

      const playlistEditor = newPlaylistEditor(videoFeed)
      pageContent.replaceWith(playlistEditor)
      pageContent = playlistEditor // Update reference
      // collectionsButton.classList.remove('')
      // collectionsButton.classList.add('bg-red')

      collectionsButton.classList.remove('bg-neutral-950')
      collectionsButton.classList.remove('hover:bg-neutral-800')
      collectionsButton.classList.remove('active:bg-neutral-700')
      collectionsButton.classList.add('bg-neutral-800')
      collectionsButton.classList.add('hover:bg-neutral-700')
      collectionsButton.classList.add('active:bg-neutral-600')

      playerButton.classList.remove('bg-neutral-800')
      playerButton.classList.remove('hover:bg-neutral-700')
      playerButton.classList.remove('active:bg-neutral-600')
      playerButton.classList.add('bg-neutral-950')
      playerButton.classList.add('hover:bg-neutral-800')
      playerButton.classList.add('active:bg-neutral-700')
    }

    if (pathname === '/video') {
      const urlSearchParams = new URLSearchParams(search)
      const id = urlSearchParams.get('v') || ''
      const time = urlSearchParams.get('t') || '0'
      const video = { id: id, time: time }
      // pageContent = newVideoPlayer(video)
      const videoPlayer = newVideoPlayer(video)
      pageContent.replaceWith(videoPlayer)
      pageContent = videoPlayer // Update reference

      playerButton.classList.remove('bg-neutral-950')
      playerButton.classList.remove('hover:bg-neutral-800')
      playerButton.classList.remove('active:bg-neutral-700')
      playerButton.classList.add('bg-neutral-800')
      playerButton.classList.add('hover:bg-neutral-700')
      playerButton.classList.add('active:bg-neutral-600')

      collectionsButton.classList.remove('bg-neutral-800')
      collectionsButton.classList.remove('hover:bg-neutral-700')
      collectionsButton.classList.remove('active:bg-neutral-600')
      collectionsButton.classList.add('bg-neutral-950')
      collectionsButton.classList.add('hover:bg-neutral-800')
      collectionsButton.classList.add('active:bg-neutral-700')
    }
  }

  updatePageContent()
}

export { main }
