import type { AreaHTMLAttributes } from "vue"; 
import BaseServices from "./BaseService";
import Config from "../common/Config";


const legacyUrl =Config.url; 

function buildBearerApiUrl (path: string) {
  console.log('-------------------',path);

  return Config.url + '' + path
}

export default class AuthService
{ 
    static async login(username:string, password:string):Promise<any>{
 
      const data:any = await BaseServices.post(legacyUrl + 'login', { username, password }, false, false)
      let resp:any={};
      if(data.token)
      {
        resp.accessToken=data.token
      }
      return resp
    }
    static async isLogin():Promise<any>{
      const data:any = await BaseServices.get(legacyUrl + 'isLogin')
      return data
    }
      
}
