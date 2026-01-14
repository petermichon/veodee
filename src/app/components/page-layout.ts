import { goToPage } from '../pages.ts'
import { newImportButton } from './importButton.ts'
import { newLogo } from './logo.ts'

export function newPageLayout(
  pageContent: HTMLElement,
  collectionsButton: HTMLButtonElement,
  playerButton: HTMLButtonElement
): HTMLElement {
  const playlistElem = document.createElement('div')
  playlistElem.className = 'flex flex-row h-screen'

  {
    const panel = document.createElement('div')
    panel.className =
      'w-60 flex flex-col flex-shrink-0 overflow-y-auto text-white font-bold text-sm scrollbar-dark bg-neutral-950'
    // 'grid grid-rows-[auto_1fr_auto] overflow-y-auto'
    {
      const firstList = document.createElement('div')
      firstList.className = 'ml-4 mr-7 flex flex-row h-14'
      {
        const menuButton = document.createElement('button')
        menuButton.className =
          'p-3 rounded-full cursor-pointer hover:bg-neutral-700 active:bg-neutral-600 text-xl'
        menuButton.textContent = '➤'
        firstList.appendChild(menuButton)
      }
      {
        const logo = newLogo()
        firstList.appendChild(logo)
      }
      panel.appendChild(firstList)
    }
    {
      const importButton = newImportButton()
      panel.appendChild(importButton)
    }

    {
      panel.appendChild(collectionsButton)
    }
    playlistElem.appendChild(panel)

    {
      const player = document.createElement('div')
      player.className =
        'px-3 flex flex-row ml-3 mr-6 h-10 items-center rounded-lg cursor-pointer bg-neutral-950 hover:bg-neutral-800 active:bg-neutral-700'
      player.addEventListener('click', (event: PointerEvent) => {
        // event.preventDefault()
        const customEvent = new CustomEvent('menu-player-click', {})
        playlistElem.dispatchEvent(customEvent)
      })
      {
        const icon = document.createElement('div')
        icon.className = 'w-16.5 text-2xl'
        icon.textContent = '➤'
        player.appendChild(icon)
      }
      {
        const text = document.createElement('div')
        text.className = 'w-full text-[13px] font-[700]'
        text.textContent = 'Player'
        player.appendChild(text)
      }
      // panel.appendChild(player)
      panel.appendChild(playerButton)
    }
    playlistElem.appendChild(panel)

    {
      // Inject content
      playlistElem.appendChild(pageContent)
    }
  }

  return playlistElem
}
