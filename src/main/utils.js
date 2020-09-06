import { screen } from 'electron'

export function moveWindowToCenter (winWidth, winHeight) {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const x = parseInt((width - winWidth) / 2, 10)
  const y = parseInt((height - winHeight) / 2, 10)
  return {
    x,
    y
  }
}
