export class DOMEditor {
  private app: HTMLElement
  private page: HTMLElement

  constructor(app: HTMLElement, page: HTMLElement) {
    this.app = app
    this.page = page
  }

  public replaceContent() {
    this.app.replaceChildren(this.page)
  }
}
