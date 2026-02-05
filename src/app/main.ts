import { ContentLoader } from './content-loader.ts'
import { Styler } from './styler.ts'

export function main() {
  const root = document.createDocumentFragment()

  const content = document.createElement('div')
  const logo = document.createElement('a')
  const collectionButton = document.createElement('a')
  const playerButton = document.createElement('a')

  // ---

  const page = document.createElement('div')
  const sidebar = document.createElement('div')
  const top = document.createElement('div')
  const menuIcon = document.createElement('div')
  const logoImg = document.createElement('img')
  const menuNav = document.createElement('div')
  const collectionButtonIcon = document.createElement('div')
  const collectionButtonText = document.createElement('span')
  const playerButtonIcon = document.createElement('div')
  const playerButtonText = document.createElement('span')

  // ---

  root.replaceChildren(page)
  page.replaceChildren(sidebar, content)
  sidebar.replaceChildren(top, menuNav)
  top.replaceChildren(menuIcon, logo)
  logo.replaceChildren(logoImg)
  collectionButton.replaceChildren(collectionButtonIcon, collectionButtonText)
  playerButton.replaceChildren(playerButtonIcon, playerButtonText)
  menuNav.replaceChildren(collectionButton, playerButton)

  // ---

  // const pageLoader = new PageLoader(
  //   root, content, logo, collectionButton, playerButton
  // )

  // prettier-ignore
  const contentLoader = new ContentLoader(
    content, collectionButton, playerButton
  )

  // ---

  const styler = new Styler()
  styler.loadPage(page)
  styler.loadSidebar(sidebar)
  styler.loadTop(top)
  styler.loadMenuIcon(menuIcon)
  styler.loadLogo(logo)
  styler.loadLogoImg(logoImg)
  styler.loadMenuNav(menuNav)
  styler.loadCollectionButton(collectionButton)
  styler.loadPlayerButton(playerButton)
  styler.loadCollectionButtonIcon(collectionButtonIcon)
  styler.loadPlayerButtonIcon(playerButtonIcon)
  styler.loadCollectionButtonText(collectionButtonText)
  styler.loadPlayerButtonText(playerButtonText)

  // ---

  logo.addEventListener('click', (e) => {
    e.preventDefault()
    globalThis.history.pushState({}, '', '/')
    contentLoader.loadCollectionPage()
  })

  collectionButton.addEventListener('click', (event: PointerEvent) => {
    event.preventDefault()
    globalThis.history.pushState({}, '', '/')
    contentLoader.loadCollectionPage()
  })

  playerButton.addEventListener('click', (event: PointerEvent) => {
    event.preventDefault()
    globalThis.history.pushState({}, '', '/video?v=')
    contentLoader.loadPlayerPage()
  })

  // ---

  const app = globalThis.document.getElementById('app')!
  app.replaceChildren(root)

  // ---

  function updatePageContent() {
    const pathname = globalThis.document.location.pathname
    if (pathname === '/') {
      contentLoader.loadCollectionPage()
    }
    if (pathname === '/video') {
      contentLoader.loadPlayerPage()
    }
  }

  globalThis.addEventListener('popstate', (event: PopStateEvent) => {
    updatePageContent()
  })

  updatePageContent()
}
