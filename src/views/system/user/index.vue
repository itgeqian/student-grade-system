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
      <el-table :data="userList" v-loading="loading">
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="userType" label="用户类型" width="100">
          <template #default="{ row }">
            <el-tag :type="userTypeMap[row.userType].type">
              {{ userTypeMap[row.userType].label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="所属部门" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link @click="handleResetPwd(row)">重置密码</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
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
          <el-input 
            v-model="userForm.username" 
            placeholder="请输入用户名"
            :disabled="dialog.type === 'edit'"
          />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="用户类型" prop="userType">
          <el-select 
            v-model="userForm.userType" 
            placeholder="请选择用户类型"
            @change="handleUserTypeChange"
          >
            <el-option label="管理员" value="admin" />
            <el-option label="教师" value="teacher" />
            <el-option label="学生" value="student" />
          </el-select>
        </el-form-item>
        <el-form-item 
          label="所属部门" 
          prop="department"
          v-if="userForm.userType !== 'admin'"
        >
          <el-select v-model="userForm.department" placeholder="请选择部门">
            <el-option 
              v-for="dept in departmentOptions" 
              :key="dept.id" 
              :label="dept.name" 
              :value="dept.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialog.type === 'add'">
          <el-input 
            v-model="userForm.password" 
            type="password" 
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" v-if="dialog.type === 'add'">
          <el-input 
            v-model="userForm.confirmPassword" 
            type="password" 
            placeholder="请确认密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input 
            v-model="userForm.remark" 
            type="textarea" 
            placeholder="请输入备注信息"
          />
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
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  username: '',
  userType: ''
})

// 用户类型映射
const userTypeMap = {
  admin: { label: '管理员', type: 'danger' },
  teacher: { label: '教师', type: 'warning' },
  student: { label: '学生', type: 'success' }
}

// 部门选项
const departmentOptions = ref([
  { id: 1, name: '计算机学院' },
  { id: 2, name: '软件学院' },
  { id: 3, name: '外国语学院' }
])

// 用户列表数据
const userList = ref([
  {
    id: 1,
    username: 'admin',
    name: '管理员',
    userType: 'admin',
    department: null,
    createTime: '2024-01-01',
    status: 1
  },
  {
    id: 2,
    username: 'teacher1',
    name: '张老师',
    userType: 'teacher',
    department: '计算机学院',
    createTime: '2024-01-02',
    status: 1
  }
])

const loading = ref(false)
const total = ref(2)

// 表单相关
const dialog = reactive({
  visible: false,
  title: '',
  type: 'add'
})

const userForm = reactive({
  username: '',
  name: '',
  userType: '',
  department: '',
  password: '',
  confirmPassword: '',
  remark: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 20, message: '长度在 4 到 20 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  userType: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ],
  department: [
    { required: true, message: '请选择所属部门', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== userForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const userFormRef = ref(null)

// 方法
const handleQuery = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const resetQuery = () => {
  queryParams.username = ''
  queryParams.userType = ''
  handleQuery()
}

const handleAdd = () => {
  dialog.type = 'add'
  dialog.title = '添加用户'
  dialog.visible = true
  Object.assign(userForm, {
    username: '',
    name: '',
    userType: '',
    department: '',
    password: '',
    confirmPassword: '',
    remark: ''
  })
}

const handleEdit = (row) => {
  dialog.type = 'edit'
  dialog.title = '编辑用户'
  dialog.visible = true
  Object.assign(userForm, {
    ...row,
    password: '',
    confirmPassword: ''
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认要删除该用户吗？', '警告', {
    type: 'warning'
  }).then(() => {
    userList.value = userList.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleResetPwd = (row) => {
  ElMessageBox.confirm('确认要重置该用户的密码吗？', '警告', {
    type: 'warning'
  }).then(() => {
    // TODO: 调用API重置密码
    ElMessage.success('密码重置成功')
  }).catch(() => {})
}

const handleStatusChange = (row) => {
  const text = row.status === 1 ? '启用' : '停用'
  ElMessage.success(`已${text}用户：${row.username}`)
}

const handleUserTypeChange = (value) => {
  if (value === 'admin') {
    userForm.department = ''
  }
}

const submitForm = async () => {
  if (!userFormRef.value) return

  try {
    await userFormRef.value.validate()
    if (dialog.type === 'add') {
      // TODO: 调用API添加用户
      userList.value.push({
        id: userList.value.length + 1,
        ...userForm,
        createTime: new Date().toLocaleString(),
        status: 1
      })
    } else {
      // TODO: 调用API更新用户
      const index = userList.value.findIndex(item => item.username === userForm.username)
      if (index !== -1) {
        userList.value[index] = {
          ...userList.value[index],
          ...userForm
        }
      }
    }
    
    dialog.visible = false
    ElMessage.success(dialog.type === 'add' ? '添加成功' : '修改成功')
    handleQuery()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 