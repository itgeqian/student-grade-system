<template>
  <el-menu
    :default-active="activeMenu"
    class="sidebar-menu"
    :collapse="false"
    background-color="#304156"
    text-color="#bfcbd9"
    active-text-color="#409EFF"
  >
    <sidebar-item v-for="route in permissionRoutes" :key="route.path" :item="route" />
  </el-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store'
import { routes } from '@/router'
import SidebarItem from './SidebarItem.vue'

const route = useRoute()
const userStore = useUserStore()
const activeMenu = computed(() => route.path)

// 根据用户类型过滤路由
const permissionRoutes = computed(() => {
  const userType = userStore.userInfo.userType
  const rolePermissions = {
    admin: ['Dashboard', 'System', 'Course', 'Grade'],
    teacher: ['Dashboard', 'Course', 'Grade'],
    student: ['Dashboard', 'Course', 'Grade']
  }

  const allowedRoutes = rolePermissions[userType] || []
  
  return routes.filter(route => {
    if (route.path === '/') return true
    if (route.path === '/login') return false
    
    // 如果是学生，只显示选课管理
    if (userType === 'student' && route.path === '/course') {
      route.children = route.children.filter(child => child.path === 'selection')
    }
    
    return allowedRoutes.includes(route.name)
  })
})
</script>

<style scoped>
.sidebar-menu {
  height: 100%;
  border-right: none;
}
</style> 