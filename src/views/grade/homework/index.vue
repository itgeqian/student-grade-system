<template>
  <div class="homework-container">
    <el-card>
      <template #header>
        <div class="header">
          <span>作业管理</span>
          <el-button v-if="isTeacher" type="primary" @click="handleAdd">布置作业</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="课程">
          <el-select v-model="queryParams.courseId" placeholder="请选择课程">
            <el-option
              v-for="course in courseOptions"
              :key="course.id"
              :label="course.name"
              :value="course.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="作业标题">
          <el-input v-model="queryParams.title" placeholder="请输入作业标题" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态">
            <el-option label="未提交" value="未提交" />
            <el-option label="已提交" value="已提交" />
            <el-option label="已批改" value="已批改" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格区域 -->
      <el-table :data="homeworkList" style="width: 100%" v-loading="loading">
        <el-table-column prop="title" label="作业标题" />
        <el-table-column prop="courseName" label="所属课程" />
        <el-table-column prop="deadline" label="截止时间" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="成绩" width="80">
          <template #default="{ row }">
            {{ row.score || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button 
              v-if="isTeacher" 
              type="success" 
              link 
              @click="handleGrade(row)"
            >批改</el-button>
            <el-button 
              v-if="isStudent && row.status === '未提交'" 
              type="warning" 
              link 
              @click="handleSubmit(row)"
            >提交</el-button>
            <el-button 
              v-if="isTeacher" 
              type="danger" 
              link 
              @click="handleDelete(row)"
            >删除</el-button>
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

    <!-- 布置作业对话框 -->
    <el-dialog
      title="布置作业"
      v-model="homeworkDialog.visible"
      width="600px"
      append-to-body
    >
      <el-form
        ref="homeworkFormRef"
        :model="homeworkForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="作业标题" prop="title">
          <el-input v-model="homeworkForm.title" placeholder="请输入作业标题" />
        </el-form-item>
        <el-form-item label="所属课程" prop="courseId">
          <el-select v-model="homeworkForm.courseId" placeholder="请选择课程">
            <el-option
              v-for="course in courseOptions"
              :key="course.id"
              :label="course.name"
              :value="course.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="作业内容" prop="content">
          <el-input
            v-model="homeworkForm.content"
            type="textarea"
            rows="4"
            placeholder="请输入作业内容"
          />
        </el-form-item>
        <el-form-item label="截止时间" prop="deadline">
          <el-date-picker
            v-model="homeworkForm.deadline"
            type="datetime"
            placeholder="请选择截止时间"
          />
        </el-form-item>
        <el-form-item label="附件">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
          >
            <template #trigger>
              <el-button type="primary">选择文件</el-button>
            </template>
            <el-button class="ml-3" @click="submitUpload">
              上传到服务器
            </el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="homeworkDialog.visible = false">取 消</el-button>
          <el-button type="primary" @click="submitHomework">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 提交作业对话框 -->
    <el-dialog
      title="提交作业"
      v-model="submitDialog.visible"
      width="600px"
      append-to-body
    >
      <el-form
        ref="submitFormRef"
        :model="submitForm"
        :rules="submitRules"
        label-width="100px"
      >
        <el-form-item label="作业答案" prop="answer">
          <el-input
            v-model="submitForm.answer"
            type="textarea"
            rows="4"
            placeholder="请输入作业答案"
          />
        </el-form-item>
        <el-form-item label="附件">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
          >
            <template #trigger>
              <el-button type="primary">选择文件</el-button>
            </template>
            <el-button class="ml-3" @click="submitUpload">
              上传到服务器
            </el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="submitDialog.visible = false">取 消</el-button>
          <el-button type="primary" @click="submitHomeworkAnswer">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批改作业对话框 -->
    <el-dialog
      title="批改作业"
      v-model="gradeDialog.visible"
      width="600px"
      append-to-body
    >
      <el-form
        ref="gradeFormRef"
        :model="gradeForm"
        :rules="gradeRules"
        label-width="100px"
      >
        <el-form-item label="成绩" prop="score">
          <el-input-number
            v-model="gradeForm.score"
            :min="0"
            :max="100"
            placeholder="请输入成绩"
          />
        </el-form-item>
        <el-form-item label="评语" prop="comment">
          <el-input
            v-model="gradeForm.comment"
            type="textarea"
            rows="4"
            placeholder="请输入评语"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="gradeDialog.visible = false">取 消</el-button>
          <el-button type="primary" @click="submitGrade">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'

const store = useStore()

// 用户角色判断
const isTeacher = computed(() => store.state.user.userType === 'teacher')
const isStudent = computed(() => store.state.user.userType === 'student')

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  courseId: '',
  title: '',
  status: ''
})

// 课程选项
const courseOptions = ref([
  { id: 1, name: '计算机导论' },
  { id: 2, name: '程序设计基础' }
])

// 模拟数据
const homeworkList = ref([
  {
    id: 1,
    title: '第一次作业',
    courseName: '计算机导论',
    deadline: '2024-01-20 23:59:59',
    status: '已提交',
    score: 90
  },
  {
    id: 2,
    title: '第二次作业',
    courseName: '程序设计基础',
    deadline: '2024-01-25 23:59:59',
    status: '未提交'
  }
])

const loading = ref(false)
const total = ref(2)

// 状态样式
const getStatusType = (status) => {
  const map = {
    '未提交': 'warning',
    '已提交': 'primary',
    '已批改': 'success'
  }
  return map[status] || 'info'
}

// 布置作业对话框
const homeworkDialog = reactive({
  visible: false
})

const homeworkForm = reactive({
  title: '',
  courseId: '',
  content: '',
  deadline: ''
})

const rules = {
  title: [{ required: true, message: '请输入作业标题', trigger: 'blur' }],
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  content: [{ required: true, message: '请输入作业内容', trigger: 'blur' }],
  deadline: [{ required: true, message: '请选择截止时间', trigger: 'change' }]
}

// 提交作业对话框
const submitDialog = reactive({
  visible: false
})

const submitForm = reactive({
  answer: ''
})

const submitRules = {
  answer: [{ required: true, message: '请输入作业答案', trigger: 'blur' }]
}

// 批改作业对话框
const gradeDialog = reactive({
  visible: false
})

const gradeForm = reactive({
  score: 0,
  comment: ''
})

const gradeRules = {
  score: [{ required: true, message: '请输入成绩', trigger: 'blur' }],
  comment: [{ required: true, message: '请输入评语', trigger: 'blur' }]
}

// 方法
const handleQuery = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const resetQuery = () => {
  queryParams.courseId = ''
  queryParams.title = ''
  queryParams.status = ''
  handleQuery()
}

const handleAdd = () => {
  homeworkDialog.visible = true
  Object.assign(homeworkForm, {
    title: '',
    courseId: '',
    content: '',
    deadline: ''
  })
}

const handleView = (row) => {
  ElMessage.info('查看作业详情：' + row.title)
}

const handleSubmit = (row) => {
  submitDialog.visible = true
  submitForm.answer = ''
}

const handleGrade = (row) => {
  gradeDialog.visible = true
  Object.assign(gradeForm, {
    score: 0,
    comment: ''
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认要删除该作业吗？', '警告', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleFileChange = (file) => {
  console.log('选择文件:', file)
}

const submitUpload = () => {
  ElMessage.success('文件上传成功')
}

const submitHomework = () => {
  ElMessage.success('作业布置成功')
  homeworkDialog.visible = false
  handleQuery()
}

const submitHomeworkAnswer = () => {
  ElMessage.success('作业提交成功')
  submitDialog.visible = false
  handleQuery()
}

const submitGrade = () => {
  ElMessage.success('批改完成')
  gradeDialog.visible = false
  handleQuery()
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
.homework-container {
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

.upload-demo {
  margin-bottom: 20px;
}
</style> 