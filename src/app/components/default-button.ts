export function newDefaultButton(): HTMLButtonElement {
  const button = document.createElement('button')
  button.className =
    'h-9 text-[13px] font-bold px-4 rounded-3xl bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 cursor-pointer '
  // button.style.fontFamily = 'sans-serif' // 'sans-serif'
  // py-1
  // text-[13px] font-medium
  return button
}
