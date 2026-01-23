function newMenuPlayer(): HTMLButtonElement {
  const player = document.createElement('button')
  player.className =
    'text-left px-3 flex flex-row ml-3 mr-6 h-10 items-center rounded-lg cursor-pointer' // bg-neutral-950 hover:bg-neutral-800 active:bg-neutral-700

  {
    const icon = document.createElement('div')
    icon.className = 'w-16.5 text-2xl'
    icon.textContent = '➤'
    player.appendChild(icon)
  }
  {
    const text = document.createElement('div')
    text.className = 'w-full text-[13px] font-medium' // font-[700]
    text.textContent = 'Player'
    player.appendChild(text)
  }

  return player
}
