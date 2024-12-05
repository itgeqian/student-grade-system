<template>
  <div class="user-container">
    <el-card>
      <template #header>
        <div class="header">
          <span>用户管理</span>
          <el-button type="primary" @click="handleAdd">新增用户</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="queryParams.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="用户类型">
          <el-select v-model="queryParams.userType" placeholder="请选择用户类型">
            <el-option label="管理员" value="admin" />
            <el-option label="教师" value="teacher" />
            <el-option label="学生" value="student" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 用户列表 -->
      <el-table :data="userList" v-loading="loading" border>
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="userType" label="用户类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.userType === 'admin' ? 'danger' : row.userType === 'teacher' ? 'warning' : 'info'">
              {{ row.userType === 'admin' ? '管理员' : row.userType === 'teacher' ? '教师' : '学生' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="所属部门" width="150" />
        <el-table-column prop="createTime" label="创建时间" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="warning" link @click="handleResetPassword(row)">重置密码</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 用户表单对话框 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="500px"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="dialog.type === 'edit'" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userForm.name" />
        </el-form-item>
        <el-form-item label="用户类型" prop="userType">
          <el-select v-model="userForm.userType">
            <el-option label="管理员" value="admin" />
            <el-option label="教师" value="teacher" />
            <el-option label="学生" value="student" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属部门" prop="department">
          <el-select v-model="userForm.department">
            <el-option
              v-for="dept in departmentOptions"
              :key="dept.id"
              :label="dept.name"
              :value="dept.name"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialog.visible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useSystemStore, useUserStore } from '@/store'

const systemStore = useSystemStore()
const userStore = useUserStore()

const loading = ref(false)
const userList = ref([])

// 查询参数
const queryParams = reactive({
  username: '',
  userType: ''
})

// 对话框
const dialog = reactive({
  visible: false,
  title: '',
  type: 'add'
})

// 表单
const userFormRef = ref(null)
const userForm = reactive({
  username: '',
  name: '',
  userType: '',
  department: ''
})

// 部门选项
const departmentOptions = computed(() => {
  return [
    { id: 1, name: '计算机学院' },
    { id: 2, name: '信息学院' }
  ]
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度不能小于3位', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  userType: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ]
}

// 初始化数据
onMounted(() => {
  handleQuery()
})

// 查询用户列表
const handleQuery = () => {
  loading.value = true
  let list = systemStore.users
  
  if (queryParams.username) {
    list = list.filter(item => item.username.includes(queryParams.username))
  }
  if (queryParams.userType) {
    list = list.filter(item => item.userType === queryParams.userType)
  }
  
  userList.value = list
  loading.value = false
}

// 重置查询
const resetQuery = () => {
  queryParams.username = ''
  queryParams.userType = ''
  handleQuery()
}

// 新增用户
const handleAdd = () => {
  dialog.type = 'add'
  dialog.title = '新增用户'
  dialog.visible = true
  Object.assign(userForm, {
    username: '',
    name: '',
    userType: '',
    department: ''
  })
}

// 编辑用户
const handleEdit = (row) => {
  dialog.type = 'edit'
  dialog.title = '编辑用户'
  dialog.visible = true
  Object.assign(userForm, row)
}

// 提交表单
const submitForm = async () => {
  if (!userFormRef.value) return
  
  try {
    await userFormRef.value.validate()
    
    if (dialog.type === 'add') {
      // 检查用户名是否已存在
      if (systemStore.users.some(user => user.username === userForm.username)) {
        throw new Error('用户名已存在')
      }
      
      systemStore.addUser(userForm)
      // 为新用户设置默认密码
      userStore.passwords[userForm.username] = '123456'
      ElMessage.success('添加成功')
    } else {
      systemStore.updateUser(userForm)
      ElMessage.success('修改成功')
    }
    
    dialog.visible = false
    handleQuery()
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 删除用户
const handleDelete = (row) => {
  ElMessageBox.confirm('确认要删除该用户吗？删除后无法恢复', '警告', {
    type: 'warning'
  }).then(() => {
    systemStore.deleteUser(row.username)
    // 同时删除用户密码
    delete userStore.passwords[row.username]
    ElMessage.success('删除成功')
    handleQuery()
  }).catch(() => {})
}

// 重置密码
const handleResetPassword = (row) => {
  ElMessageBox.confirm('确认要重置该用户的密码吗？', '警告', {
    type: 'warning'
  }).then(() => {
    systemStore.resetUserPassword(row.username)
    ElMessage.success('密码已重置为：123456')
  }).catch(() => {})
}
</script>

<style scoped>
.user-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}
</style> 