import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Modal } from './Modal'
import { Button } from './Button'

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = 'Are you sure?',
    description = 'This action cannot be undone.',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    danger = false,
    loading = false,
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className={`p-2 rounded-full ${danger ? 'bg-red-100' : 'bg-yellow-100'}`}>
                        <ExclamationTriangleIcon className={`w-6 h-6 ${danger ? 'text-red-600' : 'text-yellow-600'}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6">{description}</p>
                <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={danger ? 'danger' : 'primary'}
                        onClick={onConfirm}
                        loading={loading}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
