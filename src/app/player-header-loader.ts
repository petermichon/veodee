export class PlayerHeaderLoader {
  private video: { id: string; time: string }
  private videoHeaderTitle: HTMLElement
  private videoHeaderAuthorText: HTMLElement
  private videoHeaderAuthor: HTMLAnchorElement

  constructor(
    video: { id: string; time: string },
    videoHeaderAuthor: HTMLAnchorElement,
    videoHeaderAuthorText: HTMLElement,
    videoHeaderTitle: HTMLElement
  ) {
    this.video = video
    this.videoHeaderAuthor = videoHeaderAuthor
    this.videoHeaderAuthorText = videoHeaderAuthorText
    this.videoHeaderTitle = videoHeaderTitle
  }

  public load() {
    const search = globalThis.document.location.search
    const urlSearchParams = new URLSearchParams(search)
    const id = urlSearchParams.get('v') || ''
    const time = urlSearchParams.get('t') || '0'
    this.video.id = id
    this.video.time = time
    // ---

    this.videoHeaderTitle.textContent = ''
    this.videoHeaderAuthorText.textContent = ''
    this.videoHeaderAuthor.href = ''
    globalThis.document.title = ''

    if (this.video.id !== '') {
      const videoUrl = `https://www.youtube.com/watch?v=${this.video.id}`
      const oembedUrl = `https://www.youtube.com/oembed?url=${videoUrl}&format=json`

      fetch(oembedUrl).then((response) => {
        if (!response.ok) {
          return
        }

        type VideoData = {
          title: string
          author_name: string
          author_url: string
          thumbnail_url: string
        }
        response.json().then((video: VideoData) => {
          this.videoHeaderTitle.textContent = video.title
          this.videoHeaderAuthorText.textContent = video.author_name
          this.videoHeaderAuthor.href = video.author_url
          globalThis.document.title = video.title
        })
      })
    }
  }
}
