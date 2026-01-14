function newShareButton(textToCopy: string): HTMLElement {
  const copyButton = document.createElement('button')

  copyButton.className =
    'text-white font-bold px-4 py-1 rounded-3xl bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600'
  copyButton.style.fontFamily = "'Roboto', sans-serif"

  copyButton.textContent = 'Share'

  // Add click event listener
  copyButton.addEventListener('click', () => {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {})
      .catch((err) => {
        console.error('Clipboard copy failed:', err)
      })
  })

  return copyButton
}

export { newShareButton }
