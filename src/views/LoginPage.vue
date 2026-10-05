<template>
  <div class="login-page d-flex align-center justify-center pa-4">
    <v-card class="login-card" elevation="8">
      <v-card-item class="text-center pt-8">
        <v-avatar color="primary" size="64" class="mb-4">
          <v-icon icon="mdi-microphone-outline" size="34" />
        </v-avatar>
        <v-card-title class="text-h5 font-weight-bold">ورود به سامانه تبدیل صوت</v-card-title>
        <v-card-subtitle class="mt-2">برای مدیریت و تبدیل فایل‌های صوتی وارد شوید</v-card-subtitle>
      </v-card-item>

      <v-card-text class="pa-6">
        <v-form @submit.prevent="submit">
          <v-text-field
            v-model="username"
            label="نام کاربری"
            prepend-inner-icon="mdi-account-outline"
            variant="outlined"
            autocomplete="username"
            :disabled="loading"
            required
          />
          <v-text-field
            v-model="password"
            class="mt-3"
            label="رمز عبور"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            :type="showPassword ? 'text' : 'password'"
            variant="outlined"
            autocomplete="current-password"
            :disabled="loading"
            required
            @click:append-inner="showPassword = !showPassword"
          />

          <v-alert v-if="errorMessage" class="mt-4" type="error" variant="tonal">
            {{ errorMessage }}
          </v-alert>

          <v-btn
            class="mt-6"
            block
            color="primary"
            size="large"
            type="submit"
            :loading="loading"
          >
            ورود
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import AuthService from '@/scripts/services/AuthService'

const emit = defineEmits<{
  authenticated: []
}>()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

function getErrorMessage (error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message)
  }
  return 'ورود انجام نشد. نام کاربری و رمز عبور را بررسی کنید.'
}

async function submit () {
  if (!username.value.trim() || !password.value) {
    errorMessage.value = 'نام کاربری و رمز عبور را وارد کنید.'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    await AuthService.login(username.value.trim(), password.value)
    emit('authenticated')
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  direction: rtl;
  text-align: right;
}

.login-card {
  width: min(100%, 440px);
  border-radius: 20px;
}
</style>
