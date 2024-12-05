<template>
  <div class="homework-container">
    <!-- 搜索区域 -->
    <el-card>
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="课程">
          <el-select v-model="queryParams.courseId" placeholder="请选择课程">
            <el-option
              v-for="item in courseOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
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

      <!-- 操作按钮 -->
      <div class="toolbar" v-if="userType === 'teacher'">
        <el-button type="primary" @click="handleAddHomework">布置作业</el-button>
      </div>

      <!-- 作业列表 -->
      <el-table :data="homeworkList" v-loading="loading" border style="margin-top: 15px;">
        <el-table-column prop="title" label="作业标题" min-width="180" />
        <el-table-column prop="courseName" label="所属课程" width="150" />
        <el-table-column prop="deadline" label="截止时间" width="180" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="成绩" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.score">{{ row.score }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" align="center">
          <template #default="{ row }">
            <!-- 教师操作 -->
            <template v-if="userType === 'teacher'">
              <el-button type="primary" link @click="handleViewDetail(row)">
                查看
              </el-button>
              <el-button type="success" link @click="handleViewSubmissions(row)">
                提交情况
              </el-button>
              <el-button type="danger" link @click="handleDelete(row)">
                删除
              </el-button>
            </template>
            <!-- 学生操作 -->
            <template v-else>
              <el-button type="primary" link @click="handleViewDetail(row)">
                查看
              </el-button>
              <el-button 
                type="success" 
                link 
                @click="openSubmitDialog(row)"
                v-if="row.status === '未提交'"
              >
                提交
              </el-button>
              <el-button 
                type="info" 
                link 
                disabled 
                v-else-if="row.status === '已提交'"
              >
                已提交
              </el-button>
              <el-button 
                type="warning" 
                link 
                @click="handleViewDetail(row)"
                v-else
              >
                查看成绩
              </el-button>
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
        />
      </div>
    </el-card>

    <!-- 布置作业对话框 -->
    <el-dialog
      :title="homeworkDialog.type === 'add' ? '布置作业' : '编辑作业'"
      v-model="homeworkDialog.visible"
      width="600px"
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
              v-for="item in courseOptions" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id" 
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
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="homeworkForm.attachments"
          >
            <el-button type="primary">选择文件</el-button>
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
      :title="`提交作业 - ${currentHomework?.title}`"
      v-model="submitDialog.visible"
      width="600px"
    >
      <el-form
        ref="submitFormRef"
        :model="submitForm"
        :rules="submitRules"
        label-width="80px"
      >
        <el-form-item label="作业内容" prop="content">
          <el-input
            v-model="submitForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入作业内容"
          />
        </el-form-item>
        <el-form-item label="附件">
          <Upload
            ref="uploadRef"
            upload-url="/api/upload"
            :headers="uploadHeaders"
            :multiple="true"
            :limit="3"
            accept=".doc,.docx,.pdf,.jpg,.png"
            :max-size="20"
            drag
            @success="handleUploadSuccess"
            @error="handleUploadError"
            @remove="handleFileRemove"
          >
            <template #tip>
              支持 Word、PDF、图片格式，单个文件不超过20MB，最多上传3个文件
            </template>
          </Upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="submitDialog.visible = false">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">提 交</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批改作业对话框 -->
    <el-dialog
      title="批改作业"
      v-model="gradeDialog.visible"
      width="800px"
    >
      <div class="grade-content">
        <h3>{{ gradeDialog.homework?.title }}</h3>
        <div class="student-answer">
          <p class="answer-label">学生答案：</p>
          <div class="answer-content">{{ gradeDialog.answer }}</div>
          <div v-if="gradeDialog.attachments?.length" class="attachments">
            <p>附件：</p>
            <el-link 
              v-for="file in gradeDialog.attachments"
              :key="file.name"
              type="primary"
              @click="downloadFile(file)"
            >
              {{ file.name }}
            </el-link>
          </div>
        </div>
        <el-form :model="gradeForm" label-width="100px">
          <el-form-item label="成绩" required>
            <el-input-number 
              v-model="gradeForm.score" 
              :min="0" 
              :max="100"
              :precision="0" 
            />
          </el-form-item>
          <el-form-item label="评语">
            <el-input
              v-model="gradeForm.comment"
              type="textarea"
              rows="3"
            />
          </el-form-item>
          <el-form-item label="快捷评语">
            <div class="quick-comments">
              <el-tag
                v-for="item in quickComments"
                :key="item"
                @click="selectQuickComment(item)"
                class="quick-comment-tag"
              >
                {{ item }}
              </el-tag>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="gradeDialog.visible = false">取 消</el-button>
          <el-button type="warning" @click="returnHomework">退 回</el-button>
          <el-button type="primary" @click="confirmGrade">确认评分</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看作业对话框 -->
    <el-dialog
      :title="`查看作业 - ${currentHomework?.title}`"
      v-model="viewDialog.visible"
      width="800px"
    >
      <div class="homework-detail">
        <div class="content">
          <h4>作业内容：</h4>
          <p>{{ viewDialog.content }}</p>
        </div>
        <div class="attachments" v-if="viewDialog.files?.length">
          <h4>附件列表：</h4>
          <ul>
            <li v-for="file in viewDialog.files" :key="file.id">
              <el-link type="primary" @click="handlePreview(file)">
                {{ file.name }}
              </el-link>
              <span class="file-size">({{ formatFileSize(file.size) }})</span>
            </li>
          </ul>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store'

const userStore = useUserStore()
const userType = computed(() => userStore.userInfo.userType)

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

// 快捷评语
const quickComments = [
  '思路清晰，完成得很好',
  '基本正确，但有待改进',
  '请认真完成作业要求',
  '建议多加练习',
  '请按时提交作业'
]

// 对话框状态
const homeworkDialog = reactive({
  visible: false,
  type: 'add'
})

const submitDialog = reactive({
  visible: false,
  homework: null
})

const gradeDialog = reactive({
  visible: false,
  homework: null,
  answer: '',
  attachments: []
})

const viewDialog = reactive({
  visible: false,
  content: '',
  files: []
})

const currentHomework = ref(null)

// 表单引用
const homeworkFormRef = ref(null)
const submitFormRef = ref(null)

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入作业标题', trigger: 'blur' }
  ],
  courseId: [
    { required: true, message: '请选择课程', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入作业内容', trigger: 'blur' }
  ],
  deadline: [
    { required: true, message: '请选择截止时间', trigger: 'change' }
  ]
}

const submitRules = {
  content: [
    { required: true, message: '请输入作业内容', trigger: 'blur' }
  ]
}

// 表单数据
const homeworkForm = reactive({
  title: '',
  courseId: '',
  content: '',
  deadline: '',
  attachments: []
})

const submitForm = reactive({
  content: '',
  files: []
})

const gradeForm = reactive({
  score: 0,
  comment: ''
})

// 上传相关
const uploadRef = ref(null)
const uploadHeaders = {
  Authorization: 'Bearer ' + localStorage.getItem('token')
}

// 方法
const handleAddHomework = () => {
  homeworkDialog.type = 'add'
  homeworkDialog.visible = true
  Object.assign(homeworkForm, {
    title: '',
    courseId: '',
    content: '',
    deadline: '',
    attachments: []
  })
}

const handleFileChange = (file, fileList) => {
  homeworkForm.attachments = fileList
}

const submitHomework = async () => {
  // TODO: 调用API保存作业
  ElMessage.success('作业布成功')
  homeworkDialog.visible = false
  handleQuery()
}

const openSubmitDialog = (row) => {
  currentHomework.value = row
  submitDialog.homework = row
  submitDialog.visible = true
  Object.assign(submitForm, {
    content: '',
    files: []
  })
}

const handleSubmit = async () => {
  if (!submitFormRef.value) return
  
  try {
    await submitFormRef.value.validate()
    // TODO: 调用API提交作业
    console.log('提交作业:', {
      content: submitForm.content,
      files: submitForm.files
    })
    
    ElMessage.success('提交成功')
    submitDialog.visible = false
    // 重置表单
    submitForm.content = ''
    submitForm.files = []
    uploadRef.value?.clearFiles()
    handleQuery() // 刷新列表
  } catch (error) {
    console.error('提交失败:', error)
  }
}

const handleGrade = (row) => {
  gradeDialog.homework = row
  gradeDialog.visible = true
  // TODO: 从后端获取学生答案和附件
  gradeDialog.answer = '这里是学生的答案...'
  gradeDialog.attachments = []
  Object.assign(gradeForm, {
    score: 0,
    comment: ''
  })
}

const selectQuickComment = (comment) => {
  gradeForm.comment = comment
}

const confirmGrade = async () => {
  // TODO: 调用API保存评分
  ElMessage.success('评分成功')
  gradeDialog.visible = false
  handleQuery()
}

const returnHomework = () => {
  ElMessageBox.confirm('确认要退回该作业吗？', '提示', {
    type: 'warning'
  }).then(() => {
    // TODO: 调用API退回作业
    ElMessage.success('作业已退回')
    gradeDialog.visible = false
    handleQuery()
  })
}

// 添加查询方法
const handleQuery = () => {
  loading.value = true
  // TODO: 调用API获取作业列表
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 添加查看作业详情方法
const handleViewDetail = (row) => {
  currentHomework.value = row
  viewDialog.content = row.content || ''
  viewDialog.files = row.attachments || []
  viewDialog.visible = true
}

// 添加查看提交情况方法
const handleViewSubmissions = (row) => {
  // TODO: 实现查看提交情况
  ElMessage.info('查看提交情况：' + row.title)
}

// 添加删除作业方法
const handleDelete = (row) => {
  ElMessageBox.confirm('确认要删除该作业吗？', '警告', {
    type: 'warning'
  }).then(() => {
    // TODO: 调用API删除作业
    ElMessage.success('删除成功')
    handleQuery()
  }).catch(() => {})
}

// 文件上传成功
const handleUploadSuccess = ({ response, file }) => {
  submitForm.files.push({
    id: response.data.id,
    name: file.name,
    url: response.data.url,
    size: file.size
  })
}

// 文件上传失败
const handleUploadError = ({ error }) => {
  console.error('上传失败:', error)
}

// 移除文件
const handleFileRemove = ({ file }) => {
  const index = submitForm.files.findIndex(item => item.name === file.name)
  if (index !== -1) {
    submitForm.files.splice(index, 1)
  }
}

// 预览文件
const handlePreview = (file) => {
  // 使用Upload组件的预览功能
  uploadRef.value?.handlePreview(file)
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (size < 1024) {
    return size + 'B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + 'KB'
  } else {
    return (size / 1024 / 1024).toFixed(2) + 'MB'
  }
}

// 初始化时重置所有对话框状态
const resetDialogs = () => {
  homeworkDialog.visible = false
  submitDialog.visible = false
  gradeDialog.visible = false
  viewDialog.visible = false
  currentHomework.value = null
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

.grade-content {
  padding: 20px;
}

.student-answer {
  margin: 20px 0;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.answer-label {
  font-weight: bold;
  margin-bottom: 10px;
}

.answer-content {
  white-space: pre-wrap;
}

.attachments {
  margin-top: 10px;
}

.quick-comments {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.quick-comment-tag {
  cursor: pointer;
}

.quick-comment-tag:hover {
  background-color: #409EFF;
  color: white;
}

.homework-detail {
  .content {
    margin-bottom: 20px;
    
    h4 {
      margin-bottom: 10px;
      color: #303133;
    }
    
    p {
      color: #606266;
      line-height: 1.6;
    }
  }
  
  .attachments {
    h4 {
      margin-bottom: 10px;
      color: #303133;
    }
    
    ul {
      list-style: none;
      padding: 0;
      
      li {
        margin-bottom: 8px;
        
        .file-size {
          margin-left: 8px;
          color: #909399;
          font-size: 12px;
        }
      }
    }
  }
}
</style> 