import { newPageLayout } from './components/page-layout.ts'
import { newVideoPlayer } from './components/video-player.ts'

import { DOMEditor } from './dom-editor.ts'

const app = globalThis.document.getElementById('app')!
const domEditor = new DOMEditor(app)

function goToPage(pathname: string) {
  function root() {
    globalThis.document.title = 'Narval - Library'
    // const e = newPageLayout()
    // domEditor.replaceContent(e)
  }

  function video() {
    // document.title = 'Narval - Video'
    const urlparameters = new URLSearchParams(globalThis.location.search)
    const id = urlparameters.get('v') || ''
    const time = urlparameters.get('t') || '0'
    const video = { id: id, time: time }
    const page = newVideoPlayer(video)
    domEditor.replaceContent(page)
  }

  function watch() {
    // Redirect to /video
    const params = new URLSearchParams(globalThis.location.search)
    let url = `/video`
    if (params.size > 0) {
      url += `?${params.toString()}`
    }
    // history.pushState({}, '', url)
    globalThis.history.replaceState({}, '', url)
    goToPage('/video')
  }

  const pages = new Map<string, () => void>()
  pages.set('/', root)
  pages.set('/video', video)
  pages.set('/watch', watch)

  const handler = pages.get(pathname)

  if (!handler) {
    return
  }

  handler()
}

export { goToPage }
