const buildBranch = String(import.meta.env.VITE_APP_BRANCH ?? '').trim().toLowerCase()
const isDevelopBuild = buildBranch === 'develop'

export default class Config {  
  static url = 'http://localhost:5980/api/'
}
