import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../api/reportsApi'
import { downloadFile } from '../utils/downloadFile'
import toast from 'react-hot-toast'

export function useFavoritesReport(params) {
  return useQuery({
    queryKey: ['reports', 'favorites', params],
    queryFn: () => reportsApi.getFavorites(params),
    initialData: [],
  })
}

export function useCategoriesReport(params) {
  return useQuery({
    queryKey: ['reports', 'categories', params],
    queryFn: () => reportsApi.getCategories(params),
    initialData: [],
  })
}

async function handleDownload(url, filename) {
  try {
    await downloadFile(url, filename)
  } catch (err) {
    toast.error(err?.message ?? 'Ошибка скачивания')
  }
}

export const downloadFavoritesXlsx  = () => handleDownload('/reports/favorites/xlsx',   'favorites.xlsx')
export const downloadFavoritesPdf   = () => handleDownload('/reports/favorites/pdf',    'favorites.pdf')
export const downloadCategoriesXlsx = () => handleDownload('/reports/categories/xlsx',  'categories.xlsx')
export const downloadCategoriesPdf  = () => handleDownload('/reports/categories/pdf',   'categories.pdf')
