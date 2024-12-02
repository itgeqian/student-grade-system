<template>
  <div class="navbar">
    <!-- 左侧 -->
    <div class="left-menu">
      <hamburger
        :is-active="sidebar.opened"
        class="hamburger-container"
        @toggleClick="toggleSideBar"
      />
      <breadcrumb class="breadcrumb-container" />
    </div>

    <!-- 右侧 -->
    <div class="right-menu">
      <!-- 全屏按钮 -->
      <div class="right-menu-item hover-effect">
        <el-tooltip content="全屏" effect="dark" placement="bottom">
          <screenfull class="screenfull" />
        </el-tooltip>
      </div>

      <!-- 用户头像和下拉菜单 -->
      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <el-avatar 
            :size="30" 
            :src="userInfo.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" 
          />
          <el-icon><caret-bottom /></el-icon>
        </div>

        <template #dropdown>
          <el-dropdown-menu>
            <router-link to="/profile">
              <el-dropdown-item>个人中心</el-dropdown-item>
            </router-link>
            <el-dropdown-item divided @click="handleLogout">
              <span style="display: block">退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import Breadcrumb from './Breadcrumb.vue'
import Hamburger from './Hamburger.vue'
import Screenfull from './Screenfull.vue'
import { CaretBottom } from '@element-plus/icons-vue'

const router = useRouter()

// 用户信息
const userInfo = ref({
  avatar: '',
  name: 'Admin'
})

// 添加 sidebar 相关逻辑
const sidebar = ref({
  opened: true
})

const toggleSideBar = () => {
  sidebar.value.opened = !sidebar.value.opened
  // 如果需要，这里可以触发 vuex action 来同步状态
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // TODO: 调用登出API
    router.push('/login')
    ElMessage.success('退出成功')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;

  .left-menu {
    display: flex;
    align-items: center;

    .hamburger-container {
      line-height: 46px;
      height: 100%;
      float: left;
      padding: 0 15px;
      cursor: pointer;
      transition: background 0.3s;

      &:hover {
        background: rgba(0, 0, 0, 0.025);
      }
    }

    .breadcrumb-container {
      float: left;
      margin-left: 15px;
    }
  }

  .right-menu {
    display: flex;
    align-items: center;
    height: 100%;
    padding-right: 15px;

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: middle;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      .avatar-wrapper {
        display: flex;
        align-items: center;
        gap: 5px;
        
        .el-icon {
          font-size: 12px;
        }
      }
    }
  }
}
</style> 