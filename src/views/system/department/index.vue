<template>
  <div class="department-container">
    <el-card>
      <template #header>
        <div class="header">
          <span>部门管理</span>
          <el-button type="primary" @click="handleAdd">新增部门</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="部门名称">
          <el-input v-model="queryParams.name" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 部门列表 -->
      <el-table :data="departmentList" v-loading="loading" border>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="部门名称" />
        <el-table-column prop="leader" label="负责人" width="120" />
        <el-table-column prop="phone" label="联系电话" width="150" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
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

    <!-- 部门表单对话框 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="500px"
    >
      <el-form
        ref="departmentFormRef"
        :model="departmentForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="departmentForm.name" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="负责人" prop="leader">
          <el-select 
            v-model="departmentForm.leader" 
            placeholder="请选择负责人"
            filterable
          >
            <el-option
              v-for="teacher in teacherOptions"
              :key="teacher.id"
              :label="teacher.name"
              :value="teacher.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="departmentForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="departmentForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="排序" prop="orderNum">
          <el-input-number 
            v-model="departmentForm.orderNum" 
            :min="0" 
            :max="999" 
            controls-position="right" 
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="departmentForm.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="departmentForm.remark"
            type="textarea"
            placeholder="请输入备注"
            :rows="3"
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
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: ''
})

// 教师选项
const teacherOptions = ref([
  { id: 1, name: '张老师' },
  { id: 2, name: '李老师' },
  { id: 3, name: '王老师' }
])

// 部门列表数据
const departmentList = ref([
  {
    id: 1,
    name: '计算机学院',
    leader: '张老师',
    phone: '13800138000',
    email: 'cs@example.com',
    status: 1,
    orderNum: 1,
    createTime: '2024-01-01',
    remark: '计算机科学与技术学院'
  },
  {
    id: 2,
    name: '软件学院',
    leader: '李老师',
    phone: '13800138001',
    email: 'se@example.com',
    status: 1,
    orderNum: 2,
    createTime: '2024-01-02',
    remark: '软件工程学院'
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

const departmentForm = reactive({
  name: '',
  leader: '',
  phone: '',
  email: '',
  orderNum: 0,
  status: 1,
  remark: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  leader: [
    { required: true, message: '请选择负责人', trigger: 'change' }
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

const departmentFormRef = ref(null)

// 方法
const handleQuery = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const resetQuery = () => {
  queryParams.name = ''
  handleQuery()
}

const handleAdd = () => {
  dialog.type = 'add'
  dialog.title = '添加部门'
  dialog.visible = true
  Object.assign(departmentForm, {
    name: '',
    leader: '',
    phone: '',
    email: '',
    orderNum: 0,
    status: 1,
    remark: ''
  })
}

const handleEdit = (row) => {
  dialog.type = 'edit'
  dialog.title = '编辑部门'
  dialog.visible = true
  Object.assign(departmentForm, row)
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认要删除该部门吗？删除后无法恢复', '警告', {
    type: 'warning'
  }).then(() => {
    departmentList.value = departmentList.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleStatusChange = (row) => {
  const text = row.status === 1 ? '启用' : '停用'
  ElMessage.success(`已${text}部门：${row.name}`)
}

const submitForm = async () => {
  if (!departmentFormRef.value) return

  try {
    await departmentFormRef.value.validate()
    if (dialog.type === 'add') {
      // TODO: 调用API添加部门
      departmentList.value.push({
        id: departmentList.value.length + 1,
        ...departmentForm,
        createTime: new Date().toLocaleString()
      })
    } else {
      // TODO: 调用API更新部门
      const index = departmentList.value.findIndex(item => item.id === departmentForm.id)
      if (index !== -1) {
        departmentList.value[index] = {
          ...departmentList.value[index],
          ...departmentForm
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
.department-container {
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