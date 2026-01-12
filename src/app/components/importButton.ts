export function newImportButton(): HTMLElement {
  const button = document.createElement('button')
  button.textContent = '➤ Import'
  button.className =
    'text-white text-sm font-medium px-4 py-2 rounded-lg bg-neutral-950 hover:bg-neutral-800 active:bg-neutral-700 cursor-pointer'

  {
    const input = newInput()
    button.addEventListener('click', () => {
      input.click()
    })
    button.appendChild(input)
  }

  return button
}

function newInput(): HTMLInputElement {
  const input = document.createElement('input')
  input.type = 'file'
  // input.multiple = true
  input.className = 'hidden'
  input.style.fontFamily = "'Roboto', sans-serif"
  // input.textContent = 'Import'

  input.addEventListener('change', (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()

    reader.onload = (event: ProgressEvent<FileReader>) => {
      const text = event.target!.result as string
      // console.log('File contents:', text)
      // Replace videos
      localStorage.setItem('videos', text)
    }

    // Optional: handle errors
    reader.onerror = (event: ProgressEvent<FileReader>) => {
      console.error('Error reading file')
    }

    // Read the file as text (you can also use readAsDataURL, readAsArrayBuffer, etc.)
    reader.readAsText(file)
  })

  return input
}
