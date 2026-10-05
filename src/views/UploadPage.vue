<template>
  <div class="upload-page py-8 px-4 px-md-8">
    <div class="content-width">
      <header class="d-flex align-center justify-space-between mb-8">
        <div>
          <div class="text-overline text-primary">Force Project</div>
          <h1 class="text-h4 font-weight-bold">تبدیل فایل صوتی به متن</h1>
          <p class="text-body-1 text-medium-emphasis mt-2">فایل صوتی خود را بارگذاری کنید تا متن آن آماده شود.</p>
        </div>
        <div class="d-flex ga-2">
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openNewFileDialog">
            فایل جدید
          </v-btn>
          <v-btn variant="outlined" prepend-icon="mdi-logout" @click="$emit('logout')">
            خروج
          </v-btn>
        </div>
      </header>

      <v-row>
        <v-col cols="12">
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
                  <v-list-item-title class="font-weight-medium">{{ item.title }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ item.fileName }} · {{ formatDate(item.transcribedAt) }}
                  </v-list-item-subtitle>
                  <template #append>
                    <v-btn
                      class="ml-1"
                      variant="tonal"
                      color="primary"
                      prepend-icon="mdi-text-box-outline"
                      @click="viewTranscription(item)"
                    >
                      مشاهده متن
                    </v-btn>
                    <v-btn icon="mdi-download-outline" variant="text" :loading="downloadingId === item._id" @click="download(item)" />
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-dialog v-model="newFileDialog" max-width="520" persistent>
        <v-card rounded="xl">
          <v-card-title class="d-flex align-center justify-space-between pa-6 pb-2">
            <span>ایجاد فایل جدید</span>
            <v-btn icon="mdi-close" variant="text" :disabled="uploading" @click="closeNewFileDialog" />
          </v-card-title>
          <v-card-text class="pa-6 pt-3">
            <v-text-field
              v-model="title"
              class="mb-5"
              label="عنوان فایل"
              placeholder="مثلاً: جلسه فروش"
              prepend-inner-icon="mdi-format-title"
              variant="outlined"
              :disabled="uploading"
              @update:model-value="clearMessages"
            />
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
            <v-alert v-if="errorMessage" class="mt-4" type="error" variant="tonal">
              {{ errorMessage }}
            </v-alert>
            <v-btn
              class="mt-5"
              block
              color="primary"
              size="large"
              prepend-icon="mdi-cloud-upload-outline"
              :loading="uploading"
              :disabled="!selectedFile || !title.trim()"
              @click="upload"
            >
              بارگذاری و تبدیل
            </v-btn>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-dialog v-model="textDialog" max-width="760">
        <v-card v-if="selectedTranscription" rounded="xl">
          <v-card-title class="d-flex align-center justify-space-between pa-6 pb-2">
            <div>
              <div class="text-h6">{{ selectedTranscription.title }}</div>
              <div class="text-caption text-medium-emphasis mt-1">{{ selectedTranscription.fileName }}</div>
            </div>
            <v-btn icon="mdi-close" variant="text" @click="closeTextDialog" />
          </v-card-title>
          <v-card-text class="pa-6 pt-3">
            <v-progress-linear v-if="loadingAudio" indeterminate color="primary" class="mb-4" />
            <v-alert v-if="audioError" class="mb-4" type="error" variant="tonal">
              {{ audioError }}
            </v-alert>
            <audio v-if="audioUrl" class="audio-player mb-5" :src="audioUrl" controls preload="metadata" />
            <div v-if="mergedSegments.length" class="text-body-1 transcription-text">
              <div v-for="(segment, index) in mergedSegments" :key="`${selectedTranscription._id}-${index}`" class="merged-segment">
                <span class="font-weight-bold">{{ segment.speaker }}:</span>
                {{ segment.text }}
              </div>
            </div>
            <div v-else class="text-body-1 transcription-text">
              {{ selectedTranscription.text || 'متنی برای نمایش وجود ندارد.' }}
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>

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
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AudioService, { type AudioTranscription, type TranscriptionSegment } from '@/scripts/services/AudioService'

defineEmits<{
  logout: []
}>()

const file = ref<File | File[] | null>(null)
const title = ref('')
const newFileDialog = ref(false)
const textDialog = ref(false)
const items = ref<AudioTranscription[]>([])
const latest = ref<AudioTranscription | null>(null)
const selectedTranscription = ref<AudioTranscription | null>(null)
const audioUrl = ref('')
const loadingAudio = ref(false)
const audioError = ref('')

const mergedSegments = computed(() => {
  const segments = selectedTranscription.value?.segments ?? []
  return segments.reduce<Array<{ speaker: string, text: string }>>((merged, segment: TranscriptionSegment) => {
    const speaker = String(segment.speaker ?? segment.channel ?? 'گوینده')
    const text = segment.text.trim()
    const previous = merged[merged.length - 1]

    if (previous && previous.speaker === speaker) {
      previous.text = `${previous.text} ${text}`.trim()
    } else {
      merged.push({ speaker, text })
    }

    return merged
  }, [])
})
const uploading = ref(false)
const loadingList = ref(false)
const downloadingId = ref('')
const errorMessage = ref('')

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

function openNewFileDialog () {
  file.value = null
  title.value = ''
  clearMessages()
  newFileDialog.value = true
}

function closeNewFileDialog () {
  if (uploading.value) return
  newFileDialog.value = false
  file.value = null
  title.value = ''
  clearMessages()
}

async function viewTranscription (item: AudioTranscription) {
  selectedTranscription.value = item
  releaseAudioUrl()
  audioError.value = ''
  textDialog.value = true

  loadingAudio.value = true
  try {
    const blob = await AudioService.downloadAudio(item._id)
    if (selectedTranscription.value?._id === item._id) {
      audioUrl.value = URL.createObjectURL(blob)
    }
  } catch {
    audioError.value = 'پخش فایل صوتی امکان‌پذیر نیست.'
  } finally {
    loadingAudio.value = false
  }
}

function closeTextDialog () {
  textDialog.value = false
  releaseAudioUrl()
}

function releaseAudioUrl () {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
    audioUrl.value = ''
  }
}

function clearMessages () {
  errorMessage.value = ''
}

async function upload () {
  if (!selectedFile.value) return

  clearMessages()
  uploading.value = true
  try {
    latest.value = await AudioService.uploadAudio(selectedFile.value, title.value.trim())
    newFileDialog.value = false
    file.value = null
    title.value = ''
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
onUnmounted(releaseAudioUrl)
</script>

<style scoped>
.upload-page {
  min-height: 100vh;
  direction: rtl;
  text-align: right;
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
  direction: rtl;
  text-align: right;
}

.merged-segment + .merged-segment {
  margin-top: 12px;
}

.audio-player {
  display: block;
  width: 100%;
}

</style>
