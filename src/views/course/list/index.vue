<template>
  <div class="course-container">
    <el-card>
      <template #header>
        <div class="header">
          <span>课程管理</span>
          <el-button type="primary" @click="handleAdd">新增课程</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="课程编号">
          <el-input v-model="queryParams.id" placeholder="请输入课程编号" />
        </el-form-item>
        <el-form-item label="课程名称">
          <el-input v-model="queryParams.name" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="开课院系">
          <el-select v-model="queryParams.department" placeholder="请选择院系">
            <el-option label="计算机学院" value="计算机学院" />
            <el-option label="软件学院" value="软件学院" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格区域 -->
      <el-table :data="courseList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="课程编号" width="120" />
        <el-table-column prop="name" label="课程名称" />
        <el-table-column prop="credit" label="学分" width="80" />
        <el-table-column prop="hours" label="学时" width="80" />
        <el-table-column prop="department" label="开课院系" />
        <el-table-column prop="teacher" label="任课教师" />
        <el-table-column prop="semester" label="开课学期" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
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

    <!-- 课程表单对话框 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="500px"
      append-to-body
    >
      <el-form
        ref="courseFormRef"
        :model="courseForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="课程编号" prop="id">
          <el-input v-model="courseForm.id" placeholder="请输入课程编号" />
        </el-form-item>
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="courseForm.name" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="学分" prop="credit">
          <el-input-number v-model="courseForm.credit" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="学时" prop="hours">
          <el-input-number v-model="courseForm.hours" :min="16" :max="100" />
        </el-form-item>
        <el-form-item label="开课院系" prop="department">
          <el-select v-model="courseForm.department" placeholder="请选择院系">
            <el-option label="计算机学院" value="计算机学院" />
            <el-option label="软件学院" value="软件学院" />
          </el-select>
        </el-form-item>
        <el-form-item label="任课教师" prop="teacher">
          <el-select v-model="courseForm.teacher" placeholder="请选择教师">
            <el-option label="张老师" value="张老师" />
            <el-option label="李老师" value="李老师" />
            <el-option label="王老师" value="王老师" />
          </el-select>
        </el-form-item>
        <el-form-item label="开课学期" prop="semester">
          <el-select v-model="courseForm.semester" placeholder="请选择学期">
            <el-option label="2023-2024-1" value="2023-2024-1" />
            <el-option label="2023-2024-2" value="2023-2024-2" />
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
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  id: '',
  name: '',
  department: ''
})

// 模拟数据
const courseList = ref([
  {
    id: 'CS001',
    name: '计算机导论',
    credit: 3,
    hours: 48,
    department: '计算机学院',
    teacher: '张老师',
    semester: '2023-2024-1'
  },
  {
    id: 'CS002',
    name: '程序设计基础',
    credit: 4,
    hours: 64,
    department: '计算机学院',
    teacher: '李老师',
    semester: '2023-2024-1'
  }
])

const loading = ref(false)
const total = ref(2)

// 表单相关
const dialog = reactive({
  visible: false,
  title: '',
  type: ''
})

const courseForm = reactive({
  id: '',
  name: '',
  credit: 3,
  hours: 48,
  department: '',
  teacher: '',
  semester: ''
})

const rules = {
  id: [{ required: true, message: '请输入课程编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  credit: [{ required: true, message: '请输入学分', trigger: 'blur' }],
  hours: [{ required: true, message: '请输入学时', trigger: 'blur' }],
  department: [{ required: true, message: '请选择开课院系', trigger: 'change' }],
  teacher: [{ required: true, message: '请选择任课教师', trigger: 'change' }],
  semester: [{ required: true, message: '请选择开课学期', trigger: 'change' }]
}

const courseFormRef = ref(null)

// 方法
const handleQuery = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const resetQuery = () => {
  queryParams.id = ''
  queryParams.name = ''
  queryParams.department = ''
  handleQuery()
}

const handleAdd = () => {
  dialog.type = 'add'
  dialog.title = '添加课程'
  dialog.visible = true
  Object.assign(courseForm, {
    id: '',
    name: '',
    credit: 3,
    hours: 48,
    department: '',
    teacher: '',
    semester: ''
  })
}

const handleEdit = (row) => {
  dialog.type = 'edit'
  dialog.title = '编辑课程'
  dialog.visible = true
  Object.assign(courseForm, row)
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认要删除该课程吗？', '警告', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const submitForm = async () => {
  if (!courseFormRef.value) return
  
  try {
    await courseFormRef.value.validate()
    ElMessage.success(dialog.type === 'add' ? '添加成功' : '修改成功')
    dialog.visible = false
    handleQuery()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleSizeChange = (val) => {
  queryParams.pageSize = val
  handleQuery()
}

const handleCurrentChange = (val) => {
  queryParams.pageNum = val
  handleQuery()
}
</script>

<style scoped>
.course-container {
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