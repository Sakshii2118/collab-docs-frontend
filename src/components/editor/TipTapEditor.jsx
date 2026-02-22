import { useEffect, useRef, useState } from 'react'
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

/**
 * Read the JWT token from the browser's cookie jar.
 * The backend sets it as an HttpOnly cookie named "jwt"
 * (HttpOnly means JS can't read it directly in production,
 * but in dev mode secure=false so it's readable).
 */
function getJwtFromCookie() {
    return (
        document.cookie
            .split('; ')
            .find((row) => row.startsWith('jwt='))
            ?.split('=')[1] ?? null
    )
}

export function TipTapEditor({ documentId, yjsRoomId, role }) {
    const { user } = useAuthStore()
    const { setEditor, setYjsProvider, setConnectionStatus, cleanup } = useEditorStore()
    const [isReady, setIsReady] = useState(false)
    const providerRef = useRef(null)

    // ── 1. Create ydoc once (stable across re-renders) ──────────────────────
    const [ydoc] = useState(() => new Y.Doc())

    // ── 2. Create WebsocketProvider BEFORE useEditor so CollaborationCursor
    //       receives a real provider, not null. TipTap calls
    //       provider.awareness synchronously inside addProseMirrorPlugins().
    //
    //       We use a ref so it's stable, and a useState initializer so it's
    //       created exactly once per mount. ───────────────────────────────────
    const [provider] = useState(() => {
        const jwt = getJwtFromCookie()
        const wsBase = WS_URL + '/ws/yjs'
        const p = new WebsocketProvider(wsBase, yjsRoomId, ydoc, {
            params: jwt ? { token: jwt } : {},
        })
        providerRef.current = p
        return p
    })

    const isEditable = role === 'OWNER' || role === 'EDITOR'

    const userName = user ? `${user.firstName} ${user.lastName}` : 'Anonymous'
    const userColor = generateUserColor(user?.id)

    // ── 3. Create editor with a real provider passed to CollaborationCursor ──
    const editor = useEditor({
        extensions: [
            StarterKit.configure({ history: false }),
            Placeholder.configure({ placeholder: 'Start typing your document here...' }),
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Highlight,
            Link.configure({ openOnClick: false }),
            Collaboration.configure({ document: ydoc }),
            // provider is now guaranteed non-null — created above before this call
            CollaborationCursor.configure({
                provider,
                user: { name: userName, color: userColor },
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

    // ── 4. Wire up provider events and store references ──────────────────────
    useEffect(() => {
        if (!editor || !provider) return

        const handleStatus = ({ status }) => setConnectionStatus(status)
        const handleSync = (isSynced) => { if (isSynced) setIsReady(true) }

        provider.on('status', handleStatus)
        provider.on('sync', handleSync)

        // Fallback: show editor after 3 s even if WS service isn't running
        const readyTimeout = setTimeout(() => setIsReady(true), 3000)

        setEditor(editor)
        setYjsProvider(provider)

        return () => {
            provider.off('status', handleStatus)
            provider.off('sync', handleSync)
            clearTimeout(readyTimeout)
        }
    }, [editor, provider])

    // ── 5. Cleanup provider + editor on full unmount ─────────────────────────
    useEffect(() => {
        return () => {
            providerRef.current?.disconnect()
            cleanup()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // ── Loading screen ────────────────────────────────────────────────────────
    if (!isReady) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <Spinner size="lg" color="primary" />
                <p className="mt-4 text-sm">Connecting to document...</p>
                <p className="mt-1 text-xs text-gray-300">
                    {WS_URL.includes('localhost') ? 'Make sure the Yjs service is running on port 3000' : ''}
                </p>
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
