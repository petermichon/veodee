import { newVideoCardElement } from './video-card.ts'

function newFeedElement(videos: { id: string; time: string }[]) {
  const feedElem = document.createElement('div')

  {
    const videoFeed = document.createElement('div')
    videoFeed.className =
      'sm:p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-0 sm:gap-3 bg-white text-black dark:bg-neutral-900 dark:text-white'
    feedElem.appendChild(videoFeed)

    {
      for (const video of videos) {
        const videoCard = newVideoCardElement(video)
        videoFeed.appendChild(videoCard)

        videoCard.addEventListener('click', (e) => {
          if (e.button === 0) {
            e.preventDefault()
          }

          const eventCopy = new CustomEvent('video-click', {
            detail: { video: video },
          })

          feedElem.dispatchEvent(eventCopy)
        })
      }
    }
  }

  return feedElem
}

export { newFeedElement }
