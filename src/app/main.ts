import { MenuCollection } from './menu-collection.ts'
import { MenuPlayer } from './menu-player.ts'
import { Styler } from './styler.ts'

import { CollectionLoader } from './playlist-loader.ts'
import { PlayerLoader } from './player-loader.ts'
import { PlayerHeaderLoader } from './player-header-loader.ts'

export function main() {
  const root = globalThis.document.createDocumentFragment()

  // ---

  // Shared reference
  const content = document.createElement('div')
  const logo = document.createElement('a')
  const collectionButton = document.createElement('a')
  const playerButton = document.createElement('a')
  const videoHeader = document.createElement('div')
  const videoHeaderTitle = document.createElement('span')
  const videoHeaderAuthor = document.createElement('a')
  const videoHeaderAuthorText = document.createElement('div')
  const video = { id: '', time: '' }
  const videoPlayerElem = document.createDocumentFragment()
  const allVideos = document.createDocumentFragment()
  const collectionElem = document.createDocumentFragment()

  // Unique reference
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
  const videoHeaderAuthorIcon = document.createElement('div')

  // ---

  root.replaceChildren(page)
  page.replaceChildren(sidebar, content)
  sidebar.replaceChildren(top, menuNav)
  top.replaceChildren(menuIcon, logo)
  logo.replaceChildren(logoImg)
  collectionButton.replaceChildren(collectionButtonIcon, collectionButtonText)
  playerButton.replaceChildren(playerButtonIcon, playerButtonText)
  menuNav.replaceChildren(collectionButton, playerButton)

  videoHeader.replaceChildren(videoHeaderTitle, videoHeaderAuthor)
  videoHeaderAuthor.replaceChildren(
    videoHeaderAuthorText,
    videoHeaderAuthorIcon
  )

  // ---

  const menuCollection = new MenuCollection(collectionButton)
  const menuPlayer = new MenuPlayer(playerButton)
  // prettier-ignore
  const playerLoader = new PlayerLoader(video, videoHeader, videoPlayerElem)
  // prettier-ignore
  const playerHeaderLoader = new PlayerHeaderLoader(
    video, videoHeaderAuthor, videoHeaderAuthorText, videoHeaderTitle
  )
  const loadPagePlayer = () => {
    globalThis.document.title = 'Player - Veodee'
    menuCollection.setCollectionButtonNormal()
    menuPlayer.setPlayerButtonActive()
    playerHeaderLoader.load()
    playerLoader.newContentVideoPlayer()
    content.replaceChildren(videoPlayerElem)
  }
  const contentCollection = new CollectionLoader(
    allVideos,
    collectionElem,
    loadPagePlayer
  )
  const loadPageCollection = () => {
    globalThis.document.title = 'Veodee'
    menuCollection.setCollectionButtonActive()
    menuPlayer.setPlayerButtonNormal()
    contentCollection.loadVideos()
    contentCollection.loadCollection()
    content.replaceChildren(collectionElem)
  }

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

  // content.style.width = '100%'
  content.className =
    'h-screen flex flex-col w-full overflow-y-scroll scrollbar-neutral-400' // max-h-screen

  styler.loadVideoHeaderTitle(videoHeaderTitle)
  styler.loadVideoHeader(videoHeader)
  styler.loadVideoHeaderAuthor(videoHeaderAuthor)
  styler.loadVideoHeaderAuthorText(videoHeaderAuthorText)
  styler.loadVideoHeaderAuthorIcon(videoHeaderAuthorIcon)

  // ---

  logo.addEventListener('click', (e) => {
    e.preventDefault()
    globalThis.history.pushState({}, '', '/')
    loadPageCollection()
  })

  collectionButton.addEventListener('click', (event: PointerEvent) => {
    event.preventDefault()
    globalThis.history.pushState({}, '', '/')
    loadPageCollection()
  })

  playerButton.addEventListener('click', (event: PointerEvent) => {
    event.preventDefault()
    globalThis.history.pushState({}, '', '/video?v=')
    loadPagePlayer()
  })

  // ---

  const updatePageContent = () => {
    const pathname = globalThis.document.location.pathname
    if (pathname === '/') {
      loadPageCollection()
    }
    if (pathname === '/video') {
      loadPagePlayer()
    }
  }

  globalThis.addEventListener('popstate', (event: PopStateEvent) => {
    updatePageContent()
  })

  updatePageContent()

  // ---

  const app = globalThis.document.getElementById('app')!
  app.replaceChildren(root)
}
