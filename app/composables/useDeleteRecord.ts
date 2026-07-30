export function useDeleteRecord<T extends { id: string | number }>() {
  const open = ref(false)
  const loading = ref(false)
  const target = ref<T | null>(null)

  function askDelete(record: T) {
    target.value = record
    open.value = true
  }

  async function confirmDelete(onConfirm: (record: T) => void | Promise<void>) {
    if (!target.value) return
    loading.value = true
    try {
      await onConfirm(target.value)
      open.value = false
      target.value = null
    } finally {
      loading.value = false
    }
  }

  function cancelDelete() {
    open.value = false
    target.value = null
  }

  return {
    open,
    loading,
    target,
    askDelete,
    confirmDelete,
    cancelDelete,
  }
}
