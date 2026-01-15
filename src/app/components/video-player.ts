import { goToPage } from '../pages.ts'
import { newFooter } from './footer.ts'
import { newFullscreenButton } from './fullscreenButton.ts'
import { newShareButton } from './share-button.ts'
import { newVideoHeader } from './video-header.ts'
import { newYoutubeEmbed } from './youtube-embed.ts'

type Video = { id: string; time: string }

export function newVideoPlayer(video: Video): HTMLElement {
  const global = {
    url: globalThis.document.location.href,
  }

  let url = `/video?v=${video.id}`
  if (video.time != '0') {
    url += `&t=${video.time}`
  }

  const page = globalThis.document.createElement('div')
  page.className = 'flex flex-col w-full overflow-y-scroll scrollbar-dark'

  {
    const topBar = document.createElement('div')
    topBar.className = 'h-full bg-neutral-950' // h-41
    const videoElement = document.createElement('div')
    videoElement.className =
      'w-full aspect-video lg:aspect-[2.15/1] bg-neutral-800 rounded-md'
    const videoHeader = newVideoHeader(video.id)
    const shareButton = newShareButton(global.url)
    const fullscreenButton = newFullscreenButton()
    const footer = newFooter()

    topBar.addEventListener('logo-click', (event: Event) => {
      history.pushState({}, '', `/`)
      // document.title = 'Narval'
      goToPage('/')
    })

    videoHeader.addEventListener('video-loaded', (event: Event) => {
      const customEvent = event as CustomEvent
      const video: { title: string } = customEvent.detail.video
      document.title = video.title
    })

    fullscreenButton.addEventListener('fullscreen-click', (event: Event) => {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        document.documentElement.requestFullscreen({ navigationUI: 'hide' })
        // videoElement.requestFullscreen()
        // document.documentElement.requestFullscreen()
      }
    })

    const shareButtonWrapper = document.createElement('div')
    shareButtonWrapper.className = 'text-white p-4 flex-1 min-w-[200px]'
    shareButtonWrapper.appendChild(shareButton)

    const wrapper = document.createElement('div')
    wrapper.className = 'flex flex-wrap bg-neutral-950'
    wrapper.appendChild(videoHeader)
    wrapper.appendChild(shareButtonWrapper)
    // wrapper.appendChild(fullscreenButton)

    page.appendChild(topBar)
    page.appendChild(videoElement)
    page.appendChild(wrapper)
    page.appendChild(footer)

    if (video.id !== '') {
      const embed = newYoutubeEmbed(video)
      videoElement.replaceWith(embed)
    }
  }

  return page
}
