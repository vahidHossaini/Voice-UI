<template>
  <v-app dir="rtl">
    <v-main class="app-background">
      <div v-if="checkingSession" class="session-loading d-flex align-center justify-center">
        <v-progress-circular indeterminate color="primary" size="42" />
      </div>
      <LoginPage
        v-else-if="!authenticated"
        @authenticated="authenticated = true"
      />
      <UploadPage
        v-else
        @logout="logout"
      />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue'
  import LoginPage from '@/views/LoginPage.vue'
  import UploadPage from '@/views/UploadPage.vue'
  import AuthService from '@/scripts/services/AuthService'
  import BaseServices from '@/scripts/services/BaseService'

  const authenticated = ref(false)
  const checkingSession = ref(true)

  onMounted(async () => {
    try {
      await AuthService.isLogin()
      authenticated.value = true
    } catch (error: unknown) {
      const status = typeof error === 'object' && error !== null && 'status' in error
        ? Number(error.status)
        : undefined
      if (status === 401 || status === 403) {
        BaseServices.clearToken()
      }
      authenticated.value = false
    } finally {
      checkingSession.value = false
    }
  })

  function logout () {
    BaseServices.clearToken()
    authenticated.value = false
  }
</script>

<style scoped>
.app-background {
  min-height: 100vh;
  background: #f5f7fb;
}

.session-loading {
  min-height: 100vh;
}
</style>
