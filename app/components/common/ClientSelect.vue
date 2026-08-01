<script setup lang="ts">
/**
 * Wrapper ClientOnly cho a-select — tránh hydration mismatch id
 * (rc_select_TEST_OR_SSR vs rc_select_0) trên Nuxt SSR.
 */
defineOptions({ inheritAttrs: false })
</script>

<template>
  <ClientOnly>
    <a-select v-bind="$attrs">
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData || {}" />
      </template>
    </a-select>
    <template #fallback>
      <div
        class="inline-block h-8 min-w-[11rem] rounded-md border border-[#d9d9d9] bg-white align-middle"
        :class="$attrs.class"
      />
    </template>
  </ClientOnly>
</template>
