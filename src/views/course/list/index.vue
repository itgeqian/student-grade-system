<template>
  <div class="course-container">
    <el-card>
      <template #header>
        <div class="header">
          <span>课程管理</span>
          <div class="header-btns">
            <el-button type="primary" @click="handleAdd">新增课程</el-button>
          </div>
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
            <el-option
              v-for="dept in departmentOptions"
              :key="dept.id"
              :label="dept.name"
              :value="dept.name"
            />
          </el-select>
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

      <!-- 课程列表 -->
      <el-table :data="courseList" v-loading="loading" border>
        <el-table-column prop="id" label="课程编号" width="120" />
        <el-table-column prop="name" label="课程名称" width="180" />
        <el-table-column prop="credit" label="学分" width="80" align="center" />
        <el-table-column prop="hours" label="学时" width="80" align="center" />
        <el-table-column prop="department" label="开课院系" width="150" />
        <el-table-column prop="teacher" label="任课教师" width="120" />
        <el-table-column label="选课情况" width="150" align="center">
          <template #default="{ row }">
            {{ row.selected }}/{{ row.capacity }}
          </template>
        </el-table-column>
        <el-table-column prop="semester" label="学期" width="120" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '已开课' : '未开课' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link @click="handleViewClasses(row)">班级管理</el-button>
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

    <!-- 课程表单对话框 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="600px"
    >
      <el-form
        ref="courseFormRef"
        :model="courseForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="课程编号" prop="id">
          <el-input 
            v-model="courseForm.id" 
            placeholder="请输入课程编号"
            :disabled="dialog.type === 'edit'"
          />
        </el-form-item>
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="courseForm.name" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="学分" prop="credit">
          <el-input-number 
            v-model="courseForm.credit" 
            :min="1" 
            :max="10"
            :precision="1"
          />
        </el-form-item>
        <el-form-item label="学时" prop="hours">
          <el-input-number 
            v-model="courseForm.hours" 
            :min="16" 
            :max="120"
            :step="2"
          />
        </el-form-item>
        <el-form-item label="开课院系" prop="department">
          <el-select v-model="courseForm.department" placeholder="请选择院系">
            <el-option
              v-for="dept in departmentOptions"
              :key="dept.id"
              :label="dept.name"
              :value="dept.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="任课教师" prop="teacher">
          <el-select 
            v-model="courseForm.teacher" 
            placeholder="请选择教师"
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
        <el-form-item label="容量" prop="capacity">
          <el-input-number 
            v-model="courseForm.capacity" 
            :min="1" 
            :max="200"
          />
        </el-form-item>
        <el-form-item label="学期" prop="semester">
          <el-select v-model="courseForm.semester" placeholder="请选择学期">
            <el-option label="2023-2024-1" value="2023-2024-1" />
            <el-option label="2023-2024-2" value="2023-2024-2" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="courseForm.status">
            <el-radio :label="1">已开课</el-radio>
            <el-radio :label="0">未开课</el-radio>
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

    <!-- 班级管理对话框 -->
    <el-dialog
      :title="`${currentCourse?.name} - 班级管理`"
      v-model="classDialog.visible"
      width="900px"
    >
      <div class="class-dialog-header">
        <el-button type="primary" @click="handleAddClass">新增班级</el-button>
      </div>
      <el-table :data="classDialog.list" border>
        <el-table-column prop="className" label="班级名称" width="180" />
        <el-table-column prop="teacherName" label="任课教师" width="120" />
        <el-table-column prop="schedule" label="上课时间" width="150" />
        <el-table-column prop="location" label="上课地点" width="120" />
        <el-table-column label="选课情况" width="120" align="center">
          <template #default="{ row }">
            {{ row.selected }}/{{ row.capacity }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '正常' : '停课' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEditClass(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDeleteClass(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 班级编辑对话框 -->
    <el-dialog
      :title="classForm.type === 'add' ? '新增班级' : '编辑班级'"
      v-model="classForm.visible"
      width="600px"
    >
      <el-form
        ref="classFormRef"
        :model="classForm"
        :rules="classRules"
        label-width="100px"
      >
        <el-form-item label="班级名称" prop="className">
          <el-input v-model="classForm.className" placeholder="请输入班级名称" />
        </el-form-item>
        <el-form-item label="任课教师" prop="teacherId">
          <el-select 
            v-model="classForm.teacherId" 
            placeholder="请选择教师"
            filterable
            @change="handleTeacherChange"
          >
            <el-option
              v-for="teacher in teacherOptions"
              :key="teacher.id"
              :label="teacher.name"
              :value="teacher.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="上课时间" prop="schedule">
          <el-input v-model="classForm.schedule" placeholder="如：周一 1-2节" />
        </el-form-item>
        <el-form-item label="上课地点" prop="location">
          <el-input v-model="classForm.location" placeholder="如：A101" />
        </el-form-item>
        <el-form-item label="容量" prop="capacity">
          <el-input-number 
            v-model="classForm.capacity" 
            :min="1" 
            :max="200"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="classForm.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">停课</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="classForm.visible = false">取 消</el-button>
          <el-button type="primary" @click="submitClassForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDataStore } from '@/store'

const dataStore = useDataStore()
const courseList = ref([])

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  id: '',
  name: '',
  department: '',
  semester: ''
})

// 部门选项
const departmentOptions = computed(() => {
  return dataStore.departments.map(dept => ({
    id: dept.id,
    name: dept.name
  }))
})

// 教师选项
const teacherOptions = computed(() => {
  return dataStore.teachers.map(teacher => ({
    id: teacher.id,
    name: teacher.name
  }))
})

const loading = ref(false)
const total = ref(0)

// 对话框状态
const dialog = reactive({
  visible: false,
  title: '',
  type: 'add'
})

// 班级管理对话框
const classDialog = reactive({
  visible: false,
  list: []
})

const currentCourse = ref(null)

// 表单数据
const courseForm = reactive({
  id: '',
  name: '',
  credit: 3,
  hours: 48,
  department: '',
  teacher: '',
  capacity: 60,
  semester: '',
  status: 1
})

// 表单验证规则
const rules = {
  id: [
    { required: true, message: '请输入课程编号', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入课程名称', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '请选择开课院系', trigger: 'change' }
  ],
  teacher: [
    { required: true, message: '请选择任课教师', trigger: 'change' }
  ],
  semester: [
    { required: true, message: '请选择学期', trigger: 'change' }
  ]
}

// 初始化数据
onMounted(() => {
  courseList.value = dataStore.courses
  total.value = dataStore.courses.length
})

// 方法
const handleQuery = () => {
  loading.value = true
  // 根据查询条件过滤数据
  const filteredList = dataStore.courses.filter(course => {
    const matchId = !queryParams.id || course.id.includes(queryParams.id)
    const matchName = !queryParams.name || course.name.includes(queryParams.name)
    const matchDept = !queryParams.department || course.department === queryParams.department
    const matchSemester = !queryParams.semester || course.semester === queryParams.semester
    return matchId && matchName && matchDept && matchSemester
  })
  
  total.value = filteredList.length
  courseList.value = filteredList.slice(
    (queryParams.pageNum - 1) * queryParams.pageSize,
    queryParams.pageNum * queryParams.pageSize
  )
  loading.value = false
}

const handleAdd = () => {
  dialog.type = 'add'
  dialog.title = '新增课程'
  dialog.visible = true
  Object.assign(courseForm, {
    id: '',
    name: '',
    credit: 3,
    hours: 48,
    department: '',
    teacher: '',
    capacity: 60,
    selected: 0,
    semester: '',
    status: 1
  })
}

const handleEdit = (row) => {
  dialog.type = 'edit'
  dialog.title = '编辑课程'
  dialog.visible = true
  Object.assign(courseForm, row)
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认要删除该课程吗？删除后无法恢复', '警告', {
    type: 'warning'
  }).then(() => {
    dataStore.deleteCourse(row.id)
    courseList.value = dataStore.courses
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const submitForm = async () => {
  if (dialog.type === 'add') {
    dataStore.addCourse({
      ...courseForm,
      selected: 0
    })
    ElMessage.success('添加成功')
  } else {
    dataStore.updateCourse(courseForm)
    ElMessage.success('修改成功')
  }
  dialog.visible = false
  handleQuery()
}

// 班级管理相关方法
const handleViewClasses = (row) => {
  currentCourse.value = row
  classDialog.list = dataStore.courseClasses.filter(item => item.courseId === row.id)
  classDialog.visible = true
}

const handleAddClass = () => {
  if (!currentCourse.value) return
  
  ElMessageBox.prompt('请输入班级名称', '新增班级', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '班级名称不能为空'
  }).then(({ value }) => {
    const newClass = {
      id: 'CSC' + Date.now(),
      courseId: currentCourse.value.id,
      className: value,
      teacherId: '',
      teacherName: '',
      schedule: '',
      location: '',
      capacity: 30,
      selected: 0,
      status: 1
    }
    dataStore.addCourseClass(newClass)
    classDialog.list = dataStore.courseClasses.filter(item => item.courseId === currentCourse.value.id)
    ElMessage.success('添加成功')
  }).catch(() => {})
}

const handleEditClass = (row) => {
  ElMessageBox.prompt('请输入新的班级名称', '编辑班级', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: row.className,
    inputPattern: /.+/,
    inputErrorMessage: '班级名称不能为空'
  }).then(({ value }) => {
    const updatedClass = {
      ...row,
      className: value
    }
    dataStore.updateCourseClass(updatedClass)
    classDialog.list = dataStore.courseClasses.filter(item => item.courseId === currentCourse.value.id)
    ElMessage.success('修改成功')
  }).catch(() => {})
}

const handleDeleteClass = (row) => {
  ElMessageBox.confirm('确认要删除该班级吗？删除后无法恢复', '警告', {
    type: 'warning'
  }).then(() => {
    dataStore.deleteCourseClass(row.id)
    classDialog.list = dataStore.courseClasses.filter(item => item.courseId === currentCourse.value.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
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
  queryParams.semester = ''
  queryParams.pageNum = 1
  handleQuery()
}

// 班级编辑对话框
const classFormRef = ref(null)
const classForm = reactive({
  visible: false,
  type: 'add',
  id: '',
  courseId: '',
  className: '',
  teacherId: '',
  teacherName: '',
  schedule: '',
  location: '',
  capacity: 30,
  selected: 0,
  status: 1
})

const classRules = {
  className: [
    { required: true, message: '请输入班级名称', trigger: 'blur' }
  ],
  teacherId: [
    { required: true, message: '请选择任课教师', trigger: 'change' }
  ],
  schedule: [
    { required: true, message: '请输入上课时间', trigger: 'blur' }
  ],
  location: [
    { required: true, message: '请输入上课地点', trigger: 'blur' }
  ]
}

const handleTeacherChange = (teacherId) => {
  const teacher = teacherOptions.value.find(t => t.id === teacherId)
  if (teacher) {
    classForm.teacherName = teacher.name
  }
}

const submitClassForm = async () => {
  if (!classFormRef.value) return
  
  try {
    await classFormRef.value.validate()
    if (classForm.type === 'add') {
      dataStore.addCourseClass({
        ...classForm,
        id: 'CSC' + Date.now(),
        courseId: currentCourse.value.id
      })
      ElMessage.success('添加成功')
    } else {
      dataStore.updateCourseClass(classForm)
      ElMessage.success('修改成功')
    }
    classForm.visible = false
    classDialog.list = dataStore.courseClasses.filter(item => item.courseId === currentCourse.value.id)
  } catch (error) {
    console.error('表单验证失败:', error)
  }
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

.class-dialog-header {
  margin-bottom: 20px;
}
</style> 