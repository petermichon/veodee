import { MenuCollection } from './menu-collection.ts'
import { MenuPlayer } from './menu-player.ts'
import { Styler } from './styler.ts'

import { CollectionLoader } from './playlist-loader.ts'
import { PlayerLoader } from './player-loader.ts'
import { PlayerHeaderLoader } from './player-header-loader.ts'

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

  const videoHeader = document.createElement('div')
  const videoHeaderTitle = document.createElement('span')
  const videoHeaderAuthor = document.createElement('a')
  const videoHeaderAuthorText = document.createElement('div')
  const videoHeaderAuthorIcon = document.createElement('div')

  const allVideos = document.createDocumentFragment()
  const collectionElem = document.createDocumentFragment()

  const video = { id: '', time: '' }
  const videoPlayerElem = document.createDocumentFragment()

  // ---

  root.replaceChildren(page)
  page.replaceChildren(sidebar, content)
  sidebar.replaceChildren(top, menuNav)
  top.replaceChildren(menuIcon, logo)
  logo.replaceChildren(logoImg)
  collectionButton.replaceChildren(collectionButtonIcon, collectionButtonText)
  playerButton.replaceChildren(playerButtonIcon, playerButtonText)
  menuNav.replaceChildren(collectionButton, playerButton)

  videoHeader.appendChild(videoHeaderTitle)
  videoHeader.appendChild(videoHeaderAuthor)
  videoHeaderAuthor.appendChild(videoHeaderAuthorText)
  videoHeaderAuthor.appendChild(videoHeaderAuthorIcon)

  // ---

  const menuCollection = new MenuCollection(collectionButton)
  const menuPlayer = new MenuPlayer(playerButton)

  const contentCollection = new CollectionLoader(
    allVideos,
    collectionElem,
    loadPagePlayer
  )

  const playerLoader = new PlayerLoader(video, videoHeader, videoPlayerElem)

  const playerHeaderLoader = new PlayerHeaderLoader(
    video,
    videoHeaderAuthor,
    videoHeaderAuthorText,
    videoHeaderTitle
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

  // content.style.width = '100%'
  content.className =
    'h-screen flex flex-col w-full overflow-y-scroll scrollbar-neutral-400' // max-h-screen

  styler.loadVideoHeaderTitle(videoHeaderTitle)
  styler.loadVideoHeader(videoHeader)
  styler.loadVideoHeaderAuthor(videoHeaderAuthor)
  styler.loadVideoHeaderAuthorText(videoHeaderAuthorText)
  styler.loadVideoHeaderAuthorIcon(videoHeaderAuthorIcon)

  // ---

  function loadPageCollection() {
    globalThis.document.title = 'Veodee'
    menuCollection.setCollectionButtonActive()
    menuPlayer.setPlayerButtonNormal()
    contentCollection.loadVideos()
    contentCollection.loadCollection()
    content.replaceChildren(collectionElem)
  }

  function loadPagePlayer() {
    globalThis.document.title = 'Player - Veodee'
    menuCollection.setCollectionButtonNormal()
    menuPlayer.setPlayerButtonActive()
    playerHeaderLoader.load()
    playerLoader.newContentVideoPlayer()
    content.replaceChildren(videoPlayerElem)
  }

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

  function updatePageContent() {
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

  globalThis.setTimeout(() => {
    // content.innerHTML = ''
  }, 1000)
}
