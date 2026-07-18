import { useEffect, useState } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { clsx } from 'clsx'

function ToolbarButton({ onClick, active, disabled, title, children }) {
    return (
        <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onClick() }}
            disabled={disabled}
            title={title}
            className={clsx(
                'min-w-[2rem] h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-100',
                active
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                disabled && 'opacity-30 cursor-not-allowed hover:bg-transparent',
            )}
        >
            {children}
        </button>
    )
}

function Divider() {
    return <div className="w-px h-6 bg-gray-200 mx-1.5 flex-shrink-0" />
}

const TEXT_COLORS = [
    { label: 'Gray', value: '#6b7280' },
    { label: 'Red', value: '#ef4444' },
    { label: 'Orange', value: '#f97316' },
    { label: 'Amber', value: '#f59e0b' },
    { label: 'Green', value: '#22c55e' },
    { label: 'Teal', value: '#14b8a6' },
    { label: 'Blue', value: '#3b82f6' },
    { label: 'Indigo', value: '#6366f1' },
    { label: 'Purple', value: '#a855f7' },
    { label: 'Pink', value: '#ec4899' },
]

function ColorPicker({ editor }) {
    const [open, setOpen] = useState(false)
    const activeColor = editor.getAttributes('textStyle').color

    return (
        <div className="relative">
            <ToolbarButton onClick={() => setOpen((o) => !o)} active={open || !!activeColor} title="Text Color">
                <span className="flex flex-col items-center leading-none gap-0.5">
                    <span className="text-xs font-bold">A</span>
                    <span className="w-4 h-1 rounded-sm" style={{ background: activeColor || '#d1d5db' }} />
                </span>
            </ToolbarButton>
            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute left-0 top-full mt-1.5 z-20 bg-white border border-gray-200 rounded-xl shadow-xl p-2.5 flex flex-wrap gap-1.5 w-44">
                        <button
                            type="button"
                            title="Default"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => { editor.chain().focus().unsetColor().run(); setOpen(false) }}
                            className="w-6 h-6 rounded-full border border-gray-300 bg-white flex items-center justify-center text-[10px] text-gray-400 hover:scale-110 transition-transform"
                        >
                            ✕
                        </button>
                        {TEXT_COLORS.map(({ label, value }) => (
                            <button
                                key={label}
                                type="button"
                                title={label}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => { editor.chain().focus().setColor(value).run(); setOpen(false) }}
                                style={{ background: value }}
                                className={clsx(
                                    'w-6 h-6 rounded-full border transition-transform hover:scale-110',
                                    activeColor === value ? 'ring-2 ring-offset-1 ring-primary-400 border-transparent' : 'border-black/5',
                                )}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

const FONT_FAMILIES = [
    { label: 'Default font', value: '' },
    { label: 'Sans Serif', value: 'Inter, ui-sans-serif, system-ui, sans-serif' },
    { label: 'Serif', value: 'Georgia, Cambria, serif' },
    { label: 'Monospace', value: '"Courier New", monospace' },
]

function FontFamilySelect({ editor }) {
    const activeFont = editor.getAttributes('textStyle').fontFamily || ''
    const knownValue = FONT_FAMILIES.some((f) => f.value === activeFont) ? activeFont : ''

    return (
        <select
            value={knownValue}
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => {
                const value = e.target.value
                if (value) editor.chain().focus().setFontFamily(value).run()
                else editor.chain().focus().unsetFontFamily().run()
            }}
            title="Font Family"
            className="h-8 text-xs font-medium text-gray-600 bg-transparent border border-gray-200 rounded-md pl-2.5 pr-1 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer max-w-[7.5rem]"
        >
            {FONT_FAMILIES.map(({ label, value }) => (
                <option key={label} value={value}>{label}</option>
            ))}
        </select>
    )
}

export function EditorMenuBar() {
    const { editor } = useEditorStore()
    // Toolbar reads editor.isActive()/getAttributes() straight off ProseMirror
    // state at render time — without this, selection-only changes (cursor
    // moving into a table/bold run) wouldn't re-render the toolbar, since
    // `editor` itself is a stable reference in the zustand store.
    const [, forceRerender] = useState(0)
    useEffect(() => {
        if (!editor) return
        const rerender = () => forceRerender((n) => n + 1)
        editor.on('transaction', rerender)
        return () => editor.off('transaction', rerender)
    }, [editor])

    if (!editor) return null

    return (
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-[850px] mx-auto px-4 sm:px-6 py-2 flex items-center gap-0.5 flex-wrap overflow-x-auto">
                {/* History */}
                <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo" disabled={!editor.can().undo()}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo" disabled={!editor.can().redo()}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>
                </ToolbarButton>

                <Divider />

                {/* Headings */}
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">
                    <span className="text-xs font-bold">H1</span>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
                    <span className="text-xs font-bold">H2</span>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
                    <span className="text-xs font-bold">H3</span>
                </ToolbarButton>

                <Divider />

                {/* Font family */}
                <FontFamilySelect editor={editor} />

                <Divider />

                {/* Text formatting */}
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
                    <span className="font-bold text-sm">B</span>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
                    <span className="italic text-sm">I</span>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
                    <span className="underline text-sm">U</span>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
                    <span className="line-through text-sm">S</span>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight">
                    <span className="bg-yellow-200 px-0.5 text-sm">H</span>
                </ToolbarButton>
                <ColorPicker editor={editor} />
                <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Subscript">
                    <span className="text-sm">X<sub>2</sub></span>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superscript">
                    <span className="text-sm">X<sup>2</sup></span>
                </ToolbarButton>

                <Divider />

                {/* Lists */}
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} title="Task List">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 6h11M9 12h11M9 18h11" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" />
                    </svg>
                </ToolbarButton>

                <Divider />

                {/* Alignment */}
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" /></svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" /></svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" /></svg>
                </ToolbarButton>

                <Divider />

                {/* Block elements */}
                <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10.5h3m-3 3h3m-6 3h3V7.5h3v9m-6 0H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-4" /></svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code">
                    <code className="text-xs">{`</>`}</code>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} active={editor.isActive('table')} title="Insert Table">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="4" width="18" height="16" rx="1.5" strokeWidth={2} /><path strokeWidth={2} d="M3 10h18M3 16h18M9 4v16M15 4v16" /></svg>
                </ToolbarButton>

                <Divider />

                {/* Horizontal rule */}
                <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" /></svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear Formatting">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </ToolbarButton>

                {/* Contextual table controls — only shown while the cursor is inside a table */}
                {editor.isActive('table') && (
                    <>
                        <Divider />
                        <span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold px-1 select-none">Table</span>
                        <ToolbarButton onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add Column After">
                            <span className="text-xs font-semibold">Col+</span>
                        </ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete Column">
                            <span className="text-xs font-semibold">Col−</span>
                        </ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().addRowAfter().run()} title="Add Row After">
                            <span className="text-xs font-semibold">Row+</span>
                        </ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().deleteRow().run()} title="Delete Row">
                            <span className="text-xs font-semibold">Row−</span>
                        </ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleHeaderRow().run()} title="Toggle Header Row">
                            <span className="text-xs font-semibold">Hdr</span>
                        </ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().deleteTable().run()} title="Delete Table">
                            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" /></svg>
                        </ToolbarButton>
                    </>
                )}
            </div>
        </div>
    )
}
