<template>
  <div class="student-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="statistics-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>学生总数</span>
            </div>
          </template>
          <div class="card-content">
            <h2>{{ statistics.total }}</h2>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>在读学生</span>
            </div>
          </template>
          <div class="card-content">
            <h2>{{ statistics.active }}</h2>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>男生人数</span>
            </div>
          </template>
          <div class="card-content">
            <h2>{{ statistics.male }}</h2>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>女生人数</span>
            </div>
          </template>
          <div class="card-content">
            <h2>{{ statistics.female }}</h2>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 分析图表 -->
    <el-row :gutter="20" class="statistics-charts">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>院系分布</span>
            </div>
          </template>
          <div class="chart-container" ref="departmentChartRef"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>班级分布</span>
            </div>
          </template>
          <div class="chart-container" ref="classChartRef"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>性别比例</span>
            </div>
          </template>
          <div class="chart-container" ref="genderChartRef"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>学生成绩分布</span>
              <el-select v-model="gradeStats.semester" placeholder="选择学期" size="small">
                <el-option label="2023-2024-1" value="2023-2024-1" />
                <el-option label="2023-2024-2" value="2023-2024-2" />
              </el-select>
            </div>
          </template>
          <div class="chart-container" ref="gradeChartRef"></div>
        </el-card>
      </el-col>
    </el-row>

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
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
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
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as XLSX from 'xlsx'
import * as echarts from 'echarts'

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

// 添加统计数据
const statistics = reactive({
  total: 0,
  active: 0,
  male: 0,
  female: 0
})

// 添加成绩统计相关数据
const gradeStats = reactive({
  semester: '2023-2024-1'
})

// 添加图表引用
const departmentChartRef = ref(null)
const classChartRef = ref(null)
const genderChartRef = ref(null)
const gradeChartRef = ref(null)

let departmentChart = null
let classChart = null
let genderChart = null
let gradeChart = null

// 计算统计数据
const calculateStatistics = () => {
  statistics.total = studentList.value.length
  statistics.active = studentList.value.filter(s => s.status === 1).length
  statistics.male = studentList.value.filter(s => s.gender === '男').length
  statistics.female = studentList.value.filter(s => s.gender === '女').length
}

// 初始化院系分布图表
const initDepartmentChart = () => {
  if (!departmentChartRef.value) return
  
  departmentChart = echarts.init(departmentChartRef.value)
  const departmentData = departmentOptions.value.map(dept => ({
    name: dept.name,
    value: studentList.value.filter(s => s.department === dept.id).length
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}人 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: departmentData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  departmentChart.setOption(option)
}

// 初始化班级分布图表
const initClassChart = () => {
  if (!classChartRef.value) return
  
  classChart = echarts.init(classChartRef.value)
  const classData = classOptions.value.map(cls => ({
    name: cls.name,
    value: studentList.value.filter(s => s.className === cls.name).length
  }))

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: classData.map(item => item.name),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '人数'
    },
    series: [
      {
        type: 'bar',
        data: classData.map(item => item.value),
        label: {
          show: true,
          position: 'top'
        }
      }
    ]
  }

  classChart.setOption(option)
}

// 初始化性别比例图表
const initGenderChart = () => {
  if (!genderChartRef.value) return
  
  genderChart = echarts.init(genderChartRef.value)
  const genderData = [
    { name: '男生', value: statistics.male },
    { name: '女生', value: statistics.female }
  ]

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}人 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}: {c}人'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        data: genderData
      }
    ]
  }

  genderChart.setOption(option)
}

// 初始化成绩分布图表
const initGradeChart = () => {
  if (!gradeChartRef.value) return
  
  gradeChart = echarts.init(gradeChartRef.value)
  // 模拟成绩数据
  const gradeRanges = ['90-100', '80-89', '70-79', '60-69', '0-59']
  const gradeData = gradeRanges.map(range => ({
    name: range,
    value: Math.floor(Math.random() * 30)
  }))

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: gradeRanges
    },
    yAxis: {
      type: 'value',
      name: '人数'
    },
    series: [
      {
        type: 'bar',
        data: gradeData.map(item => item.value),
        label: {
          show: true,
          position: 'top'
        }
      }
    ]
  }

  gradeChart.setOption(option)
}

// 更新所有统计和图表
const updateStatistics = () => {
  calculateStatistics()
  initDepartmentChart()
  initClassChart()
  initGenderChart()
  initGradeChart()
}

// 监听窗口大小变化
window.addEventListener('resize', () => {
  departmentChart?.resize()
  classChart?.resize()
  genderChart?.resize()
  gradeChart?.resize()
})

// 监听学期变化
watch(() => gradeStats.semester, () => {
  initGradeChart()
})

// 组件挂载时初始化图表
onMounted(() => {
  updateStatistics()
})

// 方法
const handleQuery = () => {
  loading.value = true
  
  // 根据搜索条件过滤学生列表
  const filteredList = studentList.value.filter(student => {
    const matchId = !queryParams.id || 
      student.id.toLowerCase().includes(queryParams.id.toLowerCase())
    
    const matchName = !queryParams.name || 
      student.name.toLowerCase().includes(queryParams.name.toLowerCase())
    
    const matchClass = !queryParams.class || 
      student.className === classOptions.value.find(item => item.id === queryParams.class)?.name
    
    const matchDepartment = !queryParams.department || 
      student.department === departmentOptions.value.find(item => item.id === queryParams.department)?.name
    
    return matchId && matchName && matchClass && matchDepartment
  })
  
  total.value = filteredList.length
  
  // 模拟分页
  const start = (queryParams.pageNum - 1) * queryParams.pageSize
  const end = start + queryParams.pageSize
  
  // 只显示过滤后的分页数据
  const displayList = filteredList.slice(start, end)
  studentList.value = displayList
  
  loading.value = false
  updateStatistics()
}

const handleSizeChange = (val) => {
  queryParams.pageSize = val
  queryParams.pageNum = 1  // 切换每页显示数量时重置到第一页
  handleQuery()
}

const handleCurrentChange = (val) => {
  queryParams.pageNum = val
  handleQuery()
}

const resetQuery = () => {
  queryParams.id = ''
  queryParams.name = ''
  queryParams.class = ''
  queryParams.department = ''
  queryParams.pageNum = 1
  reloadData() // 重置时重新加载所有数据
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

// 添加一个方法来重新加载所有数据
const reloadData = () => {
  // 这里应该是从后端获取数据
  studentList.value = [
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
  ]
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

/* 添加统计相关样式 */
.statistics-cards {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  text-align: center;
}

.card-content h2 {
  margin: 0;
  color: #409EFF;
}

.statistics-charts {
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
}

/* 优化图表布局 */
.statistics-charts .el-card {
  margin-bottom: 20px;
}

/* 优化图表标题样式 */
.card-header span {
  font-weight: bold;
  color: #303133;
}
</style> 