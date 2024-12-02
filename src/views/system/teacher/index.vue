<template>
  <div class="teacher-container">
    <el-card>
      <template #header>
        <div class="header">
          <span>教师管理</span>
          <div class="header-btns">
            <el-upload
              class="upload-demo"
              action="#"
              :show-file-list="false"
              :before-upload="handleImportExcel"
            >
              <el-button type="success">导入教师</el-button>
            </el-upload>
            <el-button type="info" @click="downloadTemplate">下载模板</el-button>
            <el-button type="warning" @click="exportSelected">导出选中</el-button>
            <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
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
        <el-form-item label="所属部门">
          <el-select v-model="queryParams.department" placeholder="请选择部门">
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
      <el-table :data="teacherList" v-loading="loading" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="工号" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="department" label="所属部门" width="150" />
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
        <el-table-column label="操作" width="250" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link @click="handleViewCourses(row)">查看课程</el-button>
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
        <el-form-item label="所属部门" prop="department">
          <el-select v-model="teacherForm.department" placeholder="请选择部门">
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
        <el-form-item label="备注">
          <el-input
            v-model="teacherForm.remark"
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

    <!-- 课程列表对话框 -->
    <el-dialog
      :title="`${currentTeacher?.name} - 授课列表`"
      v-model="courseDialog.visible"
      width="800px"
    >
      <el-table :data="courseDialog.list" border>
        <el-table-column prop="id" label="课程编号" width="120" />
        <el-table-column prop="name" label="课程名称" />
        <el-table-column prop="credit" label="学分" width="80" />
        <el-table-column prop="hours" label="学时" width="80" />
        <el-table-column prop="semester" label="学期" width="120" />
        <el-table-column prop="studentCount" label="学生人数" width="100" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as XLSX from 'xlsx'

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
  { id: 2, name: '软件学院' },
  { id: 3, name: '外国语学院' }
])

// 教师列表数据
const teacherList = ref([
  {
    id: 'T001',
    name: '张老师',
    department: 1,
    title: '教授',
    phone: '13800138000',
    email: 'zhang@example.com',
    status: 1,
    remark: ''
  },
  {
    id: 'T002',
    name: '李老师',
    department: 1,
    title: '副教授',
    phone: '13800138001',
    email: 'li@example.com',
    status: 1,
    remark: ''
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

const teacherForm = reactive({
  id: '',
  name: '',
  department: '',
  title: '',
  phone: '',
  email: '',
  status: 1,
  remark: ''
})

// 表单验证规则
const rules = {
  id: [
    { required: true, message: '请输入工号', trigger: 'blur' },
    { pattern: /^T\d{3}$/, message: '工号格式为T开头加3位数字', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '请选择所属部门', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请选择职称', trigger: 'change' }
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

const teacherFormRef = ref(null)

// 课程对话框相关
const courseDialog = reactive({
  visible: false,
  list: []
})

const currentTeacher = ref(null)

// 添加选择相关数据
const selectedRows = ref([])

// 添加一个变量来存储原始数据
const originalTeacherList = ref([
  {
    id: 'T001',
    name: '张老师',
    department: 1,
    title: '教授',
    phone: '13800138000',
    email: 'zhang@example.com',
    status: 1,
    remark: ''
  },
  {
    id: 'T002',
    name: '李老师',
    department: 1,
    title: '副教授',
    phone: '13800138001',
    email: 'li@example.com',
    status: 1,
    remark: ''
  }
])

// 方法
const handleQuery = () => {
  loading.value = true
  
  // 根据搜索条件过滤教师列表
  const filteredList = originalTeacherList.value.filter(teacher => {
    const matchId = !queryParams.id || 
      teacher.id.toLowerCase().includes(queryParams.id.toLowerCase())
    
    const matchName = !queryParams.name || 
      teacher.name.toLowerCase().includes(queryParams.name.toLowerCase())
    
    const matchDepartment = !queryParams.department || 
      teacher.department === queryParams.department
    
    return matchId && matchName && matchDepartment
  })
  
  total.value = filteredList.length
  
  // 模拟分页
  const start = (queryParams.pageNum - 1) * queryParams.pageSize
  const end = start + queryParams.pageSize
  
  // 更新显示列表
  teacherList.value = filteredList.slice(start, end)
  
  loading.value = false
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
  reloadData() // 重置时重新加载所有数据
  handleQuery()
}

const handleAdd = () => {
  dialog.type = 'add'
  dialog.title = '添加教师'
  dialog.visible = true
  Object.assign(teacherForm, {
    id: '',
    name: '',
    department: '',
    title: '',
    phone: '',
    email: '',
    status: 1,
    remark: ''
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
    // 从原始数据中删除
    originalTeacherList.value = originalTeacherList.value.filter(item => item.id !== row.id)
    // 重新查询以更新显示
    handleQuery()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleViewCourses = (row) => {
  currentTeacher.value = row
  // 模拟获取教师课程列表
  courseDialog.list = [
    {
      id: 'CS001',
      name: '计算机导论',
      credit: 3,
      hours: 48,
      semester: '2023-2024-1',
      studentCount: 60
    },
    {
      id: 'CS002',
      name: '程序设计基础',
      credit: 4,
      hours: 64,
      semester: '2023-2024-1',
      studentCount: 55
    }
  ]
  courseDialog.visible = true
}

const submitForm = async () => {
  if (!teacherFormRef.value) return

  try {
    await teacherFormRef.value.validate()
    if (dialog.type === 'add') {
      // 生成新ID
      const newId = `T${String(originalTeacherList.value.length + 1).padStart(3, '0')}`
      // 添加到原始数据
      originalTeacherList.value.push({
        ...teacherForm,
        id: newId
      })
    } else {
      // 更新原始数据
      const index = originalTeacherList.value.findIndex(item => item.id === teacherForm.id)
      if (index !== -1) {
        originalTeacherList.value[index] = {
          ...originalTeacherList.value[index],
          ...teacherForm
        }
      }
    }
    
    dialog.visible = false
    ElMessage.success(dialog.type === 'add' ? '添加成功' : '修改成功')
    // 重新查询以更新显示
    handleQuery()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 处理导入Excel
const handleImportExcel = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const data = e.target.result
    const workbook = XLSX.read(data, { type: 'array' })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    const teachers = XLSX.utils.sheet_to_json(firstSheet)
    
    // 处理导入的教师数据
    teachers.forEach(teacher => {
      // TODO: 调用后端 API 保存教师数据
      console.log('导入教师:', teacher)
    })
    
    ElMessage.success(`成功导入 ${teachers.length} 名教师`)
  }
  reader.readAsArrayBuffer(file.raw)
  return false // 阻止自动上传
}

// 下载模板
const downloadTemplate = () => {
  const template = [
    ['工号', '姓名', '所属部门', '职称', '联系电话', '邮箱'],
    ['T001', '张老师', '计算机学院', '教授', '13800138000', 'zhang@example.com']
  ]
  
  const ws = XLSX.utils.aoa_to_sheet(template)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Template')
  XLSX.writeFile(wb, '教师导入模板.xlsx')
}

// 修改重新加载数据方法
const reloadData = () => {
  // 这里应该是从后端获取数据
  originalTeacherList.value = [
    {
      id: 'T001',
      name: '张老师',
      department: 1,
      title: '教授',
      phone: '13800138000',
      email: 'zhang@example.com',
      status: 1,
      remark: ''
    },
    {
      id: 'T002',
      name: '李老师',
      department: 1,
      title: '副教授',
      phone: '13800138001',
      email: 'li@example.com',
      status: 1,
      remark: ''
    }
  ]
  // 重新查询以更新显示
  handleQuery()
}

// 添加选择相关方法
const handleSelectionChange = (val) => {
  selectedRows.value = val
}

// 修改批量删除方法
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的教师')
    return
  }

  ElMessageBox.confirm(
    `确认要删除选中的 ${selectedRows.value.length} 名教师吗？删除后无法恢复`, 
    '警告',
    {
      type: 'warning'
    }
  ).then(() => {
    const ids = selectedRows.value.map(row => row.id)
    // 从原始数据中删除
    originalTeacherList.value = originalTeacherList.value.filter(item => !ids.includes(item.id))
    // 重新查询以更新显示
    handleQuery()
    ElMessage.success('删除成功')
    // 清空选择
    selectedRows.value = []
  }).catch(() => {})
}

// 添加导出选中数据方法
const exportSelected = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要导出的教师')
    return
  }

  const headers = ['工号', '姓名', '所属部门', '职称', '联系电话', '邮箱', '状态']
  const data = selectedRows.value.map(teacher => [
    teacher.id,
    teacher.name,
    departmentOptions.value.find(dept => dept.id === teacher.department)?.name || '',
    teacher.title,
    teacher.phone,
    teacher.email,
    teacher.status === 1 ? '在职' : '离职'
  ])

  const ws = XLSX.utils.aoa_to_sheet([headers, ...data])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Teachers')
  XLSX.writeFile(wb, '教师信息.xlsx')
}

// 优化表格显示
const formatDepartment = (row) => {
  return departmentOptions.value.find(dept => dept.id === row.department)?.name || ''
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

.header-btns {
  display: flex;
  gap: 10px;
}

.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.upload-demo {
  display: inline-block;
}

.table-operations {
  display: flex;
  gap: 8px;
}

/* 优化表格样式 */
:deep(.el-table) {
  margin-top: 15px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
}

:deep(.el-table td) {
  padding: 8px 0;
}

:deep(.el-tag) {
  margin: 0 2px;
}
</style> 