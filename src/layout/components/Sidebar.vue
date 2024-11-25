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
import { useStore } from 'vuex'
import { routes } from '@/router'
import SidebarItem from './SidebarItem.vue'

const route = useRoute()
const store = useStore()
const activeMenu = computed(() => route.path)

// 根据用户类型过滤路由
const permissionRoutes = computed(() => {
  const userType = store.state.user.userType
  const rolePermissions = {
    admin: ['Dashboard', 'System', 'Course', 'Grade'],
    teacher: ['Dashboard', 'Course', 'Grade'],
    student: ['Dashboard', 'Grade']
  }

  const allowedRoutes = rolePermissions[userType] || []
  
  return routes.filter(route => {
    // 始终显示首页
    if (route.path === '/') return true
    // 登录页不显示
    if (route.path === '/login') return false
    // 根据权限过滤其他页面
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