import { useEffect, useState } from 'react'
import { useEditorStore } from '../../store/editorStore'

export function EditorStatusBar() {
    const { editor } = useEditorStore()
    const [, forceRerender] = useState(0)

    useEffect(() => {
        if (!editor) return
        const rerender = () => forceRerender((n) => n + 1)
        editor.on('update', rerender)
        return () => editor.off('update', rerender)
    }, [editor])

    if (!editor || !editor.storage.characterCount) return null

    const characters = editor.storage.characterCount.characters()
    const words = editor.storage.characterCount.words()

    return (
        <div className="flex-shrink-0 border-t border-gray-200 bg-white">
            <div className="max-w-[850px] mx-auto px-4 sm:px-6 py-1.5 text-xs text-gray-400 flex items-center justify-end gap-3">
                <span>{words.toLocaleString()} {words === 1 ? 'word' : 'words'}</span>
                <span className="text-gray-200">·</span>
                <span>{characters.toLocaleString()} {characters === 1 ? 'character' : 'characters'}</span>
            </div>
        </div>
    )
}
