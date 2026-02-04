type VideoData = {
  title: string
  author_name: string
  author_url: string
  thumbnail_url: string
}

function newVideoCardElement(video: { id: string; time: string }): HTMLElement {
  const maxres = 'maxresdefault'
  const sd = 'sddefault'
  const hq = 'hqdefault'
  const mq = 'mqdefault'
  // const thumbnailUrl = `https://img.youtube.com/vi/${video.id}/${maxres}.jpg`
  // const thumbnailUrl = `https://i.ytimg.com/vi_webp/${video.id}/${hq}.webp`

  const videoElem = document.createElement('a')
  videoElem.className =
    'flex flex-col sm:w-52.5 overflow-hidden md:rounded-lg bg-neutral-950' //  aspect-square
  // videoElem.style.display = 'flex'

  let url = `/video?v=${video.id}`
  if (video.time != '0') {
    url += `&t=${video.time}`
  }
  videoElem.href = url

  {
    const imgcontainer = document.createElement('div')
    imgcontainer.className =
      'rounded-md bg-gray-50 dark:bg-neutral-800 aspect-video'
    videoElem.appendChild(imgcontainer)

    const videoCardHeader = document.createElement('div')
    videoCardHeader.className = 'flex flex-col gap-2  h-20 py-2 mr-2' // p-2
    videoElem.appendChild(videoCardHeader)
    {
      const textloading1 = document.createElement('div')
      textloading1.className = 'h-14 rounded-lg bg-gray-200 dark:bg-neutral-950' // dark:bg-neutral-800
      videoCardHeader.appendChild(textloading1)

      const authorloading = document.createElement('div')
      authorloading.className =
        'h-0 w-20 rounded-full bg-gray-200 dark:bg-neutral-800' // animate-pulse
      videoCardHeader.appendChild(authorloading)

      const data = fetchData(video)
      data.then((data: VideoData) => {
        {
          const p = document.createElement('p')
          p.textContent = data.title
          p.className = 'text-sm line-clamp-2 items-center align-center' // leading-tight min-h-[3rem] leading-[1.5rem]
          // p.style = "font-family: 'Roboto', sans-serif"
          textloading1.replaceWith(p)
        }

        {
          const p = document.createElement('p')
          p.textContent = data.author_name
          p.className = 'text-xs line-clamp-1 text-gray-500 dark:text-gray-400'
          // p.style = "font-family: 'Roboto', sans-serif"
          p.style.cursor = 'pointer'
          authorloading.replaceWith(p)
        }

        {
          const img = document.createElement('img')
          // img.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`
          img.src = data.thumbnail_url
          img.className =
            'aspect-video object-cover w-full opacity-0 transition-opacity duration-200'
          img.onload = () => {
            img.classList.remove('opacity-0')
            // img.classList.add('opacity-100')
          }
          img.loading = 'lazy'
          imgcontainer.appendChild(img)
        }

        // videoElem.style.cursor = 'pointer'
      })
    }

    // Force max resolution, fallback if not found
    // {
    //   const img = document.createElement('img')
    //   img.src = `https://i.ytimg.com/vi_webp/${video.id}/${maxres}.webp`
    //   img.onload = () => {
    //     // Ugly detection of not found picture
    //     const notFound = img.naturalWidth === 120
    //     if (notFound) {
    //       img.src = `https://i.ytimg.com/vi_webp/${video.id}/${sd}.webp`
    //       img.onload = () => {
    //         // ---
    //         // Other fallbacks
    //         // ---
    //         // Replace with remove hidden ?
    //         img.classList.remove('opacity-0')
    //         // img.classList.add('opacity-100')
    //       }
    //       return
    //     }
    //     img.classList.remove('opacity-0')
    //     // img.classList.add('opacity-100')
    //   }
    //   img.className =
    //     'sm:rounded-md relative w-full h-full aspect-video object-cover opacity-0 transition-opacity duration-180'
    //   img.loading = 'lazy'
    //   imgcontainer.appendChild(img)
    // }

    {
      const img = document.createElement('img')
      // img.src = thumbnailUrl
      img.src = 'https://i.ytimg.com/vi/_YLk0kJ3Naw/hqdefault.jpg'
      img.className =
        'absolute inset-0 w-full h-full object-cover opacity-50 blur-3xl scale-80 saturate-1000 contrast-100 brightness-100 dark:contrast-20'
      // 'absolute inset-0 w-full h-full object-cover opacity-50 blur-3xl scale-100 saturate-200 contrast-100 brightness-100 dark:contrast-50'
      // 'absolute inset-0 w-full h-full object-cover opacity-100 blur-2xl scale-100 saturate-100 contrast-100 brightness-100 dark:contrast-100'

      img.loading = 'lazy'
      // videoElem.appendChild(img)
    }

    {
      const separator = document.createElement('div')
      separator.className = 'h-1 bg-gray-200 dark:bg-neutral-900 sm:hidden'
      // sm:hidden
      // videoElem.appendChild(separator)
    }
  }

  return videoElem
}

async function fetchData(video: { id: string }): Promise<any> {
  const videoUrl = `https://www.youtube.com/watch?v=${video.id}`
  const oembedUrl = `https://www.youtube.com/oembed?url=${videoUrl}&format=json`

  try {
    const response = await fetch(oembedUrl)
    if (!response.ok) {
      const v: VideoData = {
        title: '',
        author_name: '',
        author_url: '',
        thumbnail_url: '',
      }
      return v
      // return {}
    }
    const data: VideoData = await response.json()
    return data
  } catch (error) {
    // console.error('Fetch failed:', error)
    return {}
  }
}

export { newVideoCardElement }
