import { create } from 'zustand'

export const useEditorStore = create((set) => ({
    editor: null,
    yjsProvider: null,
    activeUsers: [],
    connectionStatus: 'disconnected', // disconnected | connecting | connected
    isSaving: false,
    lastSaved: null,

    setEditor: (editor) => set({ editor }),
    setYjsProvider: (yjsProvider) => set({ yjsProvider }),
    setActiveUsers: (activeUsers) => set({ activeUsers }),
    setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
    setIsSaving: (isSaving) => set({ isSaving }),
    setLastSaved: (lastSaved) => set({ lastSaved }),

    cleanup: () =>
        set({
            editor: null,
            yjsProvider: null,
            activeUsers: [],
            connectionStatus: 'disconnected',
            isSaving: false,
            lastSaved: null,
        }),
}))
