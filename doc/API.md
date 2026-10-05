# ForceProject API

## اطلاعات اتصال

آدرس پیش‌فرض سرور در محیط توسعه:

```text
http://localhost:5980
```

تمام endpointها با پیشوند `/api` در دسترس هستند.

برای endpointهای خصوصی، مقدار `token` دریافتی از login را به‌صورت مستقیم در header زیر ارسال کنید:

```http
Authorization: <token>
```

> در پیاده‌سازی فعلی نیازی به اضافه‌کردن `Bearer` نیست.

## 1. ورود به سیستم

```http
POST /api/login
Content-Type: application/json
```

Body:

```json
{
  "username": "admin",
  "password": "1234"
}
```

پاسخ موفق:

```json
{
  "isDone": true,
  "data": {
    "username": "admin",
    "role": "user"
  },
  "token": "<session-token>"
}
```

درخواست‌های بعدی باید header زیر را داشته باشند:

```http
Authorization: <session-token>
```

پاسخ خطا:

```json
{
  "code": "INVALID_CREDENTIALS",
  "message": "نام کاربری یا رمز عبور صحیح نیست."
}
```

## 2. بررسی session فعلی

```http
GET /api/isLogin
Authorization: <session-token>
```

پاسخ:

```json
{
  "authenticated": true,
  "userId": "fixed-user",
  "username": "admin",
  "role": "user"
}
```

## 3. آپلود و تبدیل فایل صوتی

```http
POST /api/uploadAudio
Authorization: <session-token>
Content-Type: multipart/form-data
```

فیلدهای فرم:

| نام | نوع | الزامی | توضیح |
|---|---|---:|---|
| `file` | File | بله | فایل صوتی |
| `diarization` | String | خیر | مقدار `speaker` یا `channel`؛ پیش‌فرض `speaker` |

حداکثر حجم فایل: `100 MB`

فرمت‌های پیشنهادی: `wav`, `mp3`, `m4a`, `mp4`, `ogg`, `flac`, `webm`

پاسخ موفق شامل شناسه‌ی خودکار رکورد است:

```json
{
  "_id": "uuid",
  "fileName": "call.mp3",
  "mimeType": "audio/mpeg",
  "fileSize": 123456,
  "storedFileName": "uuid.mp3",
  "text": "S1- متن تبدیل‌شده...",
  "segments": [
    {
      "speaker": "S1",
      "start": 0,
      "end": 2.5,
      "text": "متن جمله",
      "confidence": 0.98
    }
  ],
  "provider": "speechmatics",
  "model": "enhanced",
  "language": "fa",
  "diarization": "speaker",
  "transcribedAt": "2026-01-01T12:00:00.000Z"
}
```

فایل روی سرور ذخیره می‌شود و شناسه‌ی `_id` برای دریافت رکورد و دانلود فایل استفاده می‌شود.

## 4. دریافت یک رکورد تبدیل‌شده

```http
GET /api/getAudioTranscription?id=<record-id>
Authorization: <session-token>
```

در صورت پیدا نشدن رکورد:

```json
{
  "error": {
    "code": "TRANSCRIPTION_NOT_FOUND"
  }
}
```

## 5. دریافت لیست رکوردها

```http
GET /api/listAudioTranscriptions
Authorization: <session-token>
```

لیست بر اساس جدیدترین تاریخ تبدیل مرتب شده و حداکثر ۱۰۰ رکورد برمی‌گرداند:

```json
{
  "items": [
    {
      "_id": "uuid",
      "fileName": "call.mp3",
      "text": "متن تبدیل‌شده...",
      "transcribedAt": "2026-01-01T12:00:00.000Z"
    }
  ],
  "count": 1
}
```

## 6. دانلود فایل صوتی

```http
GET /api/downloadAudio?id=<record-id>
Authorization: <session-token>
```

پاسخ موفق، خود فایل صوتی با `Content-Type` واقعی فایل است؛ بنابراین در فرانت می‌توان پاسخ را به‌صورت `blob` دریافت کرد.

نمونه در JavaScript:

```js
const response = await fetch(
  `${API_URL}/api/downloadAudio?id=${recordId}`,
  { headers: { Authorization: token } }
);

const blob = await response.blob();
const url = URL.createObjectURL(blob);
window.open(url, '_blank');
```

خطاهای مهم دانلود:

| کد | معنی |
|---|---|
| `AUDIO_ID_REQUIRED` | شناسه ارسال نشده است |
| `AUDIO_NOT_FOUND` | رکورد پیدا نشد |
| `AUDIO_FILE_NOT_FOUND` | رکورد وجود دارد اما فایل روی سرور موجود نیست |

## نکات فرانت‌اند

- بعد از login، `token` را ذخیره کنید.
- برای upload از `FormData` استفاده کنید و فایل را با کلید `file` بفرستید.
- بعد از upload، مقدار `_id` پاسخ را ذخیره کنید.
- برای نمایش متن از `text` و برای نمایش تفکیک گوینده‌ها از `segments` استفاده کنید.
- برای دانلود، پاسخ endpoint را با `response.blob()` دریافت کنید.
- endpointهای به‌جز `/api/login` نیاز به header `Authorization` دارند.
