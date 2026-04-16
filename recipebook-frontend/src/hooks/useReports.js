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

export async function downloadFavoritesXlsx() {
  try {
    await downloadFile('/reports/favorites/xlsx', 'favorites.xlsx')
  } catch {
    toast.error('Ошибка скачивания')
  }
}

export async function downloadFavoritesPdf() {
  try {
    await downloadFile('/reports/favorites/pdf', 'favorites.pdf')
  } catch {
    toast.error('Ошибка скачивания')
  }
}

export async function downloadCategoriesXlsx() {
  try {
    await downloadFile('/reports/categories/xlsx', 'categories.xlsx')
  } catch {
    toast.error('Ошибка скачивания')
  }
}

export async function downloadCategoriesPdf() {
  try {
    await downloadFile('/reports/categories/pdf', 'categories.pdf')
  } catch {
    toast.error('Ошибка скачивания')
  }
}
