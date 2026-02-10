export class MenuCollection {
  private collectionButton: HTMLElement

  public constructor(collectionButton: HTMLElement) {
    this.collectionButton = collectionButton
  }

  public setCollectionButtonNormal() {
    this.collectionButton.classList.remove('bg-neutral-800')
    this.collectionButton.classList.add('bg-neutral-950')
    this.collectionButton.classList.remove('hover:bg-neutral-700')
    this.collectionButton.classList.add('hover:bg-neutral-800')
    this.collectionButton.classList.remove('active:bg-neutral-600')
    this.collectionButton.classList.add('active:bg-neutral-700')
    // collectionsButton.classList.remove('font-semibold')
  }

  public setCollectionButtonActive() {
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
  }
}
