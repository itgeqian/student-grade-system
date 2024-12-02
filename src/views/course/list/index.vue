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
        <el-table-column label="操作" width="300">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link @click="handleViewSchedule(row)">课程表</el-button>
            <el-button type="warning" link @click="handleEnrollment(row)">选课管理</el-button>
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

    <!-- 课程表对话框 -->
    <el-dialog
      title="课程表"
      v-model="scheduleVisible"
      width="90%"
      append-to-body
    >
      <div class="schedule-header">
        <el-form :inline="true">
          <el-form-item label="周次">
            <el-select v-model="scheduleWeek" placeholder="请选择周次">
              <el-option
                v-for="i in 20"
                :key="i"
                :label="`第${i}周`"
                :value="i"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="视图">
            <el-radio-group v-model="scheduleView">
              <el-radio-button label="list">列表</el-radio-button>
              <el-radio-button label="grid">网格</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="exportSchedule">导出课程表</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 列表视图 -->
      <div v-if="scheduleView === 'list'" class="schedule-container">
        <el-table :data="scheduleData" border>
          <el-table-column prop="day" label="星期" width="100">
            <template #default="{ row }">
              星期{{ numberToChinese(row.day) }}
            </template>
          </el-table-column>
          <el-table-column prop="time" label="时间" width="120" />
          <el-table-column prop="course" label="课程" />
          <el-table-column prop="teacher" label="教师" width="100" />
          <el-table-column prop="location" label="地点" width="100" />
        </el-table>
      </div>

      <!-- 网格视图 -->
      <div v-else class="schedule-grid">
        <el-table :data="gridScheduleData" border>
          <el-table-column prop="time" label="时间/星期" width="120" />
          <el-table-column
            v-for="i in 7"
            :key="i"
            :label="`星期${numberToChinese(i)}`"
          >
            <template #default="{ row }">
              <div
                v-if="row[`day${i}`]"
                class="grid-cell"
              >
                <div class="course-name">{{ row[`day${i}`].course }}</div>
                <div class="course-info">
                  {{ row[`day${i}`].teacher }}
                  <br>
                  {{ row[`day${i}`].location }}
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 添加选课管理对话框 -->
    <el-dialog
      title="选课管理"
      v-model="enrollmentDialog.visible"
      width="800px"
      append-to-body
    >
      <div class="enrollment-header">
        <div class="course-info">
          <h3>{{ enrollmentDialog.course?.name }}</h3>
          <p>任课教师：{{ enrollmentDialog.course?.teacher }}</p>
          <p>已选人数：{{ enrollmentDialog.students.length }} / {{ enrollmentDialog.maxStudents }}</p>
        </div>
        <el-button type="primary" @click="handleAddStudent">添加学生</el-button>
      </div>

      <!-- 学生列表 -->
      <el-table :data="enrollmentDialog.students" border style="width: 100%">
        <el-table-column prop="id" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="class" label="班级" />
        <el-table-column prop="enrollTime" label="选课时间" width="180" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="danger" link @click="handleRemoveStudent(row)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 添加学生对话框 -->
    <el-dialog
      title="添加学生"
      v-model="studentDialog.visible"
      width="600px"
      append-to-body
    >
      <el-form :inline="true" :model="studentDialog.query" class="search-form">
        <el-form-item label="学号/姓名">
          <el-input v-model="studentDialog.query.keyword" placeholder="请输入学号或姓名" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchStudents">搜索</el-button>
        </el-form-item>
      </el-form>

      <el-table 
        :data="studentDialog.list" 
        border 
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="class" label="班级" />
      </el-table>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="studentDialog.visible = false">取 消</el-button>
          <el-button type="primary" @click="confirmAddStudents">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
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

// 添加课程表相关的数据和方法
const scheduleVisible = ref(false)
const scheduleData = ref([])
const timeSlots = [
  { time: '8:00-9:40', label: '第一节' },
  { time: '10:00-11:40', label: '第二节' },
  { time: '14:00-15:40', label: '第三节' },
  { time: '16:00-17:40', label: '第四节' }
]

// 课程表相关数据
const scheduleWeek = ref(1)
const scheduleView = ref('grid')

// 数字转中文
const numberToChinese = (num) => {
  const chinese = ['日', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  return chinese[num]
}

// 生成网格视图数据
const gridScheduleData = computed(() => {
  const timeSlots = [
    { time: '8:00-9:40' },
    { time: '10:00-11:40' },
    { time: '14:00-15:40' },
    { time: '16:00-17:40' }
  ]

  return timeSlots.map(slot => {
    const row = { time: slot.time }
    scheduleData.value.forEach(item => {
      if (item.time === slot.time) {
        row[`day${item.day}`] = item
      }
    })
    return row
  })
})

// 导出课程表
const exportSchedule = () => {
  const headers = ['星期', '时间', '课程', '教师', '地点']
  const data = scheduleData.value.map(item => [
    `星期${numberToChinese(item.day)}`,
    item.time,
    item.course,
    item.teacher,
    item.location
  ])
  
  // 使用 xlsx 库导出 Excel
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Schedule')
  XLSX.writeFile(wb, '课程表.xlsx')
}

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

// 查看课程表
const handleViewSchedule = (row) => {
  // 从后端获取课程表数据
  scheduleData.value = [
    {
      day: 1,
      time: '8:00-9:40',
      course: row.name,
      teacher: row.teacher,
      location: '教室101',
      capacity: 50,
      enrolled: 30
    }
    // ... 其他课程数据
  ]
  
  const conflicts = validateSchedule(scheduleData.value)
  if (conflicts.length > 0) {
    ElMessage.warning(`检测到课程冲突：\n${conflicts.join('\n')}`)
  }
  
  scheduleVisible.value = true
}

// 选课管理相关数据
const enrollmentDialog = reactive({
  visible: false,
  course: null,
  maxStudents: 50,
  students: []
})

const studentDialog = reactive({
  visible: false,
  query: {
    keyword: ''
  },
  list: [],
  selected: []
})

// 选课管理方法
const handleEnrollment = (row) => {
  enrollmentDialog.course = row
  // 从后端获取已选课学生列表
  enrollmentDialog.students = [
    {
      id: '2021001',
      name: '张三',
      class: '计算机2101',
      enrollTime: '2024-01-15 10:00:00',
      status: '正常'  // 新增状态字段
    }
    // ... 其他学生数据
  ]
  
  // 检查选课人数
  if (!validateEnrollment(enrollmentDialog.students.length, enrollmentDialog.maxStudents)) {
    ElMessage.warning('当前课程已达到人数上限')
  }
  
  enrollmentDialog.visible = true
}

const handleAddStudent = () => {
  studentDialog.query.keyword = ''
  studentDialog.list = [
    {
      id: '2021003',
      name: '王五',
      class: '计算机2102'
    },
    {
      id: '2021004',
      name: '赵六',
      class: '计算机2102'
    }
  ]
  studentDialog.visible = true
}

const handleRemoveStudent = (student) => {
  ElMessageBox.confirm(`确认要将学生 ${student.name} 从课程中移除吗？`, '警告', {
    type: 'warning'
  }).then(() => {
    enrollmentDialog.students = enrollmentDialog.students.filter(s => s.id !== student.id)
    ElMessage.success('移除成功')
  }).catch(() => {})
}

const searchStudents = () => {
  // 这里应该调用后端API搜索学生
  console.log('搜索学生:', studentDialog.query.keyword)
}

const handleSelectionChange = (val) => {
  studentDialog.selected = val
}

const confirmAddStudents = () => {
  if (studentDialog.selected.length === 0) {
    ElMessage.warning('请选择要添加的学生')
    return
  }

  // 检查人数限制
  if (!validateEnrollment(
    enrollmentDialog.students.length + studentDialog.selected.length, 
    enrollmentDialog.maxStudents
  )) {
    ElMessage.warning('添加后将超过课程人数上限')
    return
  }

  // 添加选中的学生到课程
  const newStudents = studentDialog.selected.map(student => ({
    ...student,
    enrollTime: new Date().toLocaleString(),
    status: '正常'
  }))

  enrollmentDialog.students.push(...newStudents)
  studentDialog.visible = false
  ElMessage.success('添加成功')
}

// 添加课程表验证
const validateSchedule = (schedule) => {
  const conflicts = []
  schedule.forEach((item1, index1) => {
    schedule.forEach((item2, index2) => {
      if (index1 !== index2 && 
          item1.day === item2.day && 
          item1.time === item2.time) {
        conflicts.push(`${item1.course} 与 ${item2.course} 在 星期${numberToChinese(item1.day)} ${item1.time} 存在冲突`)
      }
    })
  })
  return conflicts
}

// 添加选课人数限制验证
const validateEnrollment = (currentCount, maxCount) => {
  return currentCount < maxCount
}

// 添加 ResizeObserver 错误处理
window.addEventListener('error', (e) => {
  if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
    e.stopPropagation()
  }
}, true)
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

.schedule-container {
  padding: 20px;
}

.schedule-header {
  margin-bottom: 20px;
}

.schedule-grid {
  margin-top: 20px;
}

.grid-cell {
  min-height: 80px;
  padding: 8px;
}

.course-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.course-info {
  font-size: 12px;
  color: #666;
}

.enrollment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.course-info h3 {
  margin: 0 0 10px 0;
}

.course-info p {
  margin: 5px 0;
  color: #666;
}
</style> 