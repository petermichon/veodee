type Video = { id: string; time: string }

export function newAddVideoButton(): HTMLButtonElement {
  const button = document.createElement('button')
  button.className =
    'text-white font-bold px-4 py-1 rounded-3xl bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 cursor-pointer'
  button.style.fontFamily = "'Roboto', sans-serif"
  button.textContent = 'Add video'
  button.addEventListener('click', () => {
    const videoId = prompt('Enter video ID')
    if (videoId) {
      addVideo({ id: videoId, time: '0' })
    }
  })
  return button
}

function addVideo(video: { id: string; time: string }) {
  const storageVideos = localStorage.getItem('videos') || '[]'
  const videos: Video[] = JSON.parse(storageVideos)
  videos.push(video)
  // videos.push({ id: 'hFOkrLuf94M', time: '0' })
  // videos.push({ id: 'saVzevTylc4', time: '0' })
  localStorage.setItem('videos', JSON.stringify(videos))
}
