function newTopBar() {
  const topBarElem = document.createElement('div')
  topBarElem.className =
    'flex p-3 bg-white text-black dark:bg-neutral-950 dark:text-white'

  {
    const logo = document.createElement('a')
    logo.className = 'flex cursor-pointer'

    logo.href = '/'

    // logo.onclick = () => {
    //   // console.log(globalThis.location.href)
    //   return
    // }

    logo.addEventListener('click', (e) => {
      if (e.button === 0) {
        e.preventDefault()
      }

      const customEvent = new CustomEvent('logo-click')

      topBarElem.dispatchEvent(customEvent)
    })
    // topBarElem.appendChild(logo)

    {
      const img = document.createElement('img')
      img.className = 'w-9 h-9 ml-4 mr-1'
      img.src = './narval.png'
      logo.appendChild(img)
    }
    {
      const div2 = document.createElement('div')
      div2.className = 'text-3xl font-bold pr-3 font-sans hidden lg:block'
      div2.textContent = 'narval'
      div2.style = "font-family: 'Roboto', sans-serif"
      logo.appendChild(div2)
    }
  }

  return topBarElem
}

export { newTopBar }
