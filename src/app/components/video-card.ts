function newVideoCardElement(video: { id: string; time: string }): HTMLElement {
  const urlParam = `https://www.youtube.com/watch?v=${video.id}&format=json`
  const oembedUrl = `https://www.youtube.com/oembed?url=${urlParam}`
  const thumbnailUrl = `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`

  // const thumbnailUrl = ``;
  // mqdefault.jpg
  // hqdefault.jpg
  // sddefault.jpg
  // maxresdefault.jpg
  // https://i.ytimg.com/vi_webp/6VgKYd0JWq4/maxresdefault.webp

  const videoElem = document.createElement('a')
  videoElem.className =
    'relative overflow-hidden bg-white p-0 hover:scale-100 transition-all duration-180 md:rounded-lg bg-white text-black dark:bg-neutral-950 dark:text-white'

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
    videoElem.appendChild(separator)
  }

  fetch(oembedUrl)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      return res.json()
    })
    .then((data) => {
      {
        const img = document.createElement('img')
        img.src = thumbnailUrl
        img.className =
          'sm:rounded-md relative w-full h-full aspect-video object-cover opacity-0 transition-opacity duration-500 z-1'
        img.loading = 'lazy'
        img.onload = () => {
          img.classList.add('opacity-100')
        }
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
        videoElem.appendChild(img)
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

      videoElem.addEventListener('click', () => {
        const event = new CustomEvent('video-click', {
          detail: { video: video },
        })

        videoElem.dispatchEvent(event)
      })
    })

  return videoElem
}

export { newVideoCardElement }
