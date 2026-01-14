import { goToPage } from './pages.ts'

import { newPageLayout } from './components/page-layout.ts'

import { DOMEditor } from './dom-editor.ts'
import { newPlaylistEditor } from './components/playlist-editor.ts'
import { newVideoPlayer } from './components/video-player.ts'
import { newMenuCollections } from './components/menu-collections.ts'
import { newMenuPlayer } from './components/menu-player.ts'

function main() {
  const pathname = globalThis.document.location.pathname
  const search = globalThis.document.location.search

  globalThis.document.title = 'Narval - Library'

  const app = globalThis.document.getElementById('app')!
  const domEditor = new DOMEditor(app)

  let pageContent = newPlaylistEditor()

  const collectionsButton = newMenuCollections()
  const playerButton = newMenuPlayer()

  if (pathname === '/video') {
    const urlSearchParams = new URLSearchParams(search)
    const id = urlSearchParams.get('v') || ''
    const time = urlSearchParams.get('t') || '0'
    const video = { id: id, time: time }
    pageContent = newVideoPlayer(video)

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

  pageContent.addEventListener('video-click', (event: Event) => {
    const customEvent = event as CustomEvent
    const video = customEvent.detail.video
    let tParam = ''
    if (video.time > 0) {
      tParam = `&t=${video.time}`
    }
    const url = `/video?v=${video.id}` + tParam
    // history.pushState({}, '', url)
    // goToPage('/video')
    const videoPlayer = newVideoPlayer(video)
    globalThis.history.pushState({}, '', url)
    pageContent.replaceWith(videoPlayer)
  })

  collectionsButton.addEventListener('click', (event: PointerEvent) => {
    globalThis.history.pushState({}, '', '/')
    const playlistEditor = newPlaylistEditor()
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
  })

  function playerMenuAction(event: PointerEvent) {
    globalThis.history.pushState({}, '', '/video')
    const videoPlayer = newVideoPlayer({ id: '', time: '' })
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

  playerButton.addEventListener('click', playerMenuAction)

  const pageLayout = newPageLayout(pageContent, collectionsButton, playerButton)

  domEditor.replaceContent(pageLayout)

  // const pathname = globalThis.location.pathname

  // // console.log(pathname)

  // globalThis.addEventListener('popstate', (event: PopStateEvent) => {
  //   goToPage(globalThis.location.pathname)
  // })

  // goToPage(pathname)
}

export { main }
