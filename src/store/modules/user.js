import { getToken, setToken, removeToken } from '@/utils/auth'

const state = {
  token: getToken(),
  userInfo: null,
  userType: ''
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_USER_INFO: (state, userInfo) => {
    state.userInfo = userInfo
  },
  SET_USER_TYPE: (state, userType) => {
    state.userType = userType
  }
}

const actions = {
  // 登录
  login({ commit }, userInfo) {
    const { username, password, userType } = userInfo
    return new Promise((resolve) => {
      // 模拟登录成功
      const token = `token-${username}-${userType}`
      commit('SET_TOKEN', token)
      commit('SET_USER_TYPE', userType)
      commit('SET_USER_INFO', {
        username,
        userType,
        name: username === 'admin' ? '管理员' : username === 'teacher' ? '教师' : '学生'
      })
      setToken(token)
      resolve()
    })
  },

  // 登出
  logout({ commit }) {
    commit('SET_TOKEN', '')
    commit('SET_USER_INFO', null)
    commit('SET_USER_TYPE', '')
    removeToken()
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
} 