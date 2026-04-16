import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'

export function Modal({ isOpen, onClose, title, children, footer }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-stone-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col z-10">
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-700">
          <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="p-4 border-t border-stone-200 dark:border-stone-700">{footer}</div>
        )}
      </div>
    </div>
  )
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, description }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button variant="danger" onClick={onConfirm}>Удалить</Button>
        </div>
      }
    >
      <p className="text-stone-600 dark:text-stone-400">{description}</p>
    </Modal>
  )
}
