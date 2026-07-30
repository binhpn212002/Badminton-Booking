<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    recordName?: string
    confirmText?: string
    cancelText?: string
    loading?: boolean
  }>(),
  {
    title: 'Xác nhận xóa',
    description: 'Bạn có chắc muốn xóa bản ghi này? Hành động này không thể hoàn tác.',
    recordName: '',
    confirmText: 'Xóa',
    cancelText: 'Hủy',
    loading: false,
  },
)

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

function handleCancel() {
  if (props.loading) return
  open.value = false
  emit('cancel')
}

function handleConfirm() {
  emit('confirm')
}
</script>

<template>
  <a-modal
    v-model:open="open"
    :title="title"
    :confirm-loading="loading"
    :ok-text="confirmText"
    :cancel-text="cancelText"
    ok-type="primary"
    centered
    destroy-on-close
    :mask-closable="!loading"
    :closable="!loading"
    :keyboard="!loading"
    @ok="handleConfirm"
    @cancel="handleCancel"
  >
    <p class="m-0 text-gray-700">
      <slot>
        {{ description }}
        <template v-if="recordName">
          <br />
          <span class="mt-2 inline-block font-medium text-gray-900">“{{ recordName }}”</span>
        </template>
      </slot>
    </p>
  </a-modal>
</template>
