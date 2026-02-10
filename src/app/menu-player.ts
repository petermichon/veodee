export class MenuPlayer {
  private playerButton: HTMLElement

  public constructor(playerButton: HTMLElement) {
    this.playerButton = playerButton
  }

  public setPlayerButtonNormal() {
    this.playerButton.classList.remove('bg-neutral-800')
    this.playerButton.classList.add('bg-neutral-950')
    this.playerButton.classList.remove('hover:bg-neutral-700')
    this.playerButton.classList.add('hover:bg-neutral-800')
    this.playerButton.classList.remove('active:bg-neutral-600')
    this.playerButton.classList.add('active:bg-neutral-700')
    // playerButton.classList.remove('font-semibold')
  }

  public setPlayerButtonActive() {
    this.playerButton.classList.remove('bg-neutral-950')
    this.playerButton.classList.add('bg-neutral-800')
    this.playerButton.classList.remove('hover:bg-neutral-800')
    this.playerButton.classList.add('hover:bg-neutral-700')
    this.playerButton.classList.remove('active:bg-neutral-700')
    this.playerButton.classList.add('active:bg-neutral-600')
    // playerButton.classList.add('font-semibold')
  }
}
