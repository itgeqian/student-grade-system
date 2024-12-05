<template>
  <div class="selection-container">
    <el-card>
      <template #header>
        <div class="header">
          <span>选课管理</span>
          <div class="header-btns" v-if="userType === 'student'">
            <el-button type="primary" @click="handleSelectCourse">选择课程</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item v-if="userType !== 'student'" label="学号">
          <el-input v-model="queryParams.studentId" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item v-if="userType !== 'student'" label="学生姓名">
          <el-input v-model="queryParams.studentName" placeholder="请输入学生姓名" />
        </el-form-item>
        <el-form-item label="课程名称">
          <el-input v-model="queryParams.courseName" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="学期">
          <el-select v-model="queryParams.semester" placeholder="请选择学期">
            <el-option label="2023-2024-1" value="2023-2024-1" />
            <el-option label="2023-2024-2" value="2023-2024-2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 选课列表 -->
      <el-table :data="selectionList" v-loading="loading" border>
        <el-table-column v-if="userType !== 'student'" prop="studentId" label="学号" width="120" />
        <el-table-column v-if="userType !== 'student'" prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="courseName" label="课程名称" width="180" />
        <el-table-column prop="className" label="班级" width="180" />
        <el-table-column prop="teacherName" label="任课教师" width="120" />
        <el-table-column prop="semester" label="学期" width="120" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '已选课' : '已退课' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <template v-if="userType === 'student' && row.status === 1">
              <el-button type="danger" link @click="handleCancel(row)">退课</el-button>
            </template>
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

    <!-- 选课对话框 -->
    <el-dialog
      title="选择课程"
      v-model="selectDialog.visible"
      width="900px"
    >
      <el-form :inline="true" :model="selectDialog.query" class="search-form">
        <el-form-item label="课程名称">
          <el-input v-model="selectDialog.query.name" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="开课院系">
          <el-select v-model="selectDialog.query.department" placeholder="请选择院系">
            <el-option
              v-for="dept in departmentOptions"
              :key="dept.id"
              :label="dept.name"
              :value="dept.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSelectQuery">查询</el-button>
          <el-button @click="resetSelectQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="selectDialog.list" border>
        <el-table-column prop="courseName" label="课程名称" width="180" />
        <el-table-column prop="className" label="班级" width="180" />
        <el-table-column prop="teacherName" label="任课教师" width="120" />
        <el-table-column prop="schedule" label="上课时间" width="150" />
        <el-table-column prop="location" label="上课地点" width="120" />
        <el-table-column label="选课情况" width="120" align="center">
          <template #default="{ row }">
            {{ row.selected }}/{{ row.capacity }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              link 
              @click="handleConfirmSelect(row)"
              :disabled="row.selected >= row.capacity"
            >
              选课
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDataStore, useUserStore } from '@/store'

const dataStore = useDataStore()
const userStore = useUserStore()
const userType = computed(() => userStore.userInfo.userType)
const userId = computed(() => userStore.userInfo.username)

const selectionList = ref([])
const loading = ref(false)
const total = ref(0)

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  studentId: '',
  studentName: '',
  courseName: '',
  semester: ''
})

// 部门选项
const departmentOptions = computed(() => {
  return dataStore.departments.map(dept => ({
    id: dept.id,
    name: dept.name
  }))
})

// 选课对话框
const selectDialog = reactive({
  visible: false,
  query: {
    name: '',
    department: ''
  },
  list: []
})

// 初始化数据
onMounted(() => {
  handleQuery()
})

// 查询选课列表
const handleQuery = () => {
  loading.value = true
  // 根据用户类型和查询条件过滤数据
  let filteredList = dataStore.selections
  
  if (userType.value === 'student') {
    // 学生只能看到自己的选课记录
    filteredList = filteredList.filter(item => item.studentId === userId.value)
  } else {
    // 教师和管理员可以根据条件筛选
    if (queryParams.studentId) {
      filteredList = filteredList.filter(item => item.studentId.includes(queryParams.studentId))
    }
    if (queryParams.studentName) {
      filteredList = filteredList.filter(item => item.studentName.includes(queryParams.studentName))
    }
  }
  
  if (queryParams.courseName) {
    filteredList = filteredList.filter(item => item.courseName.includes(queryParams.courseName))
  }
  if (queryParams.semester) {
    filteredList = filteredList.filter(item => item.semester === queryParams.semester)
  }
  
  total.value = filteredList.length
  selectionList.value = filteredList.slice(
    (queryParams.pageNum - 1) * queryParams.pageSize,
    queryParams.pageNum * queryParams.pageSize
  )
  loading.value = false
}

// 打开选课对话框
const handleSelectCourse = () => {
  selectDialog.visible = true
  selectDialog.query.name = ''
  selectDialog.query.department = ''
  handleSelectQuery()
}

// 查询可选课程
const handleSelectQuery = () => {
  // 获取所有课程班级信息
  const availableClasses = dataStore.courseClasses.filter(item => {
    const course = dataStore.courses.find(c => c.id === item.courseId)
    if (!course) return false
    
    const matchName = !selectDialog.query.name || course.name.includes(selectDialog.query.name)
    const matchDept = !selectDialog.query.department || course.department === selectDialog.query.department
    return matchName && matchDept && item.status === 1 && item.selected < item.capacity
  }).map(item => {
    const course = dataStore.courses.find(c => c.id === item.courseId)
    return {
      courseId: item.courseId,
      courseName: course.name,
      classId: item.id,
      className: item.className,
      teacherName: item.teacherName,
      schedule: item.schedule,
      location: item.location,
      selected: item.selected,
      capacity: item.capacity
    }
  })
  
  selectDialog.list = availableClasses
}

// 确认选课
const handleConfirmSelect = (row) => {
  try {
    const course = dataStore.courses.find(c => c.id === row.courseId)
    const student = dataStore.students.find(s => s.id === userId.value)
    
    dataStore.addSelection({
      id: 'SEL' + Date.now(),
      studentId: userId.value,
      studentName: student.name,
      courseId: row.courseId,
      courseName: row.courseName,
      classId: row.classId,
      className: row.className,
      teacherName: row.teacherName,
      semester: course.semester,
      score: null,
      status: 1
    })
    
    ElMessage.success('选课成功')
    selectDialog.visible = false
    handleQuery()
  } catch (error) {
    ElMessage.error(error.message)
  }
}

// 退课
const handleCancel = (row) => {
  ElMessageBox.confirm('确认要退选该课程吗？', '警告', {
    type: 'warning'
  }).then(() => {
    dataStore.cancelSelection(row.id)
    ElMessage.success('退课成功')
    handleQuery()
  }).catch(() => {})
}

// 分页相关方法
const handleSizeChange = (val) => {
  queryParams.pageSize = val
  queryParams.pageNum = 1
  handleQuery()
}

const handleCurrentChange = (val) => {
  queryParams.pageNum = val
  handleQuery()
}

// 重置查询条件
const resetQuery = () => {
  queryParams.studentId = ''
  queryParams.studentName = ''
  queryParams.courseName = ''
  queryParams.semester = ''
  queryParams.pageNum = 1
  handleQuery()
}

// 重置选课查询条件
const resetSelectQuery = () => {
  selectDialog.query.name = ''
  selectDialog.query.department = ''
  handleSelectQuery()
}
</script>

<style scoped>
.selection-container {
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