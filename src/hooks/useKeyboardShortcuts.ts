import { useEffect } from 'react'

interface KeyboardShortcutsConfig {
  onNewTask?: () => void
  onCloseModal?: () => void
  onUndo?: () => void
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  const { onNewTask, onCloseModal, onUndo } = config

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'

      // N key: new task (only if not in input)
      if (e.key === 'n' && !isInput && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        onNewTask?.()
      }

      // Escape: close modal
      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseModal?.()
      }

      // Ctrl+Z or Cmd+Z: undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        onUndo?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onNewTask, onCloseModal, onUndo])
}
