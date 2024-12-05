import { useUserStore } from '@/store'

export const hasPermission = {
  mounted(el, binding) {
    const { value } = binding
    const userStore = useUserStore()
    const { roles, permissions } = userStore

    if (value && value instanceof Array && value.length > 0) {
      const hasPermission = permissions.some(permission => {
        return value.includes(permission)
      })
      const hasRole = roles.some(role => {
        return value.includes(role)
      })

      if (!hasPermission && !hasRole) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error('需要指定权限值')
    }
  }
}

export default {
  install(app) {
    app.directive('permission', hasPermission)
  }
} 