export function newMenuButton(
  icon: HTMLElement,
  text: HTMLElement
): HTMLButtonElement {
  const button = document.createElement('button')
  button.className =
    'flex flex-row gap-3 text-left h-10 items-center justify-center rounded-lg cursor-pointer'
  {
    button.appendChild(icon)
  }
  {
    button.appendChild(text)
  }

  return button
}
