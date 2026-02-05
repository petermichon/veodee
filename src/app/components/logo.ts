export function newLogo(): HTMLElement {
  const logo = document.createElement('a')
  logo.className = 'ml-4 flex w-full h-full items-center cursor-pointer'
  logo.href = '/'
  {
    const img = document.createElement('img')
    img.className = 'h-6'
    img.src = './logo-white.png'

    logo.appendChild(img)
  }
  return logo
}
