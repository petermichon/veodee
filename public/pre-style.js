(() => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const effectiveTheme = prefersDark ? 'dark' : 'light';
  document.documentElement.classList.add(effectiveTheme);
  document.documentElement.style.backgroundColor = prefersDark ? 'hsl(0 0% 5%)' : 'hsl(0 0% 100%)';
})();
