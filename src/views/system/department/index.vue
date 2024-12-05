<template>
  <div class="department-container">
    <el-card>
      <template #header>
        <div class="header">
          <span>院系管理</span>
          <div class="header-btns">
            <el-button type="primary" @click="handleAdd">新增院系</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="院系名称">
          <el-input v-model="queryParams.name" placeholder="请输入院系名称" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="queryParams.leader" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 院系列表 -->
      <el-table :data="departmentList" v-loading="loading" border>
        <el-table-column prop="id" label="编号" width="100" />
        <el-table-column prop="name" label="院系名称" width="200" />
        <el-table-column prop="leader" label="负责人" width="120" />
        <el-table-column prop="phone" label="联系电话" width="150" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link @click="handleViewTeachers(row)">查看教师</el-button>
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
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 院系表单对话框 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="600px"
    >
      <el-form
        ref="departmentFormRef"
        :model="departmentForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="院系名称" prop="name">
          <el-input v-model="departmentForm.name" placeholder="请输入院系名称" />
        </el-form-item>
        <el-form-item label="负责人" prop="leader">
          <el-input v-model="departmentForm.leader" placeholder="请输入负责人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="departmentForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="departmentForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="departmentForm.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialog.visible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 教师列表对话框 -->
    <el-dialog
      :title="`${currentDepartment?.name} - 教师列表`"
      v-model="teacherDialog.visible"
      width="800px"
    >
      <el-table :data="teacherDialog.list" border>
        <el-table-column prop="id" label="工号" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="title" label="职称" width="120" />
        <el-table-column prop="phone" label="联系电话" width="150" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDataStore } from '@/store'

const dataStore = useDataStore()
const departmentList = ref([])

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: '',
  leader: ''
})

const loading = ref(false)
const total = ref(0)

// 对话框状态
const dialog = reactive({
  visible: false,
  title: '',
  type: 'add'
})

// 教师列表对话框
const teacherDialog = reactive({
  visible: false,
  list: []
})

const currentDepartment = ref(null)

// 表单数据
const departmentForm = reactive({
  name: '',
  leader: '',
  phone: '',
  email: '',
  status: 1
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入院系名称', trigger: 'blur' }
  ],
  leader: [
    { required: true, message: '请输入负责人', trigger: 'blur' }
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

// 初始化数据
onMounted(() => {
  departmentList.value = dataStore.departments
  total.value = dataStore.departments.length
})

// 方法
const handleQuery = () => {
  loading.value = true
  // 根据查询条件过滤数据
  const filteredList = dataStore.departments.filter(dept => {
    const matchName = !queryParams.name || dept.name.includes(queryParams.name)
    const matchLeader = !queryParams.leader || dept.leader.includes(queryParams.leader)
    return matchName && matchLeader
  })
  
  total.value = filteredList.length
  departmentList.value = filteredList.slice(
    (queryParams.pageNum - 1) * queryParams.pageSize,
    queryParams.pageNum * queryParams.pageSize
  )
  loading.value = false
}

const handleAdd = () => {
  dialog.type = 'add'
  dialog.title = '新增院系'
  dialog.visible = true
  Object.assign(departmentForm, {
    name: '',
    leader: '',
    phone: '',
    email: '',
    status: 1
  })
}

const handleEdit = (row) => {
  dialog.type = 'edit'
  dialog.title = '编辑院系'
  dialog.visible = true
  Object.assign(departmentForm, row)
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认要删除该院系吗？删除后无法恢复', '警告', {
    type: 'warning'
  }).then(() => {
    dataStore.deleteDepartment(row.id)
    departmentList.value = dataStore.departments
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleViewTeachers = (row) => {
  currentDepartment.value = row
  // 获取该院系的教师列表
  teacherDialog.list = dataStore.teachers.filter(teacher => teacher.department === row.name)
  teacherDialog.visible = true
}

const submitForm = async () => {
  if (dialog.type === 'add') {
    dataStore.addDepartment({
      ...departmentForm,
      id: Date.now()
    })
    ElMessage.success('添加成功')
  } else {
    dataStore.updateDepartment(departmentForm)
    ElMessage.success('修改成功')
  }
  dialog.visible = false
  departmentList.value = dataStore.departments
}

const handleSizeChange = (val) => {
  queryParams.pageSize = val
  queryParams.pageNum = 1
  handleQuery()
}

const handleCurrentChange = (val) => {
  queryParams.pageNum = val
  handleQuery()
}

const resetQuery = () => {
  queryParams.name = ''
  queryParams.leader = ''
  queryParams.pageNum = 1
  handleQuery()
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