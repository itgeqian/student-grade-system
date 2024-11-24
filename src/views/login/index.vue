<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2 class="login-title">学生成绩管理系统</h2>
      </template>
      
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="0">
        <el-form-item prop="username">
          <el-input
            v-model="formData.username"
            placeholder="用户名"
            :prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="密码"
            :prefix-icon="Lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item prop="userType">
          <el-select v-model="formData.userType" placeholder="请选择用户类型" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="教师" value="teacher" />
            <el-option label="学生" value="student" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button
            :loading="loading"
            type="primary"
            style="width: 100%"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>

        <div class="tips">
          <p>管理员账号: admin / 123456</p>
          <p>教师账号: teacher / 123456</p>
          <p>学生账号: student / 123456</p>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const store = useStore()
const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

const formData = reactive({
  username: '',
  password: '',
  userType: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  userType: [{ required: true, message: '请选择用户类型', trigger: 'change' }]
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    // 模拟登录验证
    if (
      (formData.username === 'admin' && formData.password === '123456' && formData.userType === 'admin') ||
      (formData.username === 'teacher' && formData.password === '123456' && formData.userType === 'teacher') ||
      (formData.username === 'student' && formData.password === '123456' && formData.userType === 'student')
    ) {
      await store.dispatch('user/login', formData)
      ElMessage.success('登录成功')
      router.push('/')
    } else {
      ElMessage.error('用户名或密码错误')
    }
  } catch (error) {
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f3f3f3;
}

.login-card {
  width: 400px;
}

.login-title {
  text-align: center;
  color: #303133;
  margin: 0;
}

.tips {
  margin-top: 20px;
  color: #666;
}

.tips p {
  margin: 5px 0;
  font-size: 13px;
}
</style> 