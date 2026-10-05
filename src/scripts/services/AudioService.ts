import BaseServices from './BaseService'
import Config from '../common/Config'

export type DiarizationMode = 'speaker' | 'channel'

export interface TranscriptionSegment {
  speaker?: string
  channel?: string | number
  start: number
  end?: number
  text: string
  confidence?: number
}

export interface AudioTranscription {
  _id: string
  title: string
  fileName: string
  mimeType?: string
  fileSize?: number
  storedFileName?: string
  text: string
  segments?: TranscriptionSegment[]
  provider?: string
  model?: string
  language?: string
  diarization?: DiarizationMode
  transcribedAt: string
}

export interface AudioTranscriptionListResponse {
  items: AudioTranscription[]
  count: number
}

function audioUrl (path: string): string {
  return `${Config.url}${path}`
}

export default class AudioService {
  static async uploadAudio (file: File, title: string): Promise<AudioTranscription> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title)
    formData.append('diarization', 'channel')

    return await BaseServices.formData(
      audioUrl('uploadAudio'),
      formData,
    ) as AudioTranscription
  }

  static async getTranscription (id: string): Promise<AudioTranscription> {
    const query = encodeURIComponent(id)
    return await BaseServices.get(
      audioUrl(`getAudioTranscription?id=${query}`),
    ) as AudioTranscription
  }

  static async listTranscriptions (): Promise<AudioTranscriptionListResponse> {
    return await BaseServices.get(
      audioUrl('listAudioTranscriptions'),
    ) as AudioTranscriptionListResponse
  }

  static async listDeletedTranscriptions (): Promise<AudioTranscriptionListResponse> {
    return await BaseServices.get(
      audioUrl('listDeletedAudioTranscriptions'),
    ) as AudioTranscriptionListResponse
  }

  static async deleteTranscription (id: string): Promise<unknown> {
    return await BaseServices.deleteByQuery(
      audioUrl('deleteAudioTranscription'),
      id,
    )
  }

  static async recoverTranscription (id: string): Promise<unknown> {
    const query = encodeURIComponent(id)
    return await BaseServices.post(
      audioUrl(`recoverAudioTranscription?id=${query}`),
      {},
    )
  }

  static async downloadAudio (id: string): Promise<Blob> {
    const query = encodeURIComponent(id)
    const response = await BaseServices.getBlob(
      audioUrl(`downloadAudio?id=${query}`),
    )

    return response.data
  }
}
