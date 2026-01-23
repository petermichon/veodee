export function newDefaultButton(): HTMLButtonElement {
  const button = document.createElement('button')
  button.className =
    'text-white font-bold px-4 py-1 rounded-3xl bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 cursor-pointer'
  button.style.fontFamily = "'Roboto', sans-serif"

  return button
}
