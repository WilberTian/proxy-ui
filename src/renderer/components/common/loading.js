export function showLoading () {
  const loadingEl = document.querySelector('.loading-view')
  if (loadingEl) {
    loadingEl.style.display = 'block'
  }
}

export function closeLoading () {
  const loadingEl = document.querySelector('.loading-view')
  if (loadingEl) {
    loadingEl.style.display = 'none'
  }
}
