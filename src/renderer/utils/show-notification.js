export default function showNotification (title, options, duration = 4000, clickCallback) {
  if (window.Notification && Notification.permission === 'granted') {
    const notification = new Notification(title, options)
    notification.onclick = function () {
      if (clickCallback) {
        clickCallback()
      }
    }

    const timer = setTimeout(() => {
      notification.close()
      clearTimeout(timer)
    }, duration)
  }
}
