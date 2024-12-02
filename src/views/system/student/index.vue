<template>
  <div class="student-container">
    <el-card>
      <template #header>
        <div class="header">
          <span>学生管理</span>
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
            <el-button type="primary" @click="handleAdd">新增学生</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="学号">
          <el-input v-model="queryParams.id" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="queryParams.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="queryParams.class" placeholder="请选择班级">
            <el-option
              v-for="item in classOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
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

      <!-- 学生列表 -->
      <el-table :data="studentList" v-loading="loading" border>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            <el-tag :type="row.gender === '男' ? '' : 'success'">
              {{ row.gender }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="className" label="班级" width="150" />
        <el-table-column prop="department" label="所属院系" width="150" />
        <el-table-column prop="phone" label="联系电话" width="150" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '在读' : '休学' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link @click="handleViewCourses(row)">选课记录</el-button>
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

    <!-- 学生表单对话框 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="600px"
    >
      <el-form
        ref="studentFormRef"
        :model="studentForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="学号" prop="id">
          <el-input 
            v-model="studentForm.id" 
            placeholder="请输入学号"
            :disabled="dialog.type === 'edit'"
          />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="studentForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="studentForm.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="所属院系" prop="department">
          <el-select 
            v-model="studentForm.department" 
            placeholder="请选择院系"
            @change="handleDepartmentChange"
          >
            <el-option
              v-for="dept in departmentOptions"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="班级" prop="class">
          <el-select v-model="studentForm.class" placeholder="请选择班级">
            <el-option
              v-for="item in classOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="studentForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="studentForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="studentForm.status">
            <el-radio :label="1">在读</el-radio>
            <el-radio :label="0">休学</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="studentForm.remark"
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

    <!-- 选课记录对话框 -->
    <el-dialog
      :title="`${currentStudent?.name} - 选课记录`"
      v-model="courseDialog.visible"
      width="800px"
    >
      <el-table :data="courseDialog.list" border>
        <el-table-column prop="id" label="课程编号" width="120" />
        <el-table-column prop="name" label="课程名称" />
        <el-table-column prop="teacher" label="任课教师" width="120" />
        <el-table-column prop="credit" label="学分" width="80" />
        <el-table-column prop="semester" label="学期" width="120" />
        <el-table-column prop="score" label="成绩" width="100">
          <template #default="{ row }">
            {{ row.score || '-' }}
          </template>
        </el-table-column>
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
  class: '',
  department: ''
})

// 部门选项
const departmentOptions = ref([
  { id: 1, name: '计算机学院' },
  { id: 2, name: '软件学院' },
  { id: 3, name: '外国语学院' }
])

// 班级选项
const classOptions = ref([
  { id: 1, name: '计算机2101', department: 1 },
  { id: 2, name: '计算机2102', department: 1 },
  { id: 3, name: '软件2101', department: 2 }
])

// 学生列表数据
const studentList = ref([
  {
    id: '2021001',
    name: '张三',
    gender: '男',
    className: '计算机2101',
    department: '计算机学院',
    phone: '13800138000',
    email: 'zhangsan@example.com',
    status: 1,
    remark: ''
  },
  {
    id: '2021002',
    name: '李四',
    gender: '女',
    className: '计算机2101',
    department: '计算机学院',
    phone: '13800138001',
    email: 'lisi@example.com',
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

const studentForm = reactive({
  id: '',
  name: '',
  gender: '男',
  department: '',
  class: '',
  phone: '',
  email: '',
  status: 1,
  remark: ''
})

// 表单验证规则
const rules = {
  id: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { pattern: /^\d{7}$/, message: '学号必须为7位数字', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  department: [
    { required: true, message: '请选择所属院系', trigger: 'change' }
  ],
  class: [
    { required: true, message: '请选择班级', trigger: 'change' }
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

const studentFormRef = ref(null)

// 选课记录对话框相关
const courseDialog = reactive({
  visible: false,
  list: []
})

const currentStudent = ref(null)

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
  queryParams.class = ''
  queryParams.department = ''
  handleQuery()
}

const handleAdd = () => {
  dialog.type = 'add'
  dialog.title = '添加学生'
  dialog.visible = true
  Object.assign(studentForm, {
    id: '',
    name: '',
    gender: '男',
    department: '',
    class: '',
    phone: '',
    email: '',
    status: 1,
    remark: ''
  })
}

const handleEdit = (row) => {
  dialog.type = 'edit'
  dialog.title = '编辑学生'
  dialog.visible = true
  Object.assign(studentForm, row)
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认要删除该学生吗？删除后无法恢复', '警告', {
    type: 'warning'
  }).then(() => {
    studentList.value = studentList.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleViewCourses = (row) => {
  currentStudent.value = row
  // 模拟获取学生选课记录
  courseDialog.list = [
    {
      id: 'CS001',
      name: '计算机导论',
      teacher: '张老师',
      credit: 3,
      semester: '2023-2024-1',
      score: 85
    },
    {
      id: 'CS002',
      name: '程序设计基础',
      teacher: '李老师',
      credit: 4,
      semester: '2023-2024-1',
      score: 90
    }
  ]
  courseDialog.visible = true
}

const handleDepartmentChange = (value) => {
  studentForm.class = ''
  // 根据院系筛选班级选项
  classOptions.value = classOptions.value.filter(item => item.department === value)
}

const submitForm = async () => {
  if (!studentFormRef.value) return

  try {
    await studentFormRef.value.validate()
    if (dialog.type === 'add') {
      // TODO: 调用API添加学生
      studentList.value.push({
        ...studentForm,
        className: classOptions.value.find(item => item.id === studentForm.class)?.name,
        department: departmentOptions.value.find(item => item.id === studentForm.department)?.name
      })
    } else {
      // TODO: 调用API更新学生
      const index = studentList.value.findIndex(item => item.id === studentForm.id)
      if (index !== -1) {
        studentList.value[index] = {
          ...studentList.value[index],
          ...studentForm,
          className: classOptions.value.find(item => item.id === studentForm.class)?.name,
          department: departmentOptions.value.find(item => item.id === studentForm.department)?.name
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
    ['学号', '姓名', '性别', '所属院系', '班级', '联系电话', '邮箱'],
    ['2021001', '张三', '男', '计算机学院', '计算机2101', '13800138000', 'zhangsan@example.com']
  ]
  
  const ws = XLSX.utils.aoa_to_sheet(template)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Template')
  XLSX.writeFile(wb, '学生导入模板.xlsx')
}
</script>

<style scoped>
.student-container {
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
</style> 