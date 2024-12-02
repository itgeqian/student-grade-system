<template>
  <div class="class-container">
    <el-card>
      <template #header>
        <div class="header">
          <span>班级管理</span>
          <div class="header-btns">
            <el-upload
              class="upload-demo"
              action="#"
              :show-file-list="false"
              :before-upload="handleImportExcel"
            >
              <el-button type="success">导入学生</el-button>
            </el-upload>
            <el-button type="info" @click="downloadTemplate">下载模板</el-button>
            <el-button type="primary" @click="handleAdd">新增班级</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="班级编号">
          <el-input v-model="queryParams.id" placeholder="请输入班级编号" />
        </el-form-item>
        <el-form-item label="班级名称">
          <el-input v-model="queryParams.name" placeholder="请输入班级名称" />
        </el-form-item>
        <el-form-item label="所属院系">
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
      <el-table :data="classList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="班级编号" width="120" />
        <el-table-column prop="name" label="班级名称" />
        <el-table-column prop="department" label="所属院系" />
        <el-table-column prop="grade" label="年级" />
        <el-table-column prop="advisor" label="班主任" />
        <el-table-column prop="studentCount" label="学生人数" width="100" />
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link @click="handleStudents(row)">学生名单</el-button>
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

    <!-- 班级表单对话框 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="500px"
      append-to-body
    >
      <el-form
        ref="classFormRef"
        :model="classForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="班级编号" prop="id">
          <el-input v-model="classForm.id" placeholder="请输入班级编号" />
        </el-form-item>
        <el-form-item label="班级名称" prop="name">
          <el-input v-model="classForm.name" placeholder="请输入班级名称" />
        </el-form-item>
        <el-form-item label="所属院系" prop="department">
          <el-select v-model="classForm.department" placeholder="请选择院系">
            <el-option label="计算机学院" value="计算机学院" />
            <el-option label="软件学院" value="软件学院" />
          </el-select>
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-select v-model="classForm.grade" placeholder="请选择年级">
            <el-option label="2021级" value="2021" />
            <el-option label="2022级" value="2022" />
            <el-option label="2023级" value="2023" />
          </el-select>
        </el-form-item>
        <el-form-item label="班主任" prop="advisor">
          <el-select v-model="classForm.advisor" placeholder="请选择班主任">
            <el-option label="张老师" value="张老师" />
            <el-option label="李老师" value="李老师" />
            <el-option label="王老师" value="王老师" />
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

    <!-- 学生名单对话框 -->
    <el-dialog
      :title="`${currentClass?.name} - 学生名单`"
      v-model="studentDialog.visible"
      width="900px"
      append-to-body
    >
      <div class="student-dialog-header">
        <div class="class-info">
          <p>班级编号：{{ currentClass?.id }}</p>
          <p>班主任：{{ currentClass?.advisor }}</p>
          <p>学生人数：{{ studentDialog.list.length }} 人</p>
        </div>
        <div class="header-btns">
          <el-button type="primary" @click="handleAddStudent">添加学生</el-button>
          <el-button type="success" @click="exportStudentList">导出名单</el-button>
        </div>
      </div>

      <el-table :data="studentDialog.list" style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="id" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="phone" label="联系电话" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEditStudent(row)">编辑</el-button>
            <el-button type="danger" link @click="handleRemoveStudent(row)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 学生表单对话框 -->
    <el-dialog
      :title="studentForm.type === 'add' ? '添加学生' : '编辑学生'"
      v-model="studentForm.visible"
      width="500px"
      append-to-body
    >
      <el-form
        ref="studentFormRef"
        :model="studentForm.data"
        :rules="studentRules"
        label-width="80px"
      >
        <el-form-item label="学号" prop="id">
          <el-input v-model="studentForm.data.id" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="studentForm.data.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="studentForm.data.gender" placeholder="请选择性别">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="studentForm.data.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="studentForm.data.email" placeholder="请输入邮箱" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="studentForm.visible = false">取 消</el-button>
          <el-button type="primary" @click="submitStudentForm">确 定</el-button>
        </div>
      </template>
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

// 模拟数据
const classList = ref([
  {
    id: 'CS2101',
    name: '计算机2101',
    department: '计算机学院',
    grade: '2021',
    advisor: '张老师',
    studentCount: 30
  },
  {
    id: 'CS2102',
    name: '计算机2102',
    department: '计算机学院',
    grade: '2021',
    advisor: '李老师',
    studentCount: 31
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

const classForm = reactive({
  id: '',
  name: '',
  department: '',
  grade: '',
  advisor: ''
})

const rules = {
  id: [{ required: true, message: '请输入班级编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
  department: [{ required: true, message: '请选择所属院系', trigger: 'change' }],
  grade: [{ required: true, message: '请选择年级', trigger: 'change' }],
  advisor: [{ required: true, message: '请选择班主任', trigger: 'change' }]
}

const classFormRef = ref(null)

// 学生名单对话框
const studentDialog = reactive({
  visible: false,
  list: []
})

// 当前选中的班级
const currentClass = ref(null)

// 学生表单
const studentForm = reactive({
  visible: false,
  type: 'add',
  data: {
    id: '',
    name: '',
    gender: '',
    phone: '',
    email: ''
  }
})

const studentRules = {
  id: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }]
}

// 添加 ref
const studentFormRef = ref(null)

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
  dialog.title = '添加班级'
  dialog.visible = true
  Object.assign(classForm, {
    id: '',
    name: '',
    department: '',
    grade: '',
    advisor: ''
  })
}

const handleEdit = (row) => {
  dialog.type = 'edit'
  dialog.title = '编辑班级'
  dialog.visible = true
  Object.assign(classForm, row)
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认要删除该班级吗？', '警告', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleStudents = (row) => {
  // 模拟获取学生名单
  studentDialog.list = [
    {
      id: '2021001',
      name: '张三',
      gender: '男',
      phone: '13800138000',
      email: 'zhangsan@example.com'
    },
    {
      id: '2021002',
      name: '李四',
      gender: '女',
      phone: '13800138001',
      email: 'lisi@example.com'
    }
  ]
  studentDialog.visible = true
}

const submitForm = async () => {
  if (!classFormRef.value) return
  
  try {
    await classFormRef.value.validate()
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

// 处理导入Excel
const handleImportExcel = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const data = e.target.result
    const workbook = XLSX.read(data, { type: 'array' })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    const students = XLSX.utils.sheet_to_json(firstSheet)
    
    // 处理导入的学生数据
    students.forEach(student => {
      // TODO: 调用后端 API 保存学生数据
      console.log('导入学生:', student)
    })
    
    ElMessage.success(`成功导入 ${students.length} 名学生`)
  }
  reader.readAsArrayBuffer(file.raw)
  return false // 阻止自动上传
}

// 下载模板
const downloadTemplate = () => {
  const template = [
    ['学号', '姓名', '性别', '联系电话', '邮箱'],
    ['2021001', '张三', '男', '13800138000', 'zhangsan@example.com']
  ]
  
  const ws = XLSX.utils.aoa_to_sheet(template)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Template')
  XLSX.writeFile(wb, '学生导入模板.xlsx')
}

// 修改导出学生名单方法
const exportStudentList = () => {
  if (!currentClass.value) {
    ElMessage.warning('请先选择班级')
    return
  }
  
  const headers = ['序号', '学号', '姓名', '性别', '联系电话', '邮箱']
  const data = studentDialog.list.map((student, index) => [
    index + 1,
    student.id,
    student.name,
    student.gender,
    student.phone,
    student.email
  ])
  
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Students')
  XLSX.writeFile(wb, `${currentClass.value?.name || '班级'}-学生名单.xlsx`)
}

// 添加学生
const handleAddStudent = () => {
  studentForm.type = 'add'
  studentForm.visible = true
  Object.assign(studentForm.data, {
    id: '',
    name: '',
    gender: '',
    phone: '',
    email: ''
  })
}

// 编辑学生
const handleEditStudent = (row) => {
  studentForm.type = 'edit'
  studentForm.visible = true
  Object.assign(studentForm.data, row)
}

// 移除学生
const handleRemoveStudent = (row) => {
  ElMessageBox.confirm(`确认要将学生 ${row.name} 从班级中移除吗？`, '警告', {
    type: 'warning'
  }).then(() => {
    studentDialog.list = studentDialog.list.filter(item => item.id !== row.id)
    ElMessage.success('移除成功')
  }).catch(() => {})
}

// 提交学生表单
const submitStudentForm = async () => {
  if (!studentFormRef.value) return
  
  try {
    await studentFormRef.value.validate()
    if (studentForm.type === 'add') {
      studentDialog.list.push({ ...studentForm.data })
    } else {
      const index = studentDialog.list.findIndex(item => item.id === studentForm.data.id)
      if (index !== -1) {
        studentDialog.list[index] = { ...studentForm.data }
      }
    }
    studentForm.visible = false
    ElMessage.success(studentForm.type === 'add' ? '添加成功' : '修改成功')
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}
</script>

<style scoped>
.class-container {
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

.header-btns {
  display: flex;
  gap: 10px;
}

.student-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.class-info p {
  margin: 5px 0;
  color: #666;
}

.upload-demo {
  display: inline-block;
}
</style> 