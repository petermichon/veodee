export function newFlexRow(a: HTMLElement, b: HTMLElement): HTMLElement {
  const flex = document.createElement('div')
  // flexRow.className = 'flex flex-row'
  flex.style.display = 'flex'
  flex.style.flexDirection = 'row'

  flex.appendChild(a)

  flex.appendChild(b)

  return flex
}
