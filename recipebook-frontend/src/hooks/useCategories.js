import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesApi } from '../api/categoriesApi'
import toast from 'react-hot-toast'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then((d) => d ?? []),
    placeholderData: [],
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Категория создана')
    },
    onError: (e) => toast.error(e.response?.data?.detail ?? 'Ошибка'),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => categoriesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Категория обновлена')
    },
    onError: (e) => toast.error(e.response?.data?.detail ?? 'Ошибка'),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: categoriesApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Категория удалена')
    },
    onError: (e) => toast.error(e.response?.data?.detail ?? 'Ошибка'),
  })
}

export function useUploadCategoryPhoto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }) => categoriesApi.uploadPhoto(id, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (e) => toast.error(e.response?.data?.detail ?? 'Ошибка загрузки фото'),
  })
}
