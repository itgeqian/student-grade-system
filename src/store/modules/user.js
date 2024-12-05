import { defineStore } from 'pinia'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { useSystemStore } from '@/store'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    userInfo: {
      username: '',
      name: '',
      userType: '',
      department: ''
    },
    passwords: {
      admin: '123456',
      teacher: '123456',
      student: '123456'
    }
  }),

  actions: {
    // 登录
    async login(userInfo) {
      try {
        const { username, password } = userInfo
        const systemStore = useSystemStore()
        
        // 验证密码
        if (this.passwords[username] !== password) {
          throw new Error('用户名或密码错误')
        }

        // 从 system store 中获取用户信息
        const user = systemStore.users.find(u => u.username === username)
        if (!user || user.status !== 1) {
          throw new Error('用户不存在或已被禁用')
        }

        // 设置 token
        const token = `token-${username}-${user.userType}`
        this.token = token
        setToken(token)
        
        // 设置用户信息
        this.userInfo = {
          username: user.username,
          name: user.name,
          userType: user.userType,
          department: user.department
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
    },

    // 修改密码
    async updatePassword(payload) {
      const { oldPassword, newPassword } = payload
      const { username } = this.userInfo
      
      if (this.passwords[username] !== oldPassword) {
        throw new Error('原密码不正确')
      }
      
      this.passwords[username] = newPassword
      
      this.token = ''
      this.userInfo = {
        username: '',
        name: '',
        userType: '',
        department: ''
      }
      removeToken()
      
      return true
    }
  },

  persist: {
    key: 'user-state',
    storage: localStorage,
    paths: ['token', 'userInfo', 'passwords']
  }
}) 