type Video = { id: string; time: string }

export function newVideoPlayer(
  video: Video,
  shareButton: HTMLButtonElement,
  footer: HTMLDivElement,
  videoHeader: HTMLElement,
  fullscreenButton: HTMLButtonElement,
  videoElement: HTMLElement
): HTMLDivElement {
  // let url = `/video?v=${video.id}`
  // if (video.time !== '0') {
  //   url += `&t=${video.time}`
  // }

  const page = globalThis.document.createElement('div')
  page.className =
    'flex flex-col w-full overflow-y-scroll scrollbar-neutral-400'

  {
    const topBar = document.createElement('div')
    topBar.className = 'h-full bg-neutral-950' // h-41
    // const videoElement = document.createElement('div')
    // videoElement.className = 'w-full aspect-video lg:aspect-[2.15/1] bg-black'

    // topBar.addEventListener('logo-click', (event: Event) => {
    //   history.pushState({}, '', `/`)
    //   // document.title = 'Narval'
    //   // goToPage('/')
    // })

    page.appendChild(topBar)
    page.appendChild(videoElement)

    {
      const wrapper = document.createElement('div')
      wrapper.className = 'flex flex-row flex-wrap gap-3 pt-3 bg-neutral-950' // w-fit
      {
        wrapper.appendChild(videoHeader)
      }
      {
        const actionsMenu = document.createElement('div')
        actionsMenu.className =
          'flex flex-grow gap-2 items-center overflow-x-scroll scrollbar-neutral-400 h-fit scrollbar-none'
        // 'flex flex-row items-center justify-end w-full'

        actionsMenu.appendChild(shareButton)

        actionsMenu.appendChild(fullscreenButton)

        wrapper.appendChild(actionsMenu)
      }
      page.appendChild(wrapper)
    }

    page.appendChild(footer)

    if (video.id !== '') {
      // const embed = newYoutubeEmbed(video)
      // videoElement.replaceWith(embed)
    }
    // videoElement.replaceWith(embed)
  }

  return page
}
