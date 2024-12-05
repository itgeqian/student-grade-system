import router from './router'
import { useUserStore, usePermissionStore } from '@/store'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login']

router.beforeEach(async(to, from, next) => {
  NProgress.start()
  
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      const userStore = useUserStore()
      const permissionStore = usePermissionStore()
      const hasRoles = userStore.roles && userStore.roles.length > 0

      if (hasRoles) {
        if (to.matched.length === 0) {
          const accessRoutes = await permissionStore.generateRoutes(userStore.roles)
          accessRoutes.forEach(route => {
            router.addRoute(route)
          })
          next({ ...to, replace: true })
        } else {
          next()
        }
      } else {
        try {
          const { roles } = await userStore.getInfo()
          const accessRoutes = await permissionStore.generateRoutes(roles)
          
          accessRoutes.forEach(route => {
            router.addRoute(route)
          })

          next({ ...to, replace: true })
        } catch (error) {
          await userStore.logout()
          ElMessage.error(error.message || '出现错误，请重新登录')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
}) 