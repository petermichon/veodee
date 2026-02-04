type VideoData = {
  title: string
  author_name: string
  author_url: string
  thumbnail_url: string
}

function newVideoHeader(id: string): HTMLElement {
  const video = { id: id, time: '0' }

  const pTitle = document.createElement('p')
  {
    pTitle.textContent = ''
    pTitle.className = 'font-bold line-clamp-2 text-[19px]'
    // line-clamp-2
    // pt-3 pl-6Z
    // tracking-[-0.0px] transform scale-y-100
    // pTitle.style =
    //   "font-family: 'Roboto', sans-serif font-variant-numeric: tabular-nums;"
  }

  const author = document.createElement('a')
  const authorText = document.createElement('div')

  const videoHeader = document.createElement('div')
  videoHeader.className = 'flex flex-col gap-2 mr-3 overflow-hidden'
  videoHeader.appendChild(pTitle)
  {
    author.className = 'flex flex-row gap-1 items-center group w-fit' // #ff1d33
    author.href = ''
    author.target = '_blank'
    author.rel = 'noopener noreferrer'
    {
      {
        authorText.textContent = ''
        authorText.className = 'w-fit line-clamp-1 text-sm font-bold'
        // hover:underline
        // pt-2 pl-6
        // authorText.style = "font-family: 'Roboto', sans-serif font-variant-numeric: tabular-nums;"
        // pAuthor.style.cursor = 'pointer'
      }
      author.appendChild(authorText)

      {
        const icon = document.createElement('div')
        icon.className = 'text-neutral-500 group-hover:text-neutral-400'
        // mb-0.25
        // icon.style = 'width: 100%; height: 100%; display: block; fill: currentcolor;'
        icon.style.fill = 'currentcolor'
        {
          const svg = `
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M15 3h6v6"/>
              <path d="M10 14 21 3"/>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            </svg>
          `
          icon.innerHTML = svg
        }
        author.appendChild(icon)
      }
    }
    videoHeader.appendChild(author)
  }

  {
    const videoUrl = `https://www.youtube.com/watch?v=${video.id}`
    const oembedUrl = `https://www.youtube.com/oembed?url=${videoUrl}&format=json`
    if (video.id === '') {
      globalThis.document.title = 'Player - Veodee'
      return videoHeader
    }

    fetch(oembedUrl).then((response) => {
      if (!response.ok) {
        return
      }
      response.json().then((video: VideoData) => {
        pTitle.textContent = video.title
        authorText.textContent = video.author_name // + ' ↗'
        author.href = video.author_url
        globalThis.document.title = video.title

        // send loaded signal
        // const event = new CustomEvent('video-loaded', {
        //   detail: { video: { title: video.title } },
        // })
        // videoHeader.dispatchEvent(event)
      })
    })
  }

  return videoHeader
}

export { newVideoHeader }
