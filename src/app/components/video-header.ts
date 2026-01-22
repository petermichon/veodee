type VideoData = {
  title: string
  author_name: string
  author_url: string
}

function newVideoHeader(id: string): HTMLElement {
  const video = { id: id, time: '0' }

  const pTitle = document.createElement('p')
  {
    pTitle.textContent = ''
    pTitle.className =
      'font-bold text-black line-clamp-2 dark:text-white text-[19px]'
    // line-clamp-2
    // pt-3 pl-6
    // tracking-[-0.0px] transform scale-y-100
    pTitle.style =
      "font-family: 'Roboto', sans-serif font-variant-numeric: tabular-nums;"
  }
  const pAuthor = document.createElement('a')
  {
    pAuthor.href = ''
    pAuthor.target = '_blank'
    pAuthor.rel = 'noopener noreferrer'
    pAuthor.textContent = ''
    pAuthor.className =
      'w-fit line-clamp-1 text-sm font-bold text-black dark:text-white'
    // hover:underline
    // pt-2 pl-6
    pAuthor.style =
      "font-family: 'Roboto', sans-serif font-variant-numeric: tabular-nums;"
    // pAuthor.style.cursor = 'pointer'
  }

  const videoHeader = document.createElement('div')
  videoHeader.className = 'flex flex-col gap-2 mr-3 overflow-hidden'
  videoHeader.appendChild(pTitle)
  videoHeader.appendChild(pAuthor)

  {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${video.id}&format=json`
    if (video.id === '') {
      return videoHeader
    }

    fetch(oembedUrl).then((response) => {
      if (!response.ok) {
        return
      }
      response.json().then((video: VideoData) => {
        pTitle.textContent = video.title
        pAuthor.textContent = video.author_name // + ' ↗'
        pAuthor.href = video.author_url

        // send loaded signal
        const event = new CustomEvent('video-loaded', {
          detail: { video: { title: video.title } },
        })
        videoHeader.dispatchEvent(event)
      })
    })
  }

  return videoHeader
}

export { newVideoHeader }
