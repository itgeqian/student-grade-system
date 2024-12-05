import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken } from '@/utils/auth'
import store from '@/store'
import router from '@/router'

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 5000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => response.data,
  error => {
    const { status, data } = error.response || {}
    
    switch (status) {
      case 401:
        // 未登录或token过期
        store.dispatch('user/logout')
        router.push('/login')
        break
      case 403:
        ElMessage.error('没有权限访问该资源')
        break
      case 500:
        ElMessage.error('服务器错误，请稍后重试')
        break
      default:
        ElMessage.error(data?.message || '未知错误')
    }
    return Promise.reject(error)
  }
)

// 添加请求重试机制
const retryCount = 3
service.interceptors.response.use(
  response => response.data,
  async error => {
    const config = error.config
    if (!config || !config.retry) return Promise.reject(error)
    
    config.__retryCount = config.__retryCount || 0
    
    if (config.__retryCount >= config.retry) {
      return Promise.reject(error)
    }
    
    config.__retryCount += 1
    await new Promise(resolve => setTimeout(resolve, 1000))
    return service(config)
  }
)

export default service 