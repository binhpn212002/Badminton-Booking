export function useListFilter<T>(
  source: Ref<T[]>,
  options: {
    getKeywordFields: (item: T) => Array<string | number | null | undefined>
    getStatus?: (item: T) => string
  },
) {
  const keyword = ref('')
  const status = ref('all')

  const filteredData = computed(() => {
    const q = keyword.value.trim().toLowerCase()
    return source.value.filter((item) => {
      const matchKeyword =
        !q ||
        options.getKeywordFields(item).some((field) =>
          String(field ?? '').toLowerCase().includes(q),
        )
      const matchStatus =
        !options.getStatus || status.value === 'all' || options.getStatus(item) === status.value
      return matchKeyword && matchStatus
    })
  })

  function resetFilters() {
    keyword.value = ''
    status.value = 'all'
  }

  return { keyword, status, filteredData, resetFilters }
}
