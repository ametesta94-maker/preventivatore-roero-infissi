'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { useEffect } from 'react'
import styles from './RichTextEditor.module.css'

interface RichTextEditorProps {
    content: string
    onChange: (html: string) => void
    placeholder?: string
    variables?: string[]
}

export default function RichTextEditor({ content, onChange, placeholder, variables }: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Underline,
        ],
        content: content || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: styles.editorContent,
            },
        },
    })

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content || '')
        }
    }, [content]) // eslint-disable-line react-hooks/exhaustive-deps

    if (!editor) return null

    const insertVariable = (variable: string) => {
        editor.chain().focus().insertContent(variable).run()
    }

    return (
        <div className={styles.editorWrapper}>
            <div className={styles.toolbar}>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`${styles.toolbarBtn} ${editor.isActive('bold') ? styles.active : ''}`}
                    title="Grassetto"
                >
                    <strong>B</strong>
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`${styles.toolbarBtn} ${editor.isActive('italic') ? styles.active : ''}`}
                    title="Corsivo"
                >
                    <em>I</em>
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`${styles.toolbarBtn} ${editor.isActive('underline') ? styles.active : ''}`}
                    title="Sottolineato"
                >
                    <u>U</u>
                </button>
                <span className={styles.separator} />
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`${styles.toolbarBtn} ${editor.isActive('bulletList') ? styles.active : ''}`}
                    title="Elenco puntato"
                >
                    &bull;
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`${styles.toolbarBtn} ${editor.isActive('orderedList') ? styles.active : ''}`}
                    title="Elenco numerato"
                >
                    1.
                </button>
            </div>
            <EditorContent editor={editor} />
            {variables && variables.length > 0 && (
                <div className={styles.variablesBar}>
                    <span className={styles.variablesLabel}>Variabili:</span>
                    {variables.map(v => (
                        <button
                            key={v}
                            type="button"
                            className={styles.variableChip}
                            onClick={() => insertVariable(v)}
                            title={`Inserisci ${v}`}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
