import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, Upload } from 'lucide-react'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useUploadCategoryPhoto } from '../hooks/useCategories'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal, ConfirmModal } from '../components/ui/Modal'
import { Card } from '../components/ui/Card'
import { PageSpinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/features/EmptyState'
import { CATEGORY_COLORS, getCategoryColor } from '../utils/categoryColor'
import { getPhotoUrl } from '../utils/getPhotoUrl'

function ColorPicker({ value, onChange, t }) {
  return (
    <div>
      <label className="text-sm font-medium text-stone-700 dark:text-stone-300 block mb-2">
        {t('categories.color')}
        <span className="text-xs font-normal text-stone-400 ml-2">{t('categories.colorHint')}</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {/* Авто */}
        <button
          type="button"
          onClick={() => onChange('')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-all ${
            !value
              ? 'border-stone-500 bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200'
              : 'border-transparent bg-stone-100 dark:bg-stone-700 text-stone-500 hover:border-stone-300'
          }`}
        >
          {t('categories.colorAuto')}
        </button>
        {CATEGORY_COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            title={c.label}
            className={`w-8 h-8 rounded-full transition-all border-2 ${c.dot} ${
              value === c.id ? 'border-stone-700 dark:border-stone-200 scale-110' : 'border-transparent hover:scale-105'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export function CategoriesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: categories = [], isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()
  const uploadCategoryPhoto = useUploadCategoryPhoto()

  const [showCreate, setShowCreate] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const resetForm = () => {
    setName('')
    setColor('')
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  const handleCreate = () => {
    if (!name.trim()) return
    createCategory.mutate(
      { name: name.trim(), color: color || null },
      {
        onSuccess: async (created) => {
          if (photoFile) {
            await uploadCategoryPhoto.mutateAsync({ id: created.id, file: photoFile })
          }
          setShowCreate(false)
          resetForm()
        },
      }
    )
  }

  const handleEdit = () => {
    if (!name.trim() || !editItem) return
    updateCategory.mutate(
      { id: editItem.id, data: { name: name.trim(), color: color || null } },
      {
        onSuccess: async (updated) => {
          if (photoFile) {
            await uploadCategoryPhoto.mutateAsync({ id: updated.id ?? editItem.id, file: photoFile })
          }
          setEditItem(null)
          resetForm()
        },
      }
    )
  }

  const handleDelete = () => {
    if (!deleteId) return
    deleteCategory.mutate(deleteId, { onSuccess: () => setDeleteId(null) })
  }

  if (isLoading) return <PageSpinner />

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">{t('categories.title')}</h1>
        <Button onClick={() => { resetForm(); setShowCreate(true) }}>
          <Plus size={16} />
          {t('categories.add')}
        </Button>
      </div>

      {!categories?.length ? (
        <EmptyState
          type="categories"
          title={t('categories.noCategories')}
          description={t('categories.noCategoriesDesc')}
          action={
            <Button onClick={() => { resetForm(); setShowCreate(true) }}>
              <Plus size={16} />
              {t('categories.add')}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const c = getCategoryColor(cat.color, cat.name)
            return (
              <Card
                key={cat.id}
                className="p-4 cursor-pointer hover:ring-2 transition-all"
                style={{ '--tw-ring-color': 'transparent' }}
                onClick={() => navigate(`/?category_id=${cat.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden ${cat.photo_url ? '' : c.bg} flex items-center justify-center`}>
                      {cat.photo_url ? (
                        <img src={getPhotoUrl(cat.photo_url)} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className={`text-lg font-bold ${c.text}`}>
                          {cat.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-stone-800 dark:text-stone-100 truncate">{cat.name}</h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        {cat.recipes_count ?? 0} {t('categories.recipesCount')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setEditItem(cat); setName(cat.name); setColor(cat.color ?? ''); setPhotoFile(null); setPhotoPreview(getPhotoUrl(cat.photo_url) ?? null) }}
                    >
                      <Pencil size={15} className="text-stone-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(cat.id)}
                    >
                      <Trash2 size={15} className="text-red-400" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => { setShowCreate(false); resetForm() }}
        title={t('categories.add')}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => { setShowCreate(false); resetForm() }}>{t('categories.cancel')}</Button>
            <Button onClick={handleCreate} disabled={createCategory.isPending || uploadCategoryPhoto.isPending}>
              {t('categories.save')}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label={t('categories.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Название категории"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <ColorPicker value={color} onChange={setColor} t={t} />
          <div>
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300 block mb-1">
              Фото категории
            </label>
            {photoPreview ? (
              <div className="relative group">
                <img src={photoPreview} alt="preview" className="w-full h-32 object-cover rounded-xl" />
                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl cursor-pointer transition-opacity">
                  <Upload size={20} className="text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-600 cursor-pointer hover:border-orange-400 transition-colors">
                <Upload size={20} className="text-stone-400 mb-1" />
                <span className="text-xs text-stone-500">Загрузить фото</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            )}
          </div>
          {/* Preview */}
          {name && (
            <div>
              <label className="text-xs text-stone-500 dark:text-stone-400 block mb-1">Превью:</label>
              <div className="flex items-center gap-2">
                {(() => {
                  const c = getCategoryColor(color, name)
                  return (
                    <>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.bg}`}>
                        <span className={`text-sm font-bold ${c.text}`}>{name.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                        {name}
                      </span>
                    </>
                  )
                })()}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal
        isOpen={!!editItem}
        onClose={() => { setEditItem(null); resetForm() }}
        title={t('categories.edit')}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => { setEditItem(null); resetForm() }}>{t('categories.cancel')}</Button>
            <Button onClick={handleEdit} disabled={updateCategory.isPending || uploadCategoryPhoto.isPending}>
              {t('categories.save')}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label={t('categories.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
          />
          <ColorPicker value={color} onChange={setColor} t={t} />
          <div>
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300 block mb-1">
              Фото категории
            </label>
            {photoPreview ? (
              <div className="relative group">
                <img src={photoPreview} alt="preview" className="w-full h-32 object-cover rounded-xl" />
                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl cursor-pointer transition-opacity">
                  <Upload size={20} className="text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-600 cursor-pointer hover:border-orange-400 transition-colors">
                <Upload size={20} className="text-stone-400 mb-1" />
                <span className="text-xs text-stone-500">Загрузить фото</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            )}
          </div>
          {name && (
            <div>
              <label className="text-xs text-stone-500 dark:text-stone-400 block mb-1">Превью:</label>
              <div className="flex items-center gap-2">
                {(() => {
                  const c = getCategoryColor(color, name)
                  return (
                    <>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.bg}`}>
                        <span className={`text-sm font-bold ${c.text}`}>{name.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                        {name}
                      </span>
                    </>
                  )
                })()}
              </div>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={t('categories.confirmDelete')}
        description="Это действие нельзя отменить."
      />
    </div>
  )
}
