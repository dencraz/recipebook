import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, ChevronLeft, Upload } from 'lucide-react'
import { useRecipe, useCreateRecipe, useUpdateRecipe, useUploadPhoto } from '../hooks/useRecipes'
import { getPhotoUrl } from '../utils/getPhotoUrl'
import { useCategories } from '../hooks/useCategories'
import { Button } from '../components/ui/Button'
import { Input, Textarea, Select } from '../components/ui/Input'
import { PageSpinner } from '../components/ui/Spinner'

const recipeSchema = z.object({
  title: z.string().min(2, 'Минимум 2 символа').max(100),
  description: z.string().max(500).optional(),
  category_id: z.any().nullable().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  cook_time: z.coerce.number().min(1).max(1440),
  ingredients: z
    .array(z.object({ name: z.string().min(1, 'Заполните'), amount: z.string().min(1, 'Заполните') }))
    .min(1, 'Добавьте хотя бы один ингредиент'),
  steps: z
    .array(z.object({ description: z.string().min(1, 'Заполните') }))
    .min(1, 'Добавьте хотя бы один шаг'),
})

export function RecipeFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)

  const { data: recipe, isLoading: loadingRecipe } = useRecipe(id)
  const { data: categories = [] } = useCategories()
  const createRecipe = useCreateRecipe()
  const updateRecipe = useUpdateRecipe()
  const uploadPhoto = useUploadPhoto()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: '',
      description: '',
      category_id: null,
      difficulty: 'easy',
      cook_time: 30,
      ingredients: [{ name: '', amount: '' }],
      steps: [{ description: '' }],
    },
  })

  const { fields: ingredientFields, append: addIngredient, remove: removeIngredient } =
    useFieldArray({ control, name: 'ingredients' })

  const { fields: stepFields, append: addStep, remove: removeStep } =
    useFieldArray({ control, name: 'steps' })

  useEffect(() => {
    if (recipe && isEdit) {
      reset({
        title: recipe.title,
        description: recipe.description ?? '',
        category_id: recipe.category_id ?? null,
        difficulty: recipe.difficulty,
        cook_time: recipe.cook_time,
        ingredients: recipe.ingredients?.length ? recipe.ingredients : [{ name: '', amount: '' }],
        steps: recipe.steps?.length ? recipe.steps : [{ description: '' }],
      })
      if (recipe.photo_url) setPhotoPreview(getPhotoUrl(recipe.photo_url))
    }
  }, [recipe, isEdit, reset])

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      category_id: data.category_id ? Number(data.category_id) : null,
    }

    if (isEdit) {
      updateRecipe.mutate(
        { id, data: payload },
        {
          onSuccess: async (updated) => {
            if (photoFile) {
              await uploadPhoto.mutateAsync({ id: updated.id ?? id, file: photoFile })
            }
            navigate(`/recipes/${id}`)
          },
        }
      )
    } else {
      createRecipe.mutate(payload, {
        onSuccess: async (created) => {
          if (photoFile) {
            await uploadPhoto.mutateAsync({ id: created.id, file: photoFile })
          }
          navigate(`/recipes/${created.id}`)
        },
      })
    }
  }

  if (isEdit && loadingRecipe) return <PageSpinner />

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto">
      <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
        <ChevronLeft size={18} />
        Назад
      </Button>

      <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6">
        {isEdit ? 'Редактировать рецепт' : t('recipe.new')}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Photo upload */}
        <div>
          <label className="text-sm font-medium text-stone-700 dark:text-stone-300 block mb-1">
            {t('recipe.photo')}
          </label>
          <div className="relative">
            {photoPreview ? (
              <div className="relative group">
                <img
                  src={photoPreview}
                  alt="preview"
                  className="w-full h-48 object-cover rounded-xl"
                />
                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl cursor-pointer transition-opacity">
                  <Upload size={24} className="text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-36 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-600 cursor-pointer hover:border-orange-400 transition-colors">
                <Upload size={24} className="text-stone-400 mb-2" />
                <span className="text-sm text-stone-500">Загрузить фото</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            )}
          </div>
        </div>

        <Input
          label={t('recipe.title')}
          placeholder="Название рецепта"
          error={errors.title?.message}
          {...register('title')}
        />

        <Textarea
          label={t('recipe.description')}
          placeholder="Краткое описание..."
          rows={3}
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label={t('recipe.category')}
            error={errors.category_id?.message}
            {...register('category_id')}
          >
            <option value="">{t('recipe.noCategory')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>

          <Select
            label={t('recipe.difficulty')}
            error={errors.difficulty?.message}
            {...register('difficulty')}
          >
            <option value="easy">{t('recipe.easy')}</option>
            <option value="medium">{t('recipe.medium')}</option>
            <option value="hard">{t('recipe.hard')}</option>
          </Select>

          <Input
            label={`${t('recipe.cookTime')} (мин)`}
            type="number"
            min={1}
            max={1440}
            error={errors.cook_time?.message}
            {...register('cook_time')}
          />
        </div>

        {/* Ingredients */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
              {t('recipe.ingredients')}
            </label>
          </div>
          {errors.ingredients?.message && (
            <p className="text-xs text-red-500 mb-2">{errors.ingredients.message}</p>
          )}
          <div className="flex flex-col gap-2">
            {ingredientFields.map((field, i) => (
              <div key={field.id} className="flex gap-2">
                <input
                  placeholder={t('recipe.ingredientName')}
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  {...register(`ingredients.${i}.name`)}
                />
                <input
                  placeholder={t('recipe.ingredientAmount')}
                  className="w-28 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  {...register(`ingredients.${i}.amount`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeIngredient(i)}
                  disabled={ingredientFields.length === 1}
                >
                  <Trash2 size={16} className="text-red-400" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => addIngredient({ name: '', amount: '' })}
          >
            <Plus size={14} />
            {t('recipe.addIngredient')}
          </Button>
        </div>

        {/* Steps */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
              {t('recipe.steps')}
            </label>
          </div>
          {errors.steps?.message && (
            <p className="text-xs text-red-500 mb-2">{errors.steps.message}</p>
          )}
          <div className="flex flex-col gap-2">
            {stepFields.map((field, i) => (
              <div key={field.id} className="flex gap-2 items-start">
                <span className="flex-shrink-0 w-7 h-7 mt-1.5 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <textarea
                  rows={2}
                  placeholder={t('recipe.stepDescription')}
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                  {...register(`steps.${i}.description`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeStep(i)}
                  disabled={stepFields.length === 1}
                  className="mt-1"
                >
                  <Trash2 size={16} className="text-red-400" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => addStep({ description: '' })}
          >
            <Plus size={14} />
            {t('recipe.addStep')}
          </Button>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
            {t('recipe.cancel')}
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={createRecipe.isPending || updateRecipe.isPending}
          >
            {createRecipe.isPending || updateRecipe.isPending ? 'Сохранение...' : t('recipe.save')}
          </Button>
        </div>
      </form>
    </div>
  )
}
