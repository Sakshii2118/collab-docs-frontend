import { create } from 'zustand'

export const useDocumentStore = create((set) => ({
    documents: [],
    currentDocument: null,
    isLoading: false,

    setDocuments: (documents) => set({ documents }),
    setCurrentDocument: (document) => set({ currentDocument: document }),

    addDocument: (document) =>
        set((state) => ({ documents: [document, ...state.documents] })),

    updateDocument: (id, updates) =>
        set((state) => ({
            documents: state.documents.map((doc) =>
                doc.id === id ? { ...doc, ...updates } : doc
            ),
            currentDocument:
                state.currentDocument?.id === id
                    ? { ...state.currentDocument, ...updates }
                    : state.currentDocument,
        })),

    deleteDocument: (id) =>
        set((state) => ({
            documents: state.documents.filter((doc) => doc.id !== id),
        })),

    setIsLoading: (isLoading) => set({ isLoading }),
}))
