import { addVideo } from './add-video.ts'
import { newPlaylistEditor } from './components/playlist-editor.ts'
import { newInput } from './components/import-input.ts'
import { newDefaultButton } from './components/default-button.ts'

export class CollectionLoader {
  private allVideos: DocumentFragment
  private playlistEditorElem: DocumentFragment

  public constructor(
    allVideos: DocumentFragment,
    playlistEditorElem: DocumentFragment
  ) {
    this.allVideos = allVideos
    this.playlistEditorElem = playlistEditorElem
  }

  public load() {
    const videoFeedContainer = document.createElement('div')
    const videoFeed = document.createElement('div')
    const actions = document.createElement('div')
    const addButton = newDefaultButton()
    const importButton = newDefaultButton()
    const input = newInput()
    const playlistEditor = newPlaylistEditor(actions, videoFeedContainer)

    videoFeedContainer.appendChild(videoFeed)
    videoFeed.appendChild(this.allVideos)
    // videoFeed.replaceChildren(this.allVideos)
    actions.appendChild(addButton)
    actions.appendChild(importButton)

    videoFeedContainer.className = 'flex justify-center bg-neutral-950'

    videoFeed.className =
      'grid grid-flow-row sm:p-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 bg-neutral-950 grid-auto-rows w-fit' // max-h-screen auto-rows-max

    // ---

    actions.className =
      'flex flex-row gap-2 text-sm font-bold pt-4 py-2 px-2 bg-neutral-950' // overflow-x-scroll scrollbar-none

    addButton.textContent = 'Add video'

    addButton.addEventListener('click', () => {
      const response = prompt('Enter YouTube video ID')
      if (response !== null) {
        addVideo({ id: response, time: '0' })
      }
    })

    importButton.textContent = 'Import'

    importButton.addEventListener('click', () => {
      input.click()
    })
    importButton.appendChild(input)

    this.playlistEditorElem.appendChild(playlistEditor)
  }
}
