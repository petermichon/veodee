export class DOMEditor {
  private app: HTMLElement

  constructor(app: HTMLElement) {
    this.app = app
  }

  public replaceContent(e: HTMLElement) {
    // this.app.innerHTML = ''
    // this.app.appendChild(e)
    this.app.replaceChildren(e)
  }
}
