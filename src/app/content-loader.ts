export class ContentLoader {
  private content: HTMLElement

  public constructor(content: HTMLElement) {
    this.content = content
  }

  public loadPlayerPage(videoPlayer: DocumentFragment) {
    // this.content.replaceWith(videoPlayer)
    // this.content = videoPlayer // Update reference
    this.content.replaceChildren(videoPlayer)
  }

  public loadCollectionPage(playlistEditor: DocumentFragment) {
    // this.content.replaceWith(playlistEditor)
    // this.content = playlistEditor // Update reference
    this.content.replaceChildren(playlistEditor)
  }
}
