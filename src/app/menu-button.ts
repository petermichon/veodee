export function newMenuButton(
  icon: HTMLElement,
  text: HTMLElement
): HTMLButtonElement {
  const button = document.createElement('button')
  button.className =
    'text-left px-3 flex flex-row ml-3 mr-6 h-10 items-center rounded-lg cursor-pointer' // bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600
  {
    // const icon = document.createElement('div')
    // icon.className = 'w-16.5 text-2xl'
    // icon.textContent = '➤'
    button.appendChild(icon)
  }
  {
    // const text = document.createElement('div')
    // text.className = 'w-full text-[13px] font-medium' // font-[700]
    // text.textContent = 'Collections'
    button.appendChild(text)
  }

  return button
}
