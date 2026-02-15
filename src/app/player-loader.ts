import { newVideoPlayer } from './components/video-player.ts'
import { newFooter } from './components/footer.ts'
import { newYoutubeEmbed } from './components/youtube-embed.ts'
import { newDefaultButton } from './components/default-button.ts'

export class PlayerLoader {
  private video: { id: string; time: string }
  private videoHeader: HTMLElement
  private videoPlayerElem: DocumentFragment

  constructor(
    video: { id: string; time: string },
    videoHeader: HTMLElement,
    videoPlayerElem: DocumentFragment
  ) {
    this.video = video
    this.videoHeader = videoHeader
    this.videoPlayerElem = videoPlayerElem
  }

  public newContentVideoPlayer() {
    const videoElement = document.createElement('div')
    videoElement.className = 'w-full aspect-video lg:aspect-[2.15/1] bg-black'

    if (this.video.id !== '') {
      const embed = newYoutubeEmbed(this.video)
      // Use replaceWith instead ?
      videoElement.replaceChildren(embed)
    }

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

    // ---
    const footer = newFooter()
    const videoPlayer = newVideoPlayer(
      shareButton,
      footer,
      this.videoHeader,
      fullscreenButton,
      videoElement
    )

    this.videoPlayerElem.replaceChildren(videoPlayer)
  }
}
