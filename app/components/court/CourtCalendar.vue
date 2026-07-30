<script setup lang="ts">
import dayjs, { type Dayjs } from 'dayjs'
import type { Court } from '~/types/management'
import { formatCurrency } from '~/utils/format'

const props = defineProps<{
  court: Court
}>()

type SlotStatus = 'available' | 'booked' | 'maintenance'

type DaySlot = {
  time: string
  status: SlotStatus
  customer?: string
  price: number
}

const selectedDate = ref<Dayjs>(dayjs())

function parseHour(value: string) {
  const [h] = value.split(':').map(Number)
  return h ?? 0
}

function priceForHour(hour: number) {
  const slot = props.court.priceSlots.find((s) => {
    const from = parseHour(s.from)
    const to = parseHour(s.to)
    return hour >= from && hour < to
  })
  return slot?.price ?? props.court.priceSlots[0]?.price ?? 0
}

const daySlots = computed<DaySlot[]>(() => {
  const from = parseHour(props.court.availableFrom)
  const to = parseHour(props.court.availableTo)
  const dateKey = selectedDate.value.format('YYYY-MM-DD')
  const seed = [...dateKey, ...props.court.id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)

  const slots: DaySlot[] = []
  for (let hour = from; hour < to; hour++) {
    const time = `${String(hour).padStart(2, '0')}:00-${String(hour + 1).padStart(2, '0')}:00`
    let status: SlotStatus = 'available'
    if (props.court.isMaintenance || props.court.status === 'MAINTENANCE') {
      status = 'maintenance'
    } else if (props.court.status === 'CLOSED' || !props.court.isAvailable) {
      status = 'maintenance'
    } else if ((seed + hour) % 5 === 0) {
      status = 'booked'
    }

    slots.push({
      time,
      status,
      customer: status === 'booked' ? `KH-${(seed + hour) % 90 + 10}` : undefined,
      price: priceForHour(hour),
    })
  }
  return slots
})

const statusMeta: Record<SlotStatus, { color: string; label: string }> = {
  available: { color: 'success', label: 'Trống' },
  booked: { color: 'processing', label: 'Đã đặt' },
  maintenance: { color: 'warning', label: 'Bảo trì' },
}

function dateCellRender(current: Dayjs) {
  const key = current.format('YYYY-MM-DD')
  const seed = [...key, ...props.court.id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  const bookedCount = seed % 4
  return bookedCount
}

function onSelect(date: Dayjs) {
  selectedDate.value = date
}
</script>

<template>
  <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
    <a-card title="Lịch đặt sân" size="small">
      <a-calendar
        v-model:value="selectedDate"
        :fullscreen="false"
        @select="onSelect"
      >
        <template #dateCellRender="{ current }">
          <div
            v-if="dateCellRender(current)"
            class="text-center text-[10px] text-[#26C73E]"
          >
            {{ dateCellRender(current) }} lịch
          </div>
        </template>
      </a-calendar>
    </a-card>

    <a-card size="small">
      <template #title>
        Khung giờ — {{ selectedDate.format('DD/MM/YYYY') }}
      </template>
      <div class="mb-3 flex gap-2 text-xs text-gray-500">
        <span>Giờ mở: {{ court.availableFrom }} - {{ court.availableTo }}</span>
      </div>
      <div class="max-h-[420px] space-y-2 overflow-y-auto">
        <div
          v-for="slot in daySlots"
          :key="slot.time"
          class="flex items-center justify-between rounded border border-gray-100 px-3 py-2"
        >
          <div>
            <div class="font-medium text-gray-800">{{ slot.time }}</div>
            <div v-if="slot.customer" class="text-xs text-gray-500">{{ slot.customer }}</div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-600">{{ formatCurrency(slot.price) }}</span>
            <a-tag :color="statusMeta[slot.status].color">
              {{ statusMeta[slot.status].label }}
            </a-tag>
          </div>
        </div>
      </div>
    </a-card>
  </div>
</template>
