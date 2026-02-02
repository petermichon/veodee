type Video = { id: string; time: string }

export function addVideo(video: { id: string; time: string }) {
  const storageVideos = globalThis.localStorage.getItem('videos') || '[]'
  const videos: Video[] = JSON.parse(storageVideos)
  videos.push(video)
  // videos.push({ id: 'hFOkrLuf94M', time: '0' })
  // videos.push({ id: 'saVzevTylc4', time: '0' })
  globalThis.localStorage.setItem('videos', JSON.stringify(videos))
}
