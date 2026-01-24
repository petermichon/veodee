export function newMenuButton(
  icon: HTMLElement,
  text: HTMLElement
): HTMLButtonElement {
  const button = document.createElement('button')
  button.className =
    'flex flex-row text-left px-3 ml-3 mr-6 h-10 items-center rounded-lg cursor-pointer' // bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600
  {
    const wrapper = document.createElement('span')
    wrapper.className = 'flex flex-row h-9 mr-5.5'
    {
      wrapper.appendChild(icon)
    }
    button.appendChild(wrapper)
  }
  {
    button.appendChild(text)
  }

  return button
}
