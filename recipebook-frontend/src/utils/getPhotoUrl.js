export function getPhotoUrl(url) {
  if (!url) return null
  // Абсолютные URL оставляем как есть
  if (url.startsWith('http')) return url
  // Относительные пути (/uploads/...) отдаёт Nginx-прокси — используем как есть
  return url
}
