<script setup lang="ts">
const open = defineModel<boolean>("open", { default: false });

const email = ref("");
const password = ref("");

function handleSubmit() {
  open.value = false;
  email.value = "";
  password.value = "";
}

function handleCancel() {
  open.value = false;
}
</script>

<template>
  <a-modal
    v-model:open="open"
    title="Đăng nhập"
    :footer="null"
    destroy-on-close
    @cancel="handleCancel"
  >
    <a-form layout="vertical" @finish="handleSubmit">
      <a-form-item
        label="Email"
        name="email"
        :rules="[{ required: true, message: 'Nhập email' }]"
      >
        <a-input
          v-model:value="email"
          type="email"
          placeholder="email@example.com"
        />
      </a-form-item>
      <a-form-item
        label="Mật khẩu"
        name="password"
        :rules="[{ required: true, message: 'Nhập mật khẩu' }]"
      >
        <a-input-password v-model:value="password" placeholder="••••••••" />
      </a-form-item>
      <a-form-item class="!mb-0">
        <div class="flex justify-end gap-2">
          <a-button @click="handleCancel">Hủy</a-button>
          <a-button type="primary" html-type="submit">Đăng nhập</a-button>
        </div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
