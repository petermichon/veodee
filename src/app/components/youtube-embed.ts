function newYoutubeEmbed(video: { id: string; time: string }): HTMLElement {
  // const embedContainer = document.createElement('div')
  // embedContainer.className = 'w-full aspect-video lg:aspect-[2.15/1] bg-black'

  // {
  // const url = `https://www.youtube.com/embed/${video.id}?start=${video.time}`
  const url = `https://www.youtube-nocookie.com/embed/${video.id}?start=${video.time}`
  // let url = `https://www.youtube-nocookie.com/embed/${video.id}`
  // if (video.time != '0') {
  //   url += `?start=${video.time}`
  // }

  // const url = ``
  // ?start=90&autoplay=1&controls=0&mute=1&loop=1&playlist=${video.id}
  const iframe = document.createElement('iframe')
  iframe.sandbox = 'allow-presentation allow-same-origin allow-scripts' // allow-presentation ?
  iframe.allow = 'clipboard-write'
  iframe.style.margin = '0px'
  iframe.style.padding = '0px'
  // iframe.width = '560'
  // iframe.height = '315'
  iframe.src = url
  // iframe.frameBorder = '0'
  iframe.allowFullscreen = true
  iframe.referrerPolicy = 'strict-origin-when-cross-origin'
  iframe.className = 'w-full h-full'

  iframe.addEventListener('load', () => {
    // console.log('iframe loaded')
  })

  // embedContainer.appendChild(iframe)
  // }

  return iframe
  // return embedContainer
}

export { newYoutubeEmbed }
