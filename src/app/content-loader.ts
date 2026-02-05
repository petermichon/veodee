import { addVideo } from './add-video.ts'

import { newPlaylistEditor } from './components/playlist-editor.ts'
import { newVideoPlayer } from './components/video-player.ts'
import { newVideoCardElement } from './components/video-card.ts'
import { newInput } from './components/import-input.ts'
import { newFooter } from './components/footer.ts'
import { newYoutubeEmbed } from './components/youtube-embed.ts'
import { newVideoHeader } from './components/video-header.ts'
import { newDefaultButton } from './components/default-button.ts'

export class ContentLoader {
  private content: HTMLElement
  private collectionButton: HTMLElement
  private playerButton: HTMLElement

  public constructor(
    content: HTMLElement,
    collectionButton: HTMLElement,
    playerButton: HTMLElement
  ) {
    this.content = content
    this.collectionButton = collectionButton
    this.playerButton = playerButton
  }

  public loadPlayerPage() {
    const search = globalThis.document.location.search
    const urlSearchParams = new URLSearchParams(search)
    const id = urlSearchParams.get('v') || ''
    const time = urlSearchParams.get('t') || '0'
    const video = { id: id, time: time }
    // pageContent = newVideoPlayer(video)

    const videoElement = document.createElement('div')
    videoElement.className = 'w-full aspect-video lg:aspect-[2.15/1] bg-black'
    if (video.id !== '') {
      const embed = newYoutubeEmbed(video)
      // Use replaceWith instead
      videoElement.replaceChildren(embed)
    }

    const videoHeader = newVideoHeader(video.id)
    // const shareButton = newShareButton()
    const shareButton = newDefaultButton()
    {
      shareButton.textContent = 'Share'
      shareButton.addEventListener('click', () => {
        const url = globalThis.document.location.href
        navigator.clipboard
          .writeText(url)
          // .then(() => {})
          .catch((err) => {
            console.error('Clipboard copy failed:', err)
          })
      })
    }
    // const fullscreenButton = newFullscreenButton()
    const fullscreenButton = newDefaultButton()
    {
      fullscreenButton.textContent = 'Fullscreen'
      fullscreenButton.addEventListener('click', (event: Event) => {
        if (document.fullscreenElement) {
          document.exitFullscreen()
        } else {
          document.documentElement.requestFullscreen({
            navigationUI: 'hide',
          })
          // videoElement.requestFullscreen()
          // document.documentElement.requestFullscreen()
        }
      })
    }
    const footer = newFooter()

    const videoPlayer = newVideoPlayer(
      video,
      shareButton,
      footer,
      videoHeader,
      fullscreenButton,
      videoElement
    )
    this.content.replaceWith(videoPlayer)
    this.content = videoPlayer // Update reference

    // ---
    this.playerButton.classList.remove('bg-neutral-950')
    this.playerButton.classList.add('bg-neutral-800')
    this.playerButton.classList.remove('hover:bg-neutral-800')
    this.playerButton.classList.add('hover:bg-neutral-700')
    this.playerButton.classList.remove('active:bg-neutral-700')
    this.playerButton.classList.add('active:bg-neutral-600')
    // playerButton.classList.add('font-semibold')

    this.collectionButton.classList.remove('bg-neutral-800')
    this.collectionButton.classList.add('bg-neutral-950')
    this.collectionButton.classList.remove('hover:bg-neutral-700')
    this.collectionButton.classList.add('hover:bg-neutral-800')
    this.collectionButton.classList.remove('active:bg-neutral-600')
    this.collectionButton.classList.add('active:bg-neutral-700')
    // collectionsButton.classList.remove('font-semibold')
    // ---
  }

  public loadCollectionPage() {
    globalThis.document.title = 'Veodee'

    // ---
    const localVideos = localStorage.getItem('videos') || '[]'
    let videos: { id: string; time: string }[] = []
    try {
      videos = JSON.parse(localVideos)
    } catch (e) {
      // ...
    }
    // ---

    // ---
    const videoFeedContainer = document.createElement('div')
    videoFeedContainer.className = 'flex justify-center bg-neutral-950'
    {
      const videoFeed = document.createElement('div')
      videoFeed.className =
        'grid grid-flow-row sm:p-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 bg-neutral-950 grid-auto-rows w-fit' // max-h-screen auto-rows-max
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

            // const videoPlayer = newVideoPlayer(video, shareButton)

            const url = `/video?v=${video.id}`
            globalThis.history.pushState({}, '', url)
            this.loadPlayerPage()
          })

          videoFeed.appendChild(videoCard)
        }
      }
      videoFeedContainer.appendChild(videoFeed)
      // ---
    }
    const actions = document.createElement('div')
    actions.className =
      'flex flex-row gap-2 text-sm font-bold pt-4 py-2 px-2 bg-neutral-950' // overflow-x-scroll scrollbar-none
    {
      const addButton = newDefaultButton()
      addButton.textContent = 'Add video'

      addButton.addEventListener('click', () => {
        const videoId = prompt('Enter YouTube video ID')
        if (videoId) {
          addVideo({ id: videoId, time: '0' })
        }
      })
      actions.appendChild(addButton)
    }
    {
      const importButton = newDefaultButton()
      importButton.textContent = 'Import'
      {
        const input = newInput()
        importButton.addEventListener('click', () => {
          input.click()
        })
        importButton.appendChild(input)
      }
      actions.appendChild(importButton)
    }
    {
      const playlistEditor = newPlaylistEditor(actions, videoFeedContainer)
      this.content.replaceWith(playlistEditor)
      this.content = playlistEditor // Update reference
      // collectionsButton.classList.remove('')
      // collectionsButton.classList.add('bg-red')

      // 950 #0a0a0a
      // 800 #262626
      // 700 #404040
      // 600 #525252
      // ---
      // collectionsButton.style.background = '#0a0a0a'
      // collectionsButton.style.background = '#262626'
      // collectionsButton.addEventListener('mouseenter', (e: MouseEvent) => {
      //   // collectionsButton.style.background = '#404040'
      // })
      // collectionsButton.addEventListener('mouseleave', (e: MouseEvent) => {
      //   // collectionsButton.style.background = '#262626'
      // })
      // collectionsButton.addEventListener('mousedown', (e: MouseEvent) => {
      //   collectionsButton.style.background = '#525252'
      // })
      // // collectionsButton.addEventListener('mouseup', (e: MouseEvent) => {
      // globalThis.addEventListener('mouseup', (e: MouseEvent) => {
      //   collectionsButton.style.background = '#404040'
      // })

      this.collectionButton.classList.remove('bg-neutral-950')
      this.collectionButton.classList.add('bg-neutral-800')
      this.collectionButton.classList.remove('hover:bg-neutral-800')
      this.collectionButton.classList.add('hover:bg-neutral-700')
      this.collectionButton.classList.remove('active:bg-neutral-700')
      this.collectionButton.classList.add('active:bg-neutral-600')
      // collectionsButton.classList.add('font-semibold')

      this.playerButton.classList.remove('bg-neutral-800')
      this.playerButton.classList.add('bg-neutral-950')
      this.playerButton.classList.remove('hover:bg-neutral-700')
      this.playerButton.classList.add('hover:bg-neutral-800')
      this.playerButton.classList.remove('active:bg-neutral-600')
      this.playerButton.classList.add('active:bg-neutral-700')
      // playerButton.classList.remove('font-semibold')
      // ---
    }
  }
}
