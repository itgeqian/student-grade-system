<template>
  <div class="profile-container">
    <el-row :gutter="20">
      <!-- 个人信息卡片 -->
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>个人信息</span>
              <el-button type="primary" link @click="handleEdit">编辑</el-button>
            </div>
          </template>
          <div class="user-info">
            <div class="avatar-container">
              <el-avatar :size="100" :src="userInfo.avatar" />
              <div class="upload-btn" v-if="isEditing">
                <el-upload
                  class="avatar-uploader"
                  action="#"
                  :show-file-list="false"
                  :before-upload="beforeAvatarUpload"
                >
                  <el-button type="primary" link>更换头像</el-button>
                </el-upload>
              </div>
            </div>
            <div class="info-list">
              <div class="info-item">
                <span class="label">用户名：</span>
                <span>{{ userInfo.username }}</span>
              </div>
              <div class="info-item">
                <span class="label">姓名：</span>
                <span>{{ userInfo.name }}</span>
              </div>
              <div class="info-item">
                <span class="label">角色：</span>
                <el-tag :type="userTypeMap[userInfo.userType].type">
                  {{ userTypeMap[userInfo.userType].label }}
                </el-tag>
              </div>
              <div class="info-item">
                <span class="label">部门：</span>
                <span>{{ userInfo.department }}</span>
              </div>
              <div class="info-item">
                <span class="label">联系电话：</span>
                <span>{{ userInfo.phone }}</span>
              </div>
              <div class="info-item">
                <span class="label">邮箱：</span>
                <span>{{ userInfo.email }}</span>
              </div>
              <div class="info-item">
                <span class="label">最后登录：</span>
                <span>{{ userInfo.lastLogin }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 修改密码卡片 -->
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>修改密码</span>
            </div>
          </template>
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="100px"
          >
            <el-form-item label="原密码" prop="oldPassword">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                show-password
                placeholder="请输入原密码"
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                show-password
                placeholder="请输入新密码"
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                show-password
                placeholder="请确认新密码"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleChangePassword">
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 登录日志卡片 -->
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>登录日志</span>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(log, index) in loginLogs"
              :key="index"
              :timestamp="log.time"
              :type="log.status === 'success' ? 'success' : 'danger'"
            >
              {{ log.message }}
              <div class="log-detail">
                <span>IP地址：{{ log.ip }}</span>
                <span>设备：{{ log.device }}</span>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <!-- 编辑个人信息对话框 -->
    <el-dialog
      title="编辑个人信息"
      v-model="editDialog.visible"
      width="500px"
    >
      <el-form
        ref="userFormRef"
        :model="editForm"
        :rules="userRules"
        label-width="100px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialog.visible = false">取 消</el-button>
          <el-button type="primary" @click="handleSaveUserInfo">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// 用户类型映射
const userTypeMap = {
  admin: { label: '管理员', type: 'danger' },
  teacher: { label: '教师', type: 'warning' },
  student: { label: '学生', type: 'success' }
}

// 用户信息
const userInfo = reactive({
  username: 'admin',
  name: '管理员',
  userType: 'admin',
  department: '信息中心',
  phone: '13800138000',
  email: 'admin@example.com',
  avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
  lastLogin: '2024-01-20 10:00:00'
})

// 修改密码表单
const passwordFormRef = ref(null)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码表单验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{6,20}$/,
      message: '密码必须包含大小写字母和数字',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 登录日志
const loginLogs = ref([
  {
    time: '2024-01-20 10:00:00',
    status: 'success',
    message: '登录成功',
    ip: '192.168.1.1',
    device: 'Chrome 120.0.0.0'
  },
  {
    time: '2024-01-19 15:30:00',
    status: 'success',
    message: '登录成功',
    ip: '192.168.1.1',
    device: 'Chrome 120.0.0.0'
  },
  {
    time: '2024-01-19 09:15:00',
    status: 'failed',
    message: '密码错误',
    ip: '192.168.1.1',
    device: 'Chrome 120.0.0.0'
  }
])

// 编辑相关
const isEditing = ref(false)
const editDialog = reactive({
  visible: false
})

const editForm = reactive({
  name: '',
  phone: '',
  email: ''
})

const userRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 方法
const handleEdit = () => {
  editDialog.visible = true
  Object.assign(editForm, {
    name: userInfo.name,
    phone: userInfo.phone,
    email: userInfo.email
  })
}

const handleSaveUserInfo = async () => {
  const userFormRef = ref(null)
  if (!userFormRef.value) return

  try {
    await userFormRef.value.validate()
    // TODO: 调用API保存用户信息
    Object.assign(userInfo, editForm)
    editDialog.visible = false
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
    // TODO: 调用API修改密码
    ElMessage.success('密码修改成功')
    Object.assign(passwordForm, {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG && !isPNG) {
    ElMessage.error('头像只能是 JPG 或 PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  
  // TODO: 调用API上传头像
  return false
}
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  text-align: center;
}

.avatar-container {
  margin-bottom: 20px;
}

.upload-btn {
  margin-top: 10px;
}

.info-list {
  text-align: left;
}

.info-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.label {
  color: #606266;
  margin-right: 10px;
  width: 80px;
}

.log-detail {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
  display: flex;
  gap: 20px;
}

:deep(.el-timeline-item__content) {
  color: #303133;
}

:deep(.el-timeline-item__timestamp) {
  color: #909399;
}
</style> 