import { defineStore } from 'pinia'

export const useSystemStore = defineStore('system', {
  state: () => ({
    users: [
      {
        username: 'admin',
        name: '管理员',
        userType: 'admin',
        department: '',
        status: 1,
        createTime: '2024-01-01'
      },
      {
        username: 'teacher',
        name: '张老师',
        userType: 'teacher',
        department: '计算机学院',
        status: 1,
        createTime: '2024-01-02'
      },
      {
        username: 'student',
        name: '张三',
        userType: 'student',
        department: '计算机学院',
        status: 1,
        createTime: '2024-01-03'
      }
    ]
  }),

  actions: {
    // 添加用户
    addUser(user) {
      this.users.push({
        ...user,
        status: 1,
        createTime: new Date().toISOString().split('T')[0]
      })
    },

    // 更新用户
    updateUser(user) {
      const index = this.users.findIndex(item => item.username === user.username)
      if (index !== -1) {
        this.users[index] = { ...this.users[index], ...user }
      }
    },

    // 删除用���
    deleteUser(username) {
      this.users = this.users.filter(item => item.username !== username)
    },

    // 重置用户密码
    resetUserPassword(username) {
      const userStore = useUserStore()
      userStore.passwords[username] = '123456'
    }
  },

  persist: {
    key: 'system-state',
    storage: localStorage
  }
}) 