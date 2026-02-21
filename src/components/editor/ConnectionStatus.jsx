import { useEditorStore } from '../../store/editorStore'
import { CheckCircleIcon, ExclamationCircleIcon, WifiIcon } from '@heroicons/react/24/solid'

export function ConnectionStatus() {
    const { connectionStatus, isSaving } = useEditorStore()

    if (isSaving) {
        return (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="w-3 h-3 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
                Saving...
            </div>
        )
    }

    if (connectionStatus === 'connected') {
        return (
            <div className="flex items-center gap-1.5 text-xs text-green-600">
                <CheckCircleIcon className="w-3.5 h-3.5" />
                Saved
            </div>
        )
    }

    if (connectionStatus === 'disconnected') {
        return (
            <div className="flex items-center gap-1.5 text-xs text-red-500">
                <ExclamationCircleIcon className="w-3.5 h-3.5" />
                Disconnected
            </div>
        )
    }

    return (
        <div className="flex items-center gap-1.5 text-xs text-amber-500">
            <WifiIcon className="w-3.5 h-3.5 animate-pulse" />
            Connecting...
        </div>
    )
}
