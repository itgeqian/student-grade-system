// 模拟用户数据
const users = {
  admin: {
    roles: ['admin'],
    name: '管理员',
    avatar: '',
    permissions: ['*:*:*']
  },
  teacher: {
    roles: ['teacher'],
    name: '教师',
    avatar: '',
    permissions: ['course:*:*', 'grade:*:*']
  },
  student: {
    roles: ['student'],
    name: '学生',
    avatar: '',
    permissions: ['course:view', 'grade:view']
  }
}

// 模拟登录接口
export function mockLogin(data) {
  const { username, password } = data
  
  if (users[username] && password === '123456') {
    return {
      code: 200,
      message: '登录成功',
      data: {
        token: `mock-token-${username}`,
        ...users[username]
      }
    }
  }
  
  return {
    code: 401,
    message: '用户名或密码错误'
  }
}

// 模拟获取用户信息接口
export function mockGetInfo(token) {
  const username = token.split('-')[2]
  if (users[username]) {
    return {
      code: 200,
      message: '获取成功',
      data: users[username]
    }
  }
  
  return {
    code: 401,
    message: '获取用户信息失败'
  }
} 