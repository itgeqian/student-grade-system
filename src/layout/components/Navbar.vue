<template>
  <div class="navbar">
    <div class="right-menu">
      <el-dropdown trigger="click" @command="handleCommand">
        <span class="user-info">
          {{ userInfo?.name || '用户' }}
          <el-icon class="el-icon--right"><arrow-down /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ArrowDown } from '@element-plus/icons-vue'

const store = useStore()
const router = useRouter()

const userInfo = computed(() => store.state.user.userInfo)

const handleCommand = async (command) => {
  if (command === 'logout') {
    await store.dispatch('user/logout')
    router.push('/login')
  }
}
</script>

<style scoped>
.navbar {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  justify-content: flex-end;
}

.right-menu {
  margin-left: auto;
}

.user-info {
  cursor: pointer;
  color: #333;
}
</style> 