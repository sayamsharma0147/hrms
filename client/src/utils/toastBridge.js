let toastHandler = null

export const setToastHandler = (handler) => {
  toastHandler = handler
}

export const notifyError = (message) => {
  if (toastHandler) {
    toastHandler(message || 'Something went wrong', 'error')
  }
}
