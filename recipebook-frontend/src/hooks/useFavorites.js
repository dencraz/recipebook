import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { favoritesApi } from '../api/favoritesApi'
import toast from 'react-hot-toast'

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesApi.getAll().then((d) => d ?? []),
    placeholderData: [],
  })
}

export function useAddFavorite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: favoritesApi.add,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['favorites'] })
    },
    onError: (e) => toast.error(e.response?.data?.detail ?? 'Ошибка'),
  })
}

export function useRemoveFavorite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: favoritesApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['favorites'] })
    },
    onError: (e) => toast.error(e.response?.data?.detail ?? 'Ошибка'),
  })
}
