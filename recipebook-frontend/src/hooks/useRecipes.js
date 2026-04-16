import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recipesApi } from '../api/recipesApi'
import toast from 'react-hot-toast'

export function useRecipes(params) {
  return useQuery({
    queryKey: ['recipes', params],
    queryFn: () => recipesApi.getAll(params).then((d) => d ?? []),
    placeholderData: [],
  })
}

export function useRecipe(id) {
  return useQuery({
    queryKey: ['recipes', id],
    queryFn: () => recipesApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateRecipe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: recipesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipes'] })
      toast.success('Рецепт создан')
    },
    onError: (e) => toast.error(e.response?.data?.detail ?? 'Ошибка'),
  })
}

export function useUpdateRecipe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => recipesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipes'] })
      toast.success('Рецепт обновлён')
    },
    onError: (e) => toast.error(e.response?.data?.detail ?? 'Ошибка'),
  })
}

export function useDeleteRecipe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: recipesApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipes'] })
      toast.success('Рецепт удалён')
    },
    onError: (e) => toast.error(e.response?.data?.detail ?? 'Ошибка'),
  })
}

export function useUploadPhoto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }) => recipesApi.uploadPhoto(id, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipes'] })
    },
    onError: (e) => toast.error(e.response?.data?.detail ?? 'Ошибка загрузки фото'),
  })
}
