// function newShareButton(textToCopy: string): HTMLElement {
function newShareButton(): HTMLButtonElement {
  const copyButton = document.createElement('button')

  copyButton.className =
    'text-white font-bold px-4 py-1 rounded-3xl bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600'
  copyButton.style.fontFamily = "'Roboto', sans-serif"

  copyButton.textContent = 'Share'

  // Add click event listener
  copyButton.addEventListener('click', () => {
    const url = globalThis.document.location.href
    navigator.clipboard
      // .writeText(textToCopy)
      .writeText(url)
      .then(() => {})
      .catch((err) => {
        console.error('Clipboard copy failed:', err)
      })
  })

  return copyButton
}

export { newShareButton }
