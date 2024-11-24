import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

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
        path: 'user',
        name: 'User',
        component: () => import('@/views/system/user/index.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'department',
        name: 'Department',
        component: () => import('@/views/system/department/index.vue'),
        meta: { title: '部门管理' }
      },
      {
        path: 'teacher',
        name: 'Teacher',
        component: () => import('@/views/system/teacher/index.vue'),
        meta: { title: '教师管理' }
      },
      {
        path: 'student',
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
    meta: { title: '教务管理', icon: 'Reading' },
    children: [
      {
        path: 'list',
        name: 'CourseList',
        component: () => import('@/views/course/list/index.vue'),
        meta: { title: '课程管理' }
      },
      {
        path: 'class',
        name: 'CourseClass',
        component: () => import('@/views/course/class/index.vue'),
        meta: { title: '班级管理' }
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
        path: 'homework',
        name: 'Homework',
        component: () => import('@/views/grade/homework/index.vue'),
        meta: { title: '作业管理' }
      },
      {
        path: 'score',
        name: 'Score',
        component: () => import('@/views/grade/score/index.vue'),
        meta: { title: '成绩管理' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 