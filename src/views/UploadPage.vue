<template>
  <div class="upload-page py-8 px-4 px-md-8">
    <div class="content-width">
      <header class="d-flex align-center justify-space-between mb-8">
        <div>
          <div class="text-overline text-primary">Force Project</div>
          <h1 class="text-h4 font-weight-bold">تبدیل فایل صوتی به متن</h1>
          <p class="text-body-1 text-medium-emphasis mt-2">فایل صوتی خود را بارگذاری کنید تا متن آن آماده شود.</p>
        </div>
        <v-btn variant="outlined" prepend-icon="mdi-logout" @click="$emit('logout')">
          خروج
        </v-btn>
      </header>

      <v-row>
        <v-col cols="12" md="5">
          <v-card rounded="xl" elevation="2">
            <v-card-title class="pa-6 pb-2">بارگذاری فایل</v-card-title>
            <v-card-text class="pa-6 pt-3">
              <v-file-input
                v-model="file"
                label="فایل صوتی را انتخاب کنید"
                hint="حداکثر ۱۰۰ مگابایت؛ فرمت‌های wav، mp3، m4a، mp4، ogg، flac و webm"
                persistent-hint
                accept="audio/*,video/mp4"
                prepend-icon="mdi-paperclip"
                variant="outlined"
                :disabled="uploading"
                @update:model-value="clearMessages"
              />
              <v-select
                v-model="diarization"
                class="mt-5"
                label="نوع تفکیک گوینده"
                :items="diarizationItems"
                item-title="title"
                item-value="value"
                variant="outlined"
                :disabled="uploading"
              />

              <v-alert v-if="errorMessage" class="mt-4" type="error" variant="tonal">
                {{ errorMessage }}
              </v-alert>
              <v-alert v-if="successMessage" class="mt-4" type="success" variant="tonal">
                {{ successMessage }}
              </v-alert>

              <v-btn
                class="mt-5"
                block
                color="primary"
                size="large"
                prepend-icon="mdi-cloud-upload-outline"
                :loading="uploading"
                :disabled="!selectedFile"
                @click="upload"
              >
                بارگذاری و تبدیل
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="7">
          <v-card rounded="xl" elevation="2">
            <v-card-title class="d-flex align-center justify-space-between pa-6 pb-2">
              <span>رکوردهای اخیر</span>
              <v-btn icon="mdi-refresh" variant="text" :loading="loadingList" @click="loadTranscriptions" />
            </v-card-title>
            <v-card-text class="pa-6 pt-3">
              <v-progress-linear v-if="loadingList" indeterminate color="primary" class="mb-4" />
              <v-alert v-if="!loadingList && !items.length" type="info" variant="tonal">
                هنوز فایلی تبدیل نشده است.
              </v-alert>

              <v-list v-else lines="two" class="pa-0">
                <v-list-item v-for="item in items" :key="item._id" class="record-item px-0">
                  <template #prepend>
                    <v-avatar color="primary" variant="tonal" class="ml-3">
                      <v-icon icon="mdi-file-music-outline" />
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-medium">{{ item.fileName }}</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(item.transcribedAt) }}</v-list-item-subtitle>
                  <template #append>
                    <v-btn icon="mdi-download-outline" variant="text" :loading="downloadingId === item._id" @click="download(item)" />
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-card v-if="latest" class="mt-6" rounded="xl" elevation="2">
        <v-card-title class="pa-6 pb-2">متن آخرین فایل</v-card-title>
        <v-card-text class="pa-6 pt-3">
          <div class="text-body-1 transcription-text">{{ latest.text || 'متنی برای نمایش وجود ندارد.' }}</div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import AudioService, { type AudioTranscription, type DiarizationMode } from '@/scripts/services/AudioService'

defineEmits<{
  logout: []
}>()

const file = ref<File | File[] | null>(null)
const diarization = ref<DiarizationMode>('speaker')
const items = ref<AudioTranscription[]>([])
const latest = ref<AudioTranscription | null>(null)
const uploading = ref(false)
const loadingList = ref(false)
const downloadingId = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const diarizationItems = [
  { title: 'تفکیک بر اساس گوینده', value: 'speaker' },
  { title: 'تفکیک بر اساس کانال', value: 'channel' },
]

const selectedFile = computed<File | null>(() => {
  if (file.value instanceof File) return file.value
  if (Array.isArray(file.value) && file.value[0] instanceof File) return file.value[0]
  return null
})

function getErrorMessage (error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message)
  }
  return 'عملیات انجام نشد. دوباره تلاش کنید.'
}

function clearMessages () {
  errorMessage.value = ''
  successMessage.value = ''
}

async function upload () {
  if (!selectedFile.value) return

  clearMessages()
  uploading.value = true
  try {
    latest.value = await AudioService.uploadAudio(selectedFile.value, diarization.value)
    successMessage.value = 'فایل با موفقیت بارگذاری و تبدیل شد.'
    file.value = null
    await loadTranscriptions()
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    uploading.value = false
  }
}

async function loadTranscriptions () {
  loadingList.value = true
  try {
    const response = await AudioService.listTranscriptions()
    items.value = response.items ?? []
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    loadingList.value = false
  }
}

async function download (item: AudioTranscription) {
  downloadingId.value = item._id
  try {
    const blob = await AudioService.downloadAudio(item._id)
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = item.fileName
    anchor.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    downloadingId.value = ''
  }
}

function formatDate (value: string): string {
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

onMounted(loadTranscriptions)
</script>

<style scoped>
.upload-page {
  min-height: 100vh;
}

.content-width {
  width: min(100%, 1180px);
  margin: 0 auto;
}

.record-item + .record-item {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.transcription-text {
  white-space: pre-wrap;
  line-height: 2;
}
</style>
