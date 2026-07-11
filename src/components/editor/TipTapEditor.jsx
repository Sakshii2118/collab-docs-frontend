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

// ── Inner component: only mounted once provider (and therefore awareness) ──
// exists. This avoids CollaborationCursor being configured with a null provider.
function EditorInner({ ydoc, provider, role, user }) {
    const { setEditor, setYjsProvider, setConnectionStatus } = useEditorStore()
    const [isReady, setIsReady] = useState(false)

    const isEditable = role === 'OWNER' || role === 'EDITOR'
    const userName = user ? `${user.firstName} ${user.lastName}` : 'Guest'
    const userColor = generateUserColor(user?.id ?? 0)

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

    useEffect(() => {
        if (!editor) return
        editor.setEditable(isEditable)
    }, [editor, isEditable])

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

// ── Outer component: waits for token, then creates provider ──────────────────
// `tokenOverride` allows guest sessions to bypass the authStore token.
export function TipTapEditor({ documentId, yjsRoomId, role, tokenOverride }) {
    const { user, token: authToken } = useAuthStore()
    const effectiveToken = tokenOverride ?? authToken
    const { cleanup } = useEditorStore()

    // Stable ydoc — created once per mount
    const [ydoc] = useState(() => new Y.Doc())

    // Provider is created only after token is available (Zustand may rehydrate
    // from localStorage after first render). Storing in state so the re-render
    // triggered by setProvider causes EditorInner to mount with a real provider.
    const [provider, setProvider] = useState(null)
    const providerRef = useRef(null)

    useEffect(() => {
        // Wait for token — don't attempt connection without it (would get 401)
        if (!effectiveToken || providerRef.current) return

        const wsBase = WS_URL + '/ws/yjs'
        const p = new WebsocketProvider(wsBase, yjsRoomId, ydoc, {
            params: { token: effectiveToken },
        })
        providerRef.current = p
        setProvider(p)
    }, [effectiveToken, yjsRoomId, ydoc])

    // Keep the live provider's reconnect URL in sync with the latest access
    // token. y-websocket bakes `params` into `provider.url` once at
    // construction and only ever re-reads that exact string on reconnect —
    // it never re-derives the URL from `params` itself (confirmed in
    // node_modules/y-websocket/src/y-websocket.js: setupWS() does
    // `new provider._WS(provider.url)` on every attempt, including the
    // automatic exponential-backoff retries after a network blip). Without
    // this, a provider created early in a long session keeps retrying
    // reconnects with whatever token it started with — increasingly likely
    // to be stale now that the access token only lives 15 minutes. Guest
    // sessions use a fixed token and don't participate in refresh, so skip.
    useEffect(() => {
        if (tokenOverride || !providerRef.current || !effectiveToken) return
        const p = providerRef.current
        const base = p.url.split('?')[0]
        p.url = `${base}?token=${encodeURIComponent(effectiveToken)}`
    }, [effectiveToken, tokenOverride])

    // Cleanup on unmount — also null the ref so React StrictMode's double-invoke
    // of effects (dev only) can create a fresh provider on the second run.
    useEffect(() => {
        return () => {
            if (providerRef.current) {
                providerRef.current.disconnect()
                providerRef.current = null
            }
            cleanup()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // Show spinner while waiting for token / provider to be created
    if (!provider) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <Spinner size="lg" color="primary" />
                <p className="mt-4 text-sm">Initialising session...</p>
            </div>
        )
    }

    return <EditorInner ydoc={ydoc} provider={provider} role={role} user={user} />
}
