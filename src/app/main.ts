import { ContentLoader } from './content-loader.ts'
import { MenuCollection } from './menu-collection.ts'
import { MenuPlayer } from './menu-player.ts'
import { Styler } from './styler.ts'

import { newVideoCardElement } from './components/video-card.ts'
import { CollectionLoader } from './playlist-loader.ts'
import { PlayerLoader } from './player-loader.ts'

type VideoData = {
  title: string
  author_name: string
  author_url: string
  thumbnail_url: string
}

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

  const contentLoader = new ContentLoader(content)
  const menuCollection = new MenuCollection(collectionButton)
  const menuPlayer = new MenuPlayer(playerButton)

  // ---

  // const playlistEditorElem = document.createDocumentFragment()
  // const allVideos = document.createDocumentFragment()
  // const videoPlaylistEditor = new VideosPlaylistEditor(
  //   allVideos,
  //   playlistEditorElem
  // )
  // const playlistEditorElem = videoPlaylistEditor.newPlaylistEditorElem()

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
    // ---
    menuCollection.setCollectionButtonActive()
    menuPlayer.setPlayerButtonNormal()
    // ---
    const localVideos = localStorage.getItem('videos') || '[]'
    let videos: { id: string; time: string }[] = []
    try {
      videos = JSON.parse(localVideos)
    } catch (e: unknown) {
      const err = e as SyntaxError
      console.error(err.stack)
    }
    // ---
    const allVideos = document.createDocumentFragment()
    for (const video of videos) {
      const videoCard = newVideoCardElement(video)

      videoCard.addEventListener('click', (event: Event) => {
        event.preventDefault()
        // const video = customEvent.detail.video
        // let tParam = ''
        // if (video.time > 0) {
        //   tParam = `&t=${video.time}`
        // }
        // const url = `/video?v=${video.id}` + tParam
        // history.pushState({}, '', url)
        // goToPage('/video')

        // const videoPlayer = newVideoPlayer(video, shareButton)

        const url = `/video?v=${video.id}`
        globalThis.history.pushState({}, '', url)

        loadPagePlayer()
      })

      allVideos.appendChild(videoCard)
    }

    const collectionElem = document.createDocumentFragment()
    const contentCollection = new CollectionLoader(allVideos, collectionElem)
    contentCollection.load()

    // const playlistEditorElem = newPlaylistEditorElem(allVideos)

    contentLoader.loadCollectionPage(collectionElem)
  }

  function loadPagePlayer() {
    globalThis.document.title = 'Player - Veodee'
    // ---
    menuCollection.setCollectionButtonNormal()
    menuPlayer.setPlayerButtonActive()
    // ---
    const search = globalThis.document.location.search
    const urlSearchParams = new URLSearchParams(search)
    const id = urlSearchParams.get('v') || ''
    const time = urlSearchParams.get('t') || '0'
    const video = { id: id, time: time }

    const videoPlayerElem = document.createDocumentFragment()
    const playerLoader = new PlayerLoader(video, videoHeader, videoPlayerElem)
    playerLoader.newContentVideoPlayer()

    contentLoader.loadPlayerPage(videoPlayerElem)

    {
      const search = globalThis.document.location.search
      const urlSearchParams = new URLSearchParams(search)
      const id = urlSearchParams.get('v') || ''
      const time = urlSearchParams.get('t') || '0'
      const video = { id: id, time: time }

      const videoUrl = `https://www.youtube.com/watch?v=${video.id}`
      const oembedUrl = `https://www.youtube.com/oembed?url=${videoUrl}&format=json`

      videoHeaderTitle.textContent = ''
      videoHeaderAuthorText.textContent = ''
      videoHeaderAuthor.href = ''
      globalThis.document.title = ''

      if (video.id !== '') {
        fetch(oembedUrl).then((response) => {
          if (!response.ok) {
            return
          }

          response.json().then((video: VideoData) => {
            videoHeaderTitle.textContent = video.title
            videoHeaderAuthorText.textContent = video.author_name
            videoHeaderAuthor.href = video.author_url
            globalThis.document.title = video.title
          })
        })
      }
    }
  }

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
