import { PlayerLoader } from './player-loader.ts'

class PageLoader {
  private videoHeader: HTMLElement
  private videoHeaderTitle: HTMLElement
  private videoHeaderAuthorText: HTMLElement
  private videoHeaderAuthor: HTMLAnchorElement

  constructor(
    videoHeader: HTMLElement,
    videoHeaderTitle: HTMLElement,
    videoHeaderAuthorText: HTMLElement,
    videoHeaderAuthor: HTMLAnchorElement
  ) {
    this.videoHeader = videoHeader
    this.videoHeaderTitle = videoHeaderTitle
    this.videoHeaderAuthorText = videoHeaderAuthorText
    this.videoHeaderAuthor = videoHeaderAuthor
  }

  public loadPagePlayer() {}
}
