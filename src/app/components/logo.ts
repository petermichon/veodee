export function newLogo(): HTMLElement {
  const logo = document.createElement('a')
  logo.className =
    'flex w-full h-full items-center justify-center cursor-pointer'

  logo.href = '/'

  {
    const img = document.createElement('img')
    img.className = 'w-7.5 h-7.5'
    img.src = './narval.png'
    logo.appendChild(img)
  }
  {
    const div2 = document.createElement('div')
    div2.className = 'text-2xl font-bold'
    div2.textContent = 'narval'
    div2.style = "font-family: 'Roboto', sans-serif"
    logo.appendChild(div2)
  }

  return logo
}
