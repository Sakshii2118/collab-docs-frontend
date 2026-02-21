import { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { useAuthStore } from '../../store/authStore'
import { useEditorStore } from '../../store/editorStore'
import { generateUserColor } from '../../utils/colors'
import { WS_URL } from '../../utils/constants'
import { Spinner } from '../common/Spinner'

export function TipTapEditor({ documentId, yjsRoomId, role }) {
    const { user } = useAuthStore()
    const { setEditor, setYjsProvider, setConnectionStatus, cleanup } = useEditorStore()
    const [ydoc] = useState(() => new Y.Doc())
    const [isReady, setIsReady] = useState(false)

    const isEditable = role === 'OWNER' || role === 'EDITOR'

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ history: false }),
            Placeholder.configure({ placeholder: 'Start typing your document here...' }),
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Highlight,
            Link.configure({ openOnClick: false }),
            Collaboration.configure({ document: ydoc }),
            CollaborationCursor.configure({
                provider: null, // injected after provider connects
                user: {
                    name: user ? `${user.firstName} ${user.lastName}` : 'Anonymous',
                    color: generateUserColor(user?.id),
                },
            }),
        ],
        editable: isEditable,
        editorProps: {
            attributes: {
                class: 'focus:outline-none min-h-[80vh]',
                spellcheck: 'true',
            },
        },
    })

    useEffect(() => {
        if (!editor) return

        // Read JWT from cookie
        const jwt = document.cookie
            .split('; ')
            .find((row) => row.startsWith('jwt='))
            ?.split('=')[1]

        const wsUrl = WS_URL + '/ws/yjs'

        const provider = new WebsocketProvider(wsUrl, yjsRoomId, ydoc, {
            params: jwt ? { token: jwt } : {},
        })

        // Inject provider into collaboration cursor extension
        const cursorExt = editor.extensionManager.extensions.find(
            (ext) => ext.name === 'collaborationCursor'
        )
        if (cursorExt) {
            cursorExt.options.provider = provider
        }

        provider.on('status', ({ status }) => {
            setConnectionStatus(status)
        })

        provider.on('sync', (isSynced) => {
            if (isSynced) setIsReady(true)
        })

        // Also set ready after a timeout in case there's no sync event
        const readyTimeout = setTimeout(() => setIsReady(true), 2000)

        setEditor(editor)
        setYjsProvider(provider)

        return () => {
            clearTimeout(readyTimeout)
            provider.disconnect()
            cleanup()
        }
    }, [editor, yjsRoomId])

    if (!isReady) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <Spinner size="lg" color="primary" />
                <p className="mt-4 text-sm">Connecting to document...</p>
            </div>
        )
    }

    return (
        <div className={`max-w-[750px] mx-auto ${!isEditable ? 'select-none' : ''}`}>
            {!isEditable && (
                <div className="mb-4 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 flex items-center gap-2">
                    <span>🔒</span> You have read-only access to this document.
                </div>
            )}
            <EditorContent editor={editor} />
        </div>
    )
}
