<template>
  <v-app dir="rtl">
    <v-main class="app-background">
      <LoginPage
        v-if="!authenticated"
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

  const authenticated = ref(false)

  onMounted(async () => {
    if (!window.localStorage.token) return

    try {
      await AuthService.isLogin()
      authenticated.value = true
    } catch {
      window.localStorage.removeItem('token')
    }
  })

  function logout () {
    window.localStorage.removeItem('token')
    authenticated.value = false
  }
</script>

<style scoped>
.app-background {
  min-height: 100vh;
  background: #f5f7fb;
}
</style>
