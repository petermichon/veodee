class ContentLoader {
  private content: HTMLElement

  public constructor(content: HTMLElement) {
    this.content = content
  }

  public replace(videoPlayer: DocumentFragment) {
    this.content.replaceChildren(videoPlayer)
  }
}
