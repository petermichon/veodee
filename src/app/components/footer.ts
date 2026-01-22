function newFooter(): HTMLDivElement {
  const footer = document.createElement('div')
  footer.className = 'h-full bg-white dark:bg-neutral-950'

  return footer
}

export { newFooter }
