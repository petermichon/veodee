function newVideoCardElement(video: { id: string; time: string }): HTMLElement {
  const maxres = 'maxresdefault'
  const sd = 'sddefault'
  const hq = 'hqdefault'
  const mq = 'mqdefault'
  // const thumbnailUrl = `https://img.youtube.com/vi/${video.id}/${maxres}.jpg`
  const thumbnailUrl = `https://i.ytimg.com/vi_webp/${video.id}/${hq}.webp`

  const videoElem = document.createElement('a')
  videoElem.className =
    'relative overflow-hidden p-0 hover:scale-100 transition-all duration-180 md:rounded-lg bg-white text-black dark:bg-neutral-950 dark:text-white'

  let url = `/video?v=${video.id}`
  if (video.time != '0') {
    url += `&t=${video.time}`
  }
  videoElem.href = url

  const imgcontainer = document.createElement('div')
  imgcontainer.className =
    'rounded-md aspect-video relative bg-gray-50 dark:bg-neutral-800'
  videoElem.appendChild(imgcontainer)

  const textloading1 = document.createElement('div')
  textloading1.className =
    'h-12 my-2 rounded-lg bg-gray-200 dark:bg-neutral-800'
  videoElem.appendChild(textloading1)

  const authorloading = document.createElement('div')
  authorloading.className =
    'h-2 m-2 w-1/4 rounded-full animate-pulse bg-gray-200 dark:bg-neutral-800'
  videoElem.appendChild(authorloading)

  {
    const separator = document.createElement('div')
    separator.className = 'h-1 bg-gray-200 dark:bg-neutral-900'
    // sm:hidden
    // videoElem.appendChild(separator)
  }

  const data = fetchData(video)
  data.then((data) => {
    {
      const img = document.createElement('img')
      img.src = `https://i.ytimg.com/vi_webp/${video.id}/${maxres}.webp`
      img.onload = () => {
        const notFound = img.naturalWidth === 120
        if (notFound) {
          img.src = `https://i.ytimg.com/vi_webp/${video.id}/${sd}.webp`
          img.onload = () => {
            // ---
            // Other fallbacks
            // ---

            // Replace with remove hidden ?
            img.classList.add('opacity-100')
          }
          return
        }
        img.classList.add('opacity-100')
      }
      img.className =
        'sm:rounded-md relative w-full h-full aspect-video object-cover opacity-0 transition-opacity duration-0'
      img.loading = 'lazy'
      imgcontainer.appendChild(img)
    }

    {
      const img = document.createElement('img')
      img.src = thumbnailUrl
      img.className =
        'absolute inset-0 w-full h-full object-cover opacity-50 blur-3xl scale-80 saturate-1000 contrast-100 brightness-100 dark:contrast-20'
      // 'absolute inset-0 w-full h-full object-cover opacity-50 blur-3xl scale-100 saturate-200 contrast-100 brightness-100 dark:contrast-50'
      // 'absolute inset-0 w-full h-full object-cover opacity-100 blur-2xl scale-100 saturate-100 contrast-100 brightness-100 dark:contrast-100'

      img.loading = 'lazy'
      // videoElem.appendChild(img)
    }

    {
      const p = document.createElement('p')
      p.textContent = data.title
      p.className =
        'relative text-sm text-black line-clamp-2 items-center align-center m-2 z-1 min-h-[3rem] leading-[1.5rem] text-black dark:text-white'
      p.style = "font-family: 'Roboto', sans-serif"
      textloading1.replaceWith(p)
    }

    {
      const p = document.createElement('p')
      p.textContent = data.author_name
      p.className =
        'relative bottom-0 text-xs m-2 line-clamp-2 z-1 text-gray-500 dark:text-gray-400'
      p.style = "font-family: 'Roboto', sans-serif"
      p.style.cursor = 'pointer'
      authorloading.replaceWith(p)
    }

    videoElem.style.cursor = 'pointer'
  })

  return videoElem
}

async function fetchData(video: { id: string }): Promise<any> {
  const videoUrl = `https://www.youtube.com/watch?v=${video.id}`
  const oembedUrl = `https://www.youtube.com/oembed?url=${videoUrl}&format=json`

  try {
    const response = await fetch(oembedUrl)
    if (!response.ok) {
      return {}
    }
    const data = await response.json()
    return data
  } catch (error) {
    // console.error('Fetch failed:', error)
    return {}
  }
}

export { newVideoCardElement }
