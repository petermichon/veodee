import { DOMEditor } from './dom-editor.ts'

import { addVideo } from './add-video.ts'

import { newPageLayout } from './components/page-layout.ts'
import { newPlaylistEditor } from './components/playlist-editor.ts'
import { newVideoPlayer } from './components/video-player.ts'
import { newVideoCardElement } from './components/video-card.ts'
import { newInput } from './components/import-input.ts'
import { newLogo } from './components/logo.ts'
import { newFooter } from './components/footer.ts'
import { newYoutubeEmbed } from './components/youtube-embed.ts'
import { newVideoHeader } from './components/video-header.ts'
import { newDefaultButton } from './components/default-button.ts'
import { newMenuButton } from './components/menu-button.ts'

type Video = { id: string; time: string }

function main() {
  const app = globalThis.document.getElementById('app')!
  const domEditor = new DOMEditor(app)

  let pageContent: HTMLDivElement = document.createElement('div')
  // let pageContent = newPlaylistEditor()

  const navBar = document.createElement('div')
  // navBar.className = 'overflow-hidden hover:overflow-y-auto bg-neutral-950'
  // navBar.style = 'scrollbar-gutter: stable;'

  // navBar.className =
  //   'overflow-y-auto bg-neutral-950 scrollbar-neutral-950 hover-scrollbar-neutral-400'

  navBar.className =
    'w-60 flex flex-col flex-shrink-0 text-sm overflow-y-auto bg-neutral-950 scrollbar-neutral-950 hover-scrollbar-neutral-400 '
  // w-60 flex flex-col flex-shrink-0 font-bold text-sm overflow-y-auto
  // scrollbar-transparent
  // 'grid grid-rows-[auto_1fr_auto] overflow-y-auto'
  {
    const top = document.createElement('div')
    top.className = 'flex flex-row items-center ml-4 mr-7 h-14'
    {
      // const menuButton = document.createElement('button')
      // menuButton.className =
      //   'p-3 rounded-full cursor-pointer hover:bg-neutral-700 active:bg-neutral-600 text-xl'
      // menuButton.textContent = '➤'
      // top.appendChild(menuButton)
      const icon = document.createElement('div')
      icon.className =
        'h-fit w-fit p-2 rounded-full cursor-pointer hover:bg-neutral-700 active:bg-neutral-600 text-xl' // h-fit m-3
      // icon.style.width = '100%'
      // icon.style.height = '100%'
      // icon.style.display = 'block'
      icon.style.fill = 'currentcolor'

      {
        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/></svg>
        `
        icon.innerHTML = svg
      }
      top.appendChild(icon)
    }
    {
      const logo = newLogo()
      logo.addEventListener('click', (e) => {
        e.preventDefault()
        globalThis.history.pushState({}, '', '/')
        updatePageContent()
      })
      top.appendChild(logo)
    }
    navBar.appendChild(top)
  }
  let collectionsButton: HTMLButtonElement
  let playerButton: HTMLButtonElement
  {
    const menuNav = document.createElement('div')
    menuNav.className = 'flex flex-col py-3 ml-3 mr-6'

    {
      const icon = document.createElement('div')
      icon.className = 'h-fit m-3' // 'h-fit w-8 mr-1'
      // icon.style.width = '100%'
      // icon.style.height = '100%'
      // icon.style.display = 'block'
      icon.style.fill = 'currentcolor'

      {
        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="8" height="18" x="3" y="3" rx="1"/>
            <path d="M7 3v18"/><path d="M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z"/>
          </svg>
        `
        icon.innerHTML = svg
      }

      const text = document.createElement('div')
      text.className = 'w-full text-[14px]' // font-[700]
      text.textContent = 'Collection'

      collectionsButton = newMenuButton(icon, text)

      const collectionMenuAction = (event: PointerEvent) => {
        globalThis.history.pushState({}, '', '/')
        updatePageContent()
      }
      collectionsButton.addEventListener('click', collectionMenuAction)

      menuNav.appendChild(collectionsButton)
    }

    // {
    //   collectionsButton = newMenuCollections()
    //   const collectionMenuAction = (event: PointerEvent) => {
    //     globalThis.history.pushState({}, '', '/')
    //     updatePageContent()
    //   }
    //   collectionsButton.addEventListener('click', collectionMenuAction)
    //   menuNav.appendChild(collectionsButton)
    // }

    {
      const icon = document.createElement('div')
      icon.className = 'h-fit m-3' // mr-5.5 // 'h-fit w-8 mr-1'
      // icon.style.width = '100%'
      // icon.style.height = '100%'
      // icon.style.display = 'block'
      icon.style.fill = 'currentcolor'
      {
        const svg = `
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-circle-play-icon lucide-circle-play"
          >
            <path
              d="M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z"
            />
            <circle cx="12" cy="12" r="10" />
          </svg>
        `
        icon.innerHTML = svg
      }

      const text = document.createElement('div')
      text.className = 'w-full text-[14px]' // font-[700]
      text.textContent = 'Player'

      playerButton = newMenuButton(icon, text)

      const playerMenuAction = (event: PointerEvent) => {
        globalThis.history.pushState({}, '', '/video?v=')
        updatePageContent()
      }
      playerButton.addEventListener('click', playerMenuAction)

      menuNav.appendChild(playerButton)
    }

    // for (let i = 0; i < 24; i++) {
    //   const icon = document.createElement('div')
    //   icon.className = 'w-16.5 text-2xl'
    //   icon.textContent = '➤'
    //   const text = document.createElement('div')
    //   text.className = 'w-full text-[13px] font-medium'
    //   text.textContent = 'Player'
    //   const dummy = newMenuButton(icon, text)
    //   menuNav.appendChild(dummy)
    // }

    navBar.appendChild(menuNav)
  }

  const pageLayout = newPageLayout(pageContent, navBar)

  domEditor.replaceContent(pageLayout)

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
      let videos: Video[] = []
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
        pageContent.replaceWith(playlistEditor)
        pageContent = playlistEditor // Update reference
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

        collectionsButton.classList.remove('bg-neutral-950')
        collectionsButton.classList.add('bg-neutral-800')
        collectionsButton.classList.remove('hover:bg-neutral-800')
        collectionsButton.classList.add('hover:bg-neutral-700')
        collectionsButton.classList.remove('active:bg-neutral-700')
        collectionsButton.classList.add('active:bg-neutral-600')
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
      pageContent.replaceWith(videoPlayer)
      pageContent = videoPlayer // Update reference

      // ---
      playerButton.classList.remove('bg-neutral-950')
      playerButton.classList.add('bg-neutral-800')
      playerButton.classList.remove('hover:bg-neutral-800')
      playerButton.classList.add('hover:bg-neutral-700')
      playerButton.classList.remove('active:bg-neutral-700')
      playerButton.classList.add('active:bg-neutral-600')
      // playerButton.classList.add('font-semibold')

      collectionsButton.classList.remove('bg-neutral-800')
      collectionsButton.classList.add('bg-neutral-950')
      collectionsButton.classList.remove('hover:bg-neutral-700')
      collectionsButton.classList.add('hover:bg-neutral-800')
      collectionsButton.classList.remove('active:bg-neutral-600')
      collectionsButton.classList.add('active:bg-neutral-700')
      // collectionsButton.classList.remove('font-semibold')
      // ---
    }
  }

  updatePageContent()
}

export { main }
