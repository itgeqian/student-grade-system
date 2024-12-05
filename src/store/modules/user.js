import { defineStore } from 'pinia'
import { getToken, setToken, removeToken } from '@/utils/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    userInfo: {
      username: '',
      name: '',
      userType: '', // admin, teacher, student
      department: ''
    }
  }),

  actions: {
    // 登录
    async login(userInfo) {
      try {
        const { username, userType } = userInfo
        const token = `token-${username}-${userType}`
        this.token = token
        setToken(token)
        
        this.userInfo = {
          username,
          name: username === 'admin' ? '管理员' : 
                username === 'teacher' ? '张老师' : '张三',
          userType: username === 'admin' ? 'admin' : 
                   username === 'teacher' ? 'teacher' : 'student',
          department: username !== 'admin' ? '计算机学院' : ''
        }
        
        return true
      } catch (error) {
        return false
      }
    },

    // 登出
    async logout() {
      this.token = ''
      this.userInfo = {
        username: '',
        name: '',
        userType: '',
        department: ''
      }
      removeToken()
    }
  },

  persist: {
    key: 'user-state',
    storage: localStorage,
    paths: ['token', 'userInfo']
  }
}) 