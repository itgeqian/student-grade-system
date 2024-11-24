<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>用户信息</span>
            </div>
          </template>
          <div class="user-info">
            <p>用户名：{{ userInfo?.username }}</p>
            <p>角色：{{ userTypeText }}</p>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>系统信息</span>
            </div>
          </template>
          <div class="system-info">
            <p>当前时间：{{ currentTime }}</p>
            <p>系统版本：v1.0.0</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
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
import { useStore } from 'vuex'

const store = useStore()
const currentTime = ref(new Date().toLocaleString())
let timer

const userInfo = computed(() => store.state.user.userInfo)
const userType = computed(() => store.state.user.userType)

const userTypeText = computed(() => {
  const typeMap = {
    admin: '管理员',
    teacher: '教师',
    student: '学生'
  }
  return typeMap[userType.value] || '未知'
})

const welcomeMessage = computed(() => {
  const hour = new Date().getHours()
  let timeText = ''
  if (hour < 12) {
    timeText = '上午好'
  } else if (hour < 18) {
    timeText = '下午好'
  } else {
    timeText = '晚上好'
  }
  return `${timeText}，${userInfo.value?.name || '用户'}！`
})

onMounted(() => {
  // 更新时间
  timer = setInterval(() => {
    currentTime.value = new Date().toLocaleString()
  }, 1000)
})

onUnmounted(() => {
  // 清除定时器
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info p,
.system-info p {
  margin: 10px 0;
  line-height: 1.5;
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