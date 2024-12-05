import { defineStore } from 'pinia'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { useSystemStore } from '@/store'
import { useDataStore } from '@/store'

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
        const dataStore = useDataStore()
        
        // 验证密码
        if (this.passwords[username] !== password) {
          throw new Error('用户名或密码错误')
        }

        // 从 system store 中获取用户信息
        const user = systemStore.users.find(u => u.username === username)
        if (!user || user.status !== 1) {
          throw new Error('用户不存在或已被禁用')
        }

        // 检查用户是否在对应的列表中
        if (user.userType === 'student') {
          const student = dataStore.students.find(s => s.id === username)
          if (!student) {
            throw new Error('该学生未被添加到系统中，请联系管理员添加到对应的班级和部门')
          }
        } else if (user.userType === 'teacher') {
          const teacher = dataStore.teachers.find(t => t.id === username)
          if (!teacher) {
            throw new Error('该教师未被添加到系统中，请联系管理员添加到对应的部门')
          }
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
        throw error // 抛出错误以便显示具体的错误信息
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