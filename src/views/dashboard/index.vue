<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>欢迎使用学生成绩管理系统</span>
            </div>
          </template>
          <div class="welcome-info">
            <h3>{{ welcomeMessage }}</h3>
            <p>这里是系统的主要功能区，您可以通过左侧菜单访问各个功能模块。</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/store'

const userStore = useUserStore()
const currentTime = ref(new Date().toLocaleString())
let timer

const userInfo = computed(() => userStore.userInfo)
const userType = computed(() => userStore.userInfo.userType)

const userTypeText = computed(() => {
  const typeMap = {
    admin: '管理员',
    teacher: '教师',
    student: '学生'
  }
  return typeMap[userType.value] || '未知'
})

const welcomeMessage = computed(() => {
  return `${currentTime.value} ${userTypeText.value}${userInfo.value.name}，欢迎回来！`
})

onMounted(() => {
  // 更新时间
  timer = setInterval(() => {
    currentTime.value = new Date().toLocaleString()
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.welcome-info {
  text-align: center;
  padding: 20px;
}

.welcome-info h3 {
  margin-bottom: 20px;
  color: #409EFF;
}
</style> 