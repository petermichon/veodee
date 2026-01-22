import { newFullscreenButton } from './fullscreenButton.ts'
import { newVideoHeader } from './video-header.ts'
import { newYoutubeEmbed } from './youtube-embed.ts'

type Video = { id: string; time: string }

export function newVideoPlayer(
  video: Video,
  shareButton: HTMLButtonElement,
  footer: HTMLDivElement
): HTMLDivElement {
  let url = `/video?v=${video.id}`
  if (video.time !== '0') {
    url += `&t=${video.time}`
  }

  const page = globalThis.document.createElement('div')
  page.className = 'flex flex-col w-full overflow-y-scroll scrollbar-dark'

  {
    const topBar = document.createElement('div')
    topBar.className = 'h-full bg-neutral-950' // h-41
    const videoElement = document.createElement('div')
    videoElement.className = 'w-full aspect-video lg:aspect-[2.15/1] bg-black '

    topBar.addEventListener('logo-click', (event: Event) => {
      history.pushState({}, '', `/`)
      // document.title = 'Narval'
      // goToPage('/')
    })

    page.appendChild(topBar)
    page.appendChild(videoElement)

    {
      const wrapper = document.createElement('div')
      wrapper.className = 'flex flex-row flex-wrap gap-3 pt-3 bg-neutral-950' // w-fit
      {
        const videoHeader = newVideoHeader(video.id)
        videoHeader.addEventListener('video-loaded', (event: Event) => {
          const customEvent = event as CustomEvent
          const video: { title: string } = customEvent.detail.video
          document.title = video.title
        })
        wrapper.appendChild(videoHeader)

        // wrapper.appendChild(fullscreenButton)
      }
      {
        const actionsMenu = document.createElement('div')
        actionsMenu.className =
          'flex flex-grow items-center overflow-x-scroll scrollbar-dark h-fit scrollbar-invisible'
        // 'flex flex-row items-center justify-end w-full'
        actionsMenu.appendChild(shareButton)
        wrapper.appendChild(actionsMenu)
      }
      {
        const fullscreenButton = newFullscreenButton()
        fullscreenButton.addEventListener(
          'fullscreen-click',
          (event: Event) => {
            if (document.fullscreenElement) {
              document.exitFullscreen()
            } else {
              document.documentElement.requestFullscreen({
                navigationUI: 'hide',
              })
              // videoElement.requestFullscreen()
              // document.documentElement.requestFullscreen()
            }
          }
        )
      }
      page.appendChild(wrapper)
    }

    page.appendChild(footer)

    if (video.id !== '') {
      const embed = newYoutubeEmbed(video)
      videoElement.replaceWith(embed)
    }
    // videoElement.replaceWith(embed)
  }

  return page
}
