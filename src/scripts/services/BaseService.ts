import axios from 'axios' 
import Config from '../common/Config'
function normalizeServiceError (error:any) {
  const responseData = error?.response?.data
  const status = error?.response?.status
  if (responseData) {
    if (typeof responseData === 'object') {
      return status ? { ...responseData, status } : responseData
    }
    return status ? { message: String(responseData), status } : { message: String(responseData) }
  }

  const message = String(error?.message ?? '').trim()
  if (message.length > 0) {
    return {
      message,
      ...(status ? { status } : {}),
    }
  }

  if (error?.request) {
    return {
      message: 'ارتباط با سرور برقرار نشد.',
      ...(status ? { status } : {}),
    }
  }

  return {
    message: 'خطای ناشناخته‌ای رخ داده است.',
  }
}

export default class BaseServices
{
  private static getToken (): string {
    return window.localStorage.getItem('token') ?? ''
  }

  private static saveToken (token: unknown): void {
    if (token) window.localStorage.setItem('token', String(token))
  }

  static clearToken (): void {
    window.localStorage.removeItem('token')
  }

  private static getHeaders (useAuth: boolean = true): { authorization: string } {
    return {
      authorization: useAuth ? this.getToken() : '',
    }
  }

  private static normalizeBearerUrl (url: string): string { 
    const normalizedUrl = String(url ?? '')
    const bearerBase = Config.url + '/'
    const legacyBase = Config.url + '/'
    if (normalizedUrl.startsWith(bearerBase)) return normalizedUrl
    if (normalizedUrl.startsWith(legacyBase)) {
      return bearerBase + normalizedUrl.slice(legacyBase.length)
    }
    return normalizedUrl
  }

  static async post (url:string,data:unknown ,useAuth:boolean=true,showDialog:boolean=true):Promise<unknown>
  {
console.log('======',url);

    const path = this.normalizeBearerUrl(url);
    const payload = data && typeof data === 'object'
      ? JSON.parse(JSON.stringify(data))
      : data
    const headers = this.getHeaders(useAuth)
    // StaticValue.showLoading()
    return new Promise((res,rej)=>{
      axios.post(path , payload , { headers })
        .then(function (response:any) {
    // StaticValue.hideLoading()
          if(response.data.token)
          {
            BaseServices.saveToken(response.data.token)
          }
          res(response.data);
        })
        .catch(function (error:any) {
    // StaticValue.hideLoading()
          console.log(error);
         // alert(error.response.data.message)
         //if(showDialog)
        //  StaticValue.showNotification(error.response?.data?.message,NotificationType.Error)
          rej(normalizeServiceError(error))
        })

    });
  }

  static async patch (url:string,data:unknown ,useAuth:boolean=true,showDialog:boolean=true):Promise<unknown>
  {

    const path = this.normalizeBearerUrl(url);
    const payload = data && typeof data === 'object'
      ? JSON.parse(JSON.stringify(data))
      : data
    const headers = this.getHeaders(useAuth)
    // StaticValue.showLoading()
    return new Promise((res,rej)=>{
      axios.patch(path , payload , { headers })
        .then(function (response:any) {
    // StaticValue.hideLoading()
          if(response.data.token)
          {
            BaseServices.saveToken(response.data.token)
          }
          res(response.data);
        })
        .catch(function (error:any) {
    // StaticValue.hideLoading()
          console.log(error);
         // alert(error.response.data.message)
         //if(showDialog)
        //  StaticValue.showNotification(error.response?.data?.message,NotificationType.Error)
          rej(normalizeServiceError(error))
        })

    });
  }
  static async put (url:string,data:unknown , useAuth:boolean=true){
    const path = this.normalizeBearerUrl(url);
    console.log('-++++++++++',url,path);

    const headers = this.getHeaders(useAuth)
    return await axios.put(path , data , { headers })
      .then(function (response:any) {
        if(response.data.token)
        {
          BaseServices.saveToken(response.data.token)
        }
        return response.data.data ?? response.data.token
      })
      .catch(function (error:any) {
        console.log(error);
        throw normalizeServiceError(error)
      })
  }
  static async delete (url:string,id:unknown,useAuth:boolean=true){
    const path= this.normalizeBearerUrl(url);
    const headers = this.getHeaders(useAuth)
    return await axios.delete(path+'/'+id , { headers })
      .then(function (response:any) {
        if(response.data.token)
        {
          BaseServices.saveToken(response.data.token)
        }
        return response.data.data ?? response.data.token
      })
      .catch(function (error:any) {
        console.log(error);
        throw normalizeServiceError(error)
      })
  }
  static async deleteByQuery (url:string,id:string,useAuth:boolean=true){
    const path = `${this.normalizeBearerUrl(url)}?id=${encodeURIComponent(id)}`
    const headers = this.getHeaders(useAuth)
    return await axios.delete(path, { headers })
      .then(function (response:any) {
        BaseServices.saveToken(response.data?.token)
        return response.data?.data ?? response.data
      })
      .catch(function (error:any) {
        console.log(error)
        throw normalizeServiceError(error)
      })
  }
  static async get (url:string){
    url = this.normalizeBearerUrl(url)
    const headers = this.getHeaders()
    return await axios.get(url , { headers })
      .then(function (response:any) {
        if(response.data.token)
        {
          BaseServices.saveToken(response.data.token)
        }
        return response.data.data ?? response.data
      })
      .catch(function (error:any) {
        console.log(error);
        // if(error.response.status == 403){
        //   AccountService.logout()
        // }
        // toast.error("Server Error")
        throw normalizeServiceError(error)
      })
  }
  static async getBlob (url:string,useAuth:boolean=true):Promise<{ data: Blob, headers: Record<string, string> }>
  {
    url = this.normalizeBearerUrl(url)
    const headers = this.getHeaders(useAuth)
    return await axios.get(url , { headers, responseType: 'blob' })
      .then(function (response:any) {
        if(response.headers?.token)
        {
          BaseServices.saveToken(response.headers.token)
        }
        const normalizedHeaders = Object.keys(response.headers ?? {}).reduce<Record<string, string>>((accumulator, key) => {
          accumulator[String(key).toLowerCase()] = String(response.headers[key] ?? '')
          return accumulator
        }, {})
        return {
          data: response.data,
          headers: normalizedHeaders,
        }
      })
      .catch(function (error:any) {
        console.log(error);
        throw normalizeServiceError(error)
      })
  }
  static async postBlob (url:string,data:unknown,useAuth:boolean=true):Promise<{ data: Blob, headers: Record<string, string> }>
  {
    url = this.normalizeBearerUrl(url)
    const headers = this.getHeaders(useAuth)
    return await axios.post(url , data , { headers, responseType: 'blob' })
      .then(function (response:any) {
        if(response.data?.token)
        {
          BaseServices.saveToken(response.data.token)
        }
        const normalizedHeaders = Object.keys(response.headers ?? {}).reduce<Record<string, string>>((accumulator, key) => {
          accumulator[String(key).toLowerCase()] = String(response.headers[key] ?? '')
          return accumulator
        }, {})
        return {
          data: response.data,
          headers: normalizedHeaders,
        }
      })
      .catch(function (error:any) {
        console.log(error);
        throw normalizeServiceError(error)
      })
  }
  static async formData(url:string,data:FormData,useAuth:boolean=true)
  {
    const path = this.normalizeBearerUrl(url);
    const headers = this.getHeaders(useAuth)
    console.log('---------------',headers,data);

    return new Promise((res,rej)=>{
      axios.post(path , data , { headers })
        .then(function (response:any) {
          if(response.data.token)
          {
            BaseServices.saveToken(response.data.token)
          }
          res(response.data);
        })
        .catch(function (error:any) {
          console.log(error);
          rej(normalizeServiceError(error))
        })

    });

  }
}
