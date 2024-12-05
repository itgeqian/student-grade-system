<template>
  <div class="teacher-container">
    <el-card>
      <template #header>
        <div class="header">
          <span>教师管理</span>
          <div class="header-btns">
            <el-button type="primary" @click="handleAdd">新增教师</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="工号">
          <el-input v-model="queryParams.id" placeholder="请输入工号" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="queryParams.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="所属院系">
          <el-select v-model="queryParams.department" placeholder="请选择院系">
            <el-option
              v-for="dept in departmentOptions"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 教师列表 -->
      <el-table :data="teacherList" v-loading="loading" border>
        <el-table-column prop="id" label="工号" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="department" label="所属院系" width="150" />
        <el-table-column prop="title" label="职称" width="120" />
        <el-table-column prop="phone" label="联系电话" width="150" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '在职' : '离职' }}
            </el-tag>
          </template>
        </el-table-column>
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
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 教师表单对话框 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="600px"
    >
      <el-form
        ref="teacherFormRef"
        :model="teacherForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="工号" prop="id">
          <el-input 
            v-model="teacherForm.id" 
            placeholder="请输入工号"
            :disabled="dialog.type === 'edit'"
          />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="teacherForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="所属院系" prop="department">
          <el-select v-model="teacherForm.department" placeholder="请选择院系">
            <el-option
              v-for="dept in departmentOptions"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="职称" prop="title">
          <el-select v-model="teacherForm.title" placeholder="请选择职称">
            <el-option label="教授" value="教授" />
            <el-option label="副教授" value="副教授" />
            <el-option label="讲师" value="讲师" />
            <el-option label="助教" value="助教" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="teacherForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="teacherForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="teacherForm.status">
            <el-radio :label="1">在职</el-radio>
            <el-radio :label="0">离职</el-radio>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDataStore } from '@/store'

const dataStore = useDataStore()
const teacherList = ref([])

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  id: '',
  name: '',
  department: ''
})

// 部门选项
const departmentOptions = ref([
  { id: 1, name: '计算机学院' },
  { id: 2, name: '软件学院' }
])

const loading = ref(false)
const total = ref(0)

// 对话框状态
const dialog = reactive({
  visible: false,
  title: '',
  type: 'add'
})

// 表单数据
const teacherForm = reactive({
  id: '',
  name: '',
  department: '',
  title: '',
  phone: '',
  email: '',
  status: 1
})

// 表单验证规则
const rules = {
  id: [
    { required: true, message: '请输入工号', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '请选择院系', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请选择职称', trigger: 'change' }
  ]
}

// 初始化数据
onMounted(() => {
  teacherList.value = dataStore.teachers
  total.value = dataStore.teachers.length
})

// 方法
const handleQuery = () => {
  loading.value = true
  // 根据查询条件过滤数据
  const filteredList = dataStore.teachers.filter(teacher => {
    const matchId = !queryParams.id || teacher.id.includes(queryParams.id)
    const matchName = !queryParams.name || teacher.name.includes(queryParams.name)
    const matchDept = !queryParams.department || teacher.department === departmentOptions.value.find(d => d.id === queryParams.department)?.name
    return matchId && matchName && matchDept
  })
  
  total.value = filteredList.length
  teacherList.value = filteredList.slice(
    (queryParams.pageNum - 1) * queryParams.pageSize,
    queryParams.pageNum * queryParams.pageSize
  )
  loading.value = false
}

const handleAdd = () => {
  dialog.type = 'add'
  dialog.title = '新增教师'
  dialog.visible = true
  Object.assign(teacherForm, {
    id: '',
    name: '',
    department: '',
    title: '',
    phone: '',
    email: '',
    status: 1
  })
}

const handleEdit = (row) => {
  dialog.type = 'edit'
  dialog.title = '编辑教师'
  dialog.visible = true
  Object.assign(teacherForm, row)
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认要删除该教师吗？删除后无法恢复', '警告', {
    type: 'warning'
  }).then(() => {
    dataStore.deleteTeacher(row.id)
    teacherList.value = dataStore.teachers
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const submitForm = async () => {
  if (dialog.type === 'add') {
    dataStore.addTeacher({
      ...teacherForm,
      id: 'T' + Date.now()
    })
    ElMessage.success('添加成功')
  } else {
    dataStore.updateTeacher(teacherForm)
    ElMessage.success('修改成功')
  }
  dialog.visible = false
  teacherList.value = dataStore.teachers
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
  queryParams.id = ''
  queryParams.name = ''
  queryParams.department = ''
  queryParams.pageNum = 1
  handleQuery()
}
</script>

<style scoped>
.teacher-container {
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