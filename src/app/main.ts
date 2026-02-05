import { addVideo } from './add-video.ts'

import { newPlaylistEditor } from './components/playlist-editor.ts'
import { newVideoPlayer } from './components/video-player.ts'
import { newVideoCardElement } from './components/video-card.ts'
import { newInput } from './components/import-input.ts'
import { newFooter } from './components/footer.ts'
import { newYoutubeEmbed } from './components/youtube-embed.ts'
import { newVideoHeader } from './components/video-header.ts'
import { newDefaultButton } from './components/default-button.ts'

function main() {
  let content = document.createElement('div')
  const collectionButton = document.createElement('a')
  const playerButton = document.createElement('a')

  // ---

  const page = document.createElement('div')
  const sidebar = document.createElement('div')
  const top = document.createElement('div')
  const menuIcon = document.createElement('div')
  const logo = document.createElement('a')
  const logoImg = document.createElement('img')
  const menuNav = document.createElement('div')
  const collectionButtonIcon = document.createElement('div')
  const collectionButtonText = document.createElement('span')
  const playerButtonIcon = document.createElement('div')
  const playerButtonText = document.createElement('span')

  // ---

  page.replaceChildren(sidebar, content)
  sidebar.replaceChildren(top, menuNav)
  top.replaceChildren(menuIcon, logo)
  logo.replaceChildren(logoImg)
  collectionButton.replaceChildren(collectionButtonIcon, collectionButtonText)
  playerButton.replaceChildren(playerButtonIcon, playerButtonText)
  menuNav.replaceChildren(collectionButton, playerButton)

  // ---

  // <-- Inject styling and interactivity here

  // ---

  const app = globalThis.document.getElementById('app')!
  app.replaceChildren(page)

  // ---

  page.style.display = 'flex'
  page.style.flexDirection = 'row'
  page.style.fontFamily = 'sans-serif' // system-ui sans-serif monospace
  page.style.fontWeight = '500'
  page.style.color = 'oklch(97% 0 0)' // neutral-50

  sidebar.className =
    'flex flex-col h-screen flex-shrink-0 text-sm overflow-y-auto bg-neutral-950 scrollbar-neutral-950 hover-scrollbar-neutral-400 w-60' // w-60 w-16

  top.className = 'flex flex-row items-center ml-4 mr-7 h-14'

  menuIcon.className =
    'h-fit w-fit p-2 rounded-full cursor-pointer hover:bg-neutral-700 active:bg-neutral-600 text-xl' // h-fit m-3
  // icon.style.width = '100%'
  // icon.style.height = '100%'
  // icon.style.display = 'block'
  menuIcon.style.fill = 'currentcolor'
  menuIcon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu-icon lucide-menu"><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/></svg>
  `

  logo.className = 'ml-4 flex w-full h-full items-center cursor-pointer'
  logo.href = '/'
  logo.addEventListener('click', (e) => {
    e.preventDefault()
    globalThis.history.pushState({}, '', '/')
    updatePageContent()
  })

  logoImg.className = 'h-6'
  logoImg.src = './logo-white.png'

  menuNav.className = 'flex flex-col py-3 ml-3 mr-6'

  // ---

  collectionButton.className =
    'flex flex-row gap-3 text-left h-10 items-center justify-center rounded-lg cursor-pointer'
  collectionButton.href = '/'
  collectionButton.addEventListener('click', (event: PointerEvent) => {
    globalThis.history.pushState({}, '', '/')
    updatePageContent()
  })

  playerButton.className =
    'flex flex-row gap-3 text-left h-10 items-center justify-center rounded-lg cursor-pointer'
  playerButton.href = '/video?v='
  playerButton.addEventListener('click', (event: PointerEvent) => {
    globalThis.history.pushState({}, '', '/video?v=')
    updatePageContent()
  })

  // ---

  collectionButtonIcon.className = 'h-fit m-3' // 'h-fit w-8 mr-1'
  // icon.style.width = '100%'
  // icon.style.height = '100%'
  // icon.style.display = 'block'
  collectionButtonIcon.style.fill = 'currentcolor'
  collectionButtonIcon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-library-big-icon lucide-library-big"><rect width="8" height="18" x="3" y="3" rx="1"/><path d="M7 3v18"/><path d="M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z"/></svg>
  `

  playerButtonIcon.className = 'h-fit m-3' // mr-5.5 // 'h-fit w-8 mr-1'
  // icon.style.width = '100%'
  // icon.style.height = '100%'
  // icon.style.display = 'block'
  playerButtonIcon.style.fill = 'currentcolor'
  playerButtonIcon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-play-icon lucide-circle-play"><path d="M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z"/><circle cx="12" cy="12" r="10"/></svg>
  `

  // ---

  collectionButtonText.className = 'w-full text-[14px]' // font-[700]
  collectionButtonText.textContent = 'Collection'

  playerButtonText.className = 'w-full text-[14px]' // font-[700]
  playerButtonText.textContent = 'Player'

  // ---

  globalThis.addEventListener('popstate', (event: PopStateEvent) => {
    updatePageContent()
    // goToPage(globalThis.location.pathname)
  })

  function updatePageContent() {
    const pathname = globalThis.document.location.pathname
    const search = globalThis.document.location.search

    if (pathname === '/') {
      globalThis.document.title = 'Veodee'

      // ---
      const localVideos = localStorage.getItem('videos') || '[]'
      let videos: { id: string; time: string }[] = []
      try {
        videos = JSON.parse(localVideos)
      } catch (e) {
        // ...
      }
      // ---

      // ---
      const videoFeedContainer = document.createElement('div')
      videoFeedContainer.className = 'flex justify-center bg-neutral-950'
      {
        const videoFeed = document.createElement('div')
        videoFeed.className =
          'grid grid-flow-row sm:p-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 bg-neutral-950 grid-auto-rows w-fit' // max-h-screen auto-rows-max
        {
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
              // pageContent.replaceWith(videoPlayer)
              // pageContent = videoPlayer
              updatePageContent()
            })

            videoFeed.appendChild(videoCard)
          }
        }
        videoFeedContainer.appendChild(videoFeed)
        // ---
      }
      const actions = document.createElement('div')
      actions.className =
        'flex flex-row gap-2 text-sm font-bold pt-4 py-2 px-2 bg-neutral-950' // overflow-x-scroll scrollbar-none
      {
        const addButton = newDefaultButton()
        addButton.textContent = 'Add video'

        addButton.addEventListener('click', () => {
          const videoId = prompt('Enter YouTube video ID')
          if (videoId) {
            addVideo({ id: videoId, time: '0' })
          }
        })
        actions.appendChild(addButton)
      }
      {
        const importButton = newDefaultButton()
        importButton.textContent = 'Import'
        {
          const input = newInput()
          importButton.addEventListener('click', () => {
            input.click()
          })
          importButton.appendChild(input)
        }
        actions.appendChild(importButton)
      }
      {
        const playlistEditor = newPlaylistEditor(actions, videoFeedContainer)
        content.replaceWith(playlistEditor)
        content = playlistEditor // Update reference
        // collectionsButton.classList.remove('')
        // collectionsButton.classList.add('bg-red')

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

        collectionButton.classList.remove('bg-neutral-950')
        collectionButton.classList.add('bg-neutral-800')
        collectionButton.classList.remove('hover:bg-neutral-800')
        collectionButton.classList.add('hover:bg-neutral-700')
        collectionButton.classList.remove('active:bg-neutral-700')
        collectionButton.classList.add('active:bg-neutral-600')
        // collectionsButton.classList.add('font-semibold')

        playerButton.classList.remove('bg-neutral-800')
        playerButton.classList.add('bg-neutral-950')
        playerButton.classList.remove('hover:bg-neutral-700')
        playerButton.classList.add('hover:bg-neutral-800')
        playerButton.classList.remove('active:bg-neutral-600')
        playerButton.classList.add('active:bg-neutral-700')
        // playerButton.classList.remove('font-semibold')
        // ---
      }
    }

    if (pathname === '/video') {
      const urlSearchParams = new URLSearchParams(search)
      const id = urlSearchParams.get('v') || ''
      const time = urlSearchParams.get('t') || '0'
      const video = { id: id, time: time }
      // pageContent = newVideoPlayer(video)

      const videoElement = document.createElement('div')
      videoElement.className = 'w-full aspect-video lg:aspect-[2.15/1] bg-black'
      if (video.id !== '') {
        const embed = newYoutubeEmbed(video)
        // Use replaceWith instead
        videoElement.replaceChildren(embed)
      }

      const videoHeader = newVideoHeader(video.id)
      // const shareButton = newShareButton()
      const shareButton = newDefaultButton()
      {
        shareButton.textContent = 'Share'
        shareButton.addEventListener('click', () => {
          const url = globalThis.document.location.href
          navigator.clipboard
            .writeText(url)
            // .then(() => {})
            .catch((err) => {
              console.error('Clipboard copy failed:', err)
            })
        })
      }
      // const fullscreenButton = newFullscreenButton()
      const fullscreenButton = newDefaultButton()
      {
        fullscreenButton.textContent = 'Fullscreen'
        fullscreenButton.addEventListener('click', (event: Event) => {
          if (document.fullscreenElement) {
            document.exitFullscreen()
          } else {
            document.documentElement.requestFullscreen({
              navigationUI: 'hide',
            })
            // videoElement.requestFullscreen()
            // document.documentElement.requestFullscreen()
          }
        })
      }
      const footer = newFooter()

      const videoPlayer = newVideoPlayer(
        video,
        shareButton,
        footer,
        videoHeader,
        fullscreenButton,
        videoElement
      )
      content.replaceWith(videoPlayer)
      content = videoPlayer // Update reference

      // ---
      playerButton.classList.remove('bg-neutral-950')
      playerButton.classList.add('bg-neutral-800')
      playerButton.classList.remove('hover:bg-neutral-800')
      playerButton.classList.add('hover:bg-neutral-700')
      playerButton.classList.remove('active:bg-neutral-700')
      playerButton.classList.add('active:bg-neutral-600')
      // playerButton.classList.add('font-semibold')

      collectionButton.classList.remove('bg-neutral-800')
      collectionButton.classList.add('bg-neutral-950')
      collectionButton.classList.remove('hover:bg-neutral-700')
      collectionButton.classList.add('hover:bg-neutral-800')
      collectionButton.classList.remove('active:bg-neutral-600')
      collectionButton.classList.add('active:bg-neutral-700')
      // collectionsButton.classList.remove('font-semibold')
      // ---
    }
  }

  updatePageContent()
}

export { main }
