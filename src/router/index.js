import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import { useUserStore } from '@/store'
import { ElMessage } from 'element-plus'

export const routes = [
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页', icon: 'HomeFilled' }
      }
    ]
  },
  // 系统管理
  {
    path: '/system',
    component: Layout,
    name: 'System',
    meta: { title: '系统管理', icon: 'Setting' },
    children: [
      {
        path: '/system/user',
        name: 'User',
        component: () => import('@/views/system/user/index.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: '/system/department',
        name: 'Department',
        component: () => import('@/views/system/department/index.vue'),
        meta: { title: '部门管理' }
      },
      {
        path: '/system/teacher',
        name: 'Teacher',
        component: () => import('@/views/system/teacher/index.vue'),
        meta: { title: '教师管理' }
      },
      {
        path: '/system/student',
        name: 'Student',
        component: () => import('@/views/system/student/index.vue'),
        meta: { title: '学生管理' }
      }
    ]
  },
  // 教务管理
  {
    path: '/course',
    component: Layout,
    name: 'Course',
    meta: { title: '课程管理', icon: 'Reading' },
    children: [
      {
        path: '/course/list',
        name: 'CourseList',
        component: () => import('@/views/course/list/index.vue'),
        meta: { title: '课程列表' }
      },
      {
        path: '/course/selection',
        name: 'CourseSelection',
        component: () => import('@/views/course/selection/index.vue'),
        meta: { title: '选课管理' }
      }
    ]
  },
  // 成绩管理
  {
    path: '/grade',
    component: Layout,
    name: 'Grade',
    meta: { title: '成绩管理', icon: 'Document' },
    children: [
      {
        path: '/grade/homework',
        name: 'Homework',
        component: () => import('@/views/grade/homework/index.vue'),
        meta: { title: '作业管理' }
      },
      {
        path: '/grade/score',
        name: 'Score',
        component: () => import('@/views/grade/score/index.vue'),
        meta: { title: '成绩管理' }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人中心', icon: 'user' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 定义角色权限映射
const rolePermissions = {
  admin: ['Dashboard', 'System', 'Course', 'Grade'],
  teacher: ['Dashboard', 'Course', 'Grade'],
  student: ['Dashboard', 'Course', 'Grade']
}

// 修改路由守卫实现
router.beforeEach((to, from, next) => {
  // 登录页面直接放行
  if (to.path === '/login') {
    next()
    return
  }

  const userStore = useUserStore()
  const token = userStore.token
  const userType = userStore.userInfo.userType

  // 未登录跳转到登录页
  if (!token) {
    next('/login')
    return
  }

  // 首页直接放行
  if (to.path === '/dashboard') {
    next()
    return
  }

  // 检查路由权限
  const routeName = to.matched[0]?.name
  if (!routeName || rolePermissions[userType]?.includes(routeName)) {
    next()
  } else {
    ElMessage.error('您没有访问该页面的权限')
    next('/dashboard')
  }
})

export default router 