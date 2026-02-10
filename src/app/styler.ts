export class Styler {
  public constructor() {}

  public loadPage(page: HTMLElement) {
    page.style.display = 'flex'
    page.style.flexDirection = 'row'
    // page.style.alignItems = 'center'
    page.style.fontFamily = 'sans-serif' // system-ui sans-serif monospace
    page.style.fontWeight = '500'
    page.style.color = 'oklch(97% 0 0)' // neutral-50
    // page.style.cssText = 'display: flex; flex-direction: row; font-family: sans-serif; font-weight: 500; color: oklch(97% 0 0);'
  }

  public loadSidebar(sidebar: HTMLElement) {
    sidebar.className =
      'flex flex-col h-screen flex-shrink-0 text-sm overflow-y-auto bg-neutral-950 scrollbar-neutral-950 hover-scrollbar-neutral-400 w-60' // w-60 w-16
  }

  public loadTop(top: HTMLElement) {
    top.className = 'flex flex-row items-center ml-4 mr-7 h-14'
  }

  public loadMenuIcon(menuIcon: HTMLElement) {
    menuIcon.className =
      'h-fit w-fit p-2 rounded-full cursor-pointer hover:bg-neutral-700 active:bg-neutral-600 text-xl' // h-fit m-3
    // icon.style.width = '100%'
    // icon.style.height = '100%'
    // icon.style.display = 'block'
    menuIcon.style.fill = 'currentcolor'
    menuIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu-icon lucide-menu"><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/></svg>
    `
  }

  public loadLogo(logo: HTMLAnchorElement) {
    logo.className = 'ml-4 flex w-full h-full items-center cursor-pointer'
    logo.href = '/'
  }

  public loadLogoImg(logoImg: HTMLImageElement) {
    logoImg.className = 'h-6 opacity-0'
    logoImg.src = './logo-white.png'
    logoImg.onload = (event: Event) => {
      logoImg.classList.remove('opacity-0')
    }
  }

  public loadMenuNav(menuNav: HTMLElement) {
    menuNav.className = 'flex flex-col py-3 ml-3 mr-6'
  }

  public loadCollectionButton(collectionButton: HTMLAnchorElement) {
    collectionButton.className =
      'flex flex-row gap-3 text-left h-10 items-center justify-center rounded-lg cursor-pointer'
    collectionButton.href = '/'
  }

  public loadPlayerButton(playerButton: HTMLAnchorElement) {
    playerButton.className =
      'flex flex-row gap-3 text-left h-10 items-center justify-center rounded-lg cursor-pointer'
    playerButton.href = '/video?v='
  }

  public loadCollectionButtonIcon(collectionButtonIcon: HTMLElement) {
    collectionButtonIcon.className = 'h-fit m-3' // 'h-fit w-8 mr-1'
    // icon.style.width = '100%'
    // icon.style.height = '100%'
    // icon.style.display = 'block'
    collectionButtonIcon.style.fill = 'currentcolor'
    collectionButtonIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-library-big-icon lucide-library-big"><rect width="8" height="18" x="3" y="3" rx="1"/><path d="M7 3v18"/><path d="M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z"/></svg>
    `
  }

  public loadPlayerButtonIcon(playerButtonIcon: HTMLElement) {
    playerButtonIcon.className = 'h-fit m-3' // mr-5.5 // 'h-fit w-8 mr-1'
    // icon.style.width = '100%'
    // icon.style.height = '100%'
    // icon.style.display = 'block'
    playerButtonIcon.style.fill = 'currentcolor'
    playerButtonIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-play-icon lucide-circle-play"><path d="M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z"/><circle cx="12" cy="12" r="10"/></svg>
    `
  }

  public loadCollectionButtonText(collectionButtonText: HTMLElement) {
    collectionButtonText.className = 'w-full text-[14px]' // font-[700]
    collectionButtonText.textContent = 'Collection'
  }

  public loadPlayerButtonText(playerButtonText: HTMLElement) {
    playerButtonText.className = 'w-full text-[14px]' // font-[700]
    playerButtonText.textContent = 'Player'
  }

  public loadVideoHeaderTitle(videoHeaderTitle: HTMLElement) {
    videoHeaderTitle.textContent = ''
    videoHeaderTitle.className = 'font-bold line-clamp-2 text-[19px]'
  }

  public loadVideoHeader(videoHeader: HTMLElement) {
    videoHeader.className = 'flex flex-col gap-2 mr-3 overflow-hidden'
  }

  public loadVideoHeaderAuthor(videoHeaderAuthor: HTMLAnchorElement) {
    videoHeaderAuthor.className = 'flex flex-row gap-1 items-center group w-fit' // #ff1d33
    videoHeaderAuthor.href = ''
    videoHeaderAuthor.target = '_blank'
    videoHeaderAuthor.rel = 'noopener noreferrer'
  }

  public loadVideoHeaderAuthorText(videoHeaderAuthorText: HTMLElement) {
    videoHeaderAuthorText.textContent = ''
    videoHeaderAuthorText.className = 'w-fit line-clamp-1 text-sm font-bold'
  }

  public loadVideoHeaderAuthorIcon(videoHeaderAuthorIcon: HTMLElement) {
    videoHeaderAuthorIcon.className =
      'text-neutral-500 group-hover:text-neutral-400'
    // mb-0.25
    // icon.style = 'width: 100%; height: 100%; display: block; fill: currentcolor;'
    videoHeaderAuthorIcon.style.fill = 'currentcolor'
    // Prefer original width=24 and height=24
    videoHeaderAuthorIcon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link-icon lucide-external-link"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
  `
  }
}
