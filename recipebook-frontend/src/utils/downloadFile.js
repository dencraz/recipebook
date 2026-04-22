import api from '../api/axiosInstance'

/**
 * Download a file from the backend.
 * On HTTP error the response body (JSON {detail: "..."}) is read and
 * the detail message is thrown so callers can show it via toast.
 */
export async function downloadFile(url, filename) {
  let response
  try {
    response = await api.get(url, { responseType: 'blob' })
  } catch (err) {
    // Axios wraps non-2xx responses as errors; the body is a Blob.
    const blob = err?.response?.data
    if (blob instanceof Blob) {
      try {
        const text = await blob.text()
        const json = JSON.parse(text)
        throw new Error(json.detail ?? 'Ошибка скачивания файла')
      } catch (parseErr) {
        if (parseErr instanceof Error && parseErr.message !== 'Ошибка скачивания файла') {
          throw new Error('Ошибка скачивания файла')
        }
        throw parseErr
      }
    }
    throw new Error('Ошибка скачивания файла')
  }

  const href = URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(href)
}
