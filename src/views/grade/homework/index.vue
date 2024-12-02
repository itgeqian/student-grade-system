<template>
  <div class="homework-container">
    <el-card>
      <template #header>
        <div class="header">
          <span>作业管理</span>
          <el-button 
            v-if="userType === 'teacher'" 
            type="primary" 
            @click="handleAddHomework"
          >布置作业</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
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
            <el-option label="已退回" value="已退回" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 作业列表 -->
      <el-table :data="homeworkList" v-loading="loading">
        <el-table-column prop="title" label="作业标题" />
        <el-table-column prop="courseName" label="所属课程" />
        <el-table-column prop="deadline" label="截止时间" width="160" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="成绩" width="80">
          <template #default="{ row }">
            {{ row.score || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <!-- 教师操作 -->
            <template v-if="userType === 'teacher'">
              <el-button type="primary" link @click="handleGrade(row)">批改</el-button>
              <el-button type="warning" link @click="handleViewSubmissions(row)">查看提交</el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            </template>
            <!-- 学生操作 -->
            <template v-else>
              <el-button 
                type="primary" 
                link 
                @click="handleSubmit(row)"
                v-if="['未提交', '已退回'].includes(row.status)"
              >提交</el-button>
              <el-button 
                type="info" 
                link 
                @click="handleViewDetail(row)"
                v-else
              >查看</el-button>
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
      title="提交作业"
      v-model="submitDialog.visible"
      width="600px"
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
            rows="6"
            placeholder="请输入作业答案"
          />
        </el-form-item>
        <el-form-item label="附件">
          <el-upload
            action="#"
            :auto-upload="false"
            :on-change="handleSubmitFileChange"
            :file-list="submitForm.attachments"
          >
            <el-button type="primary">选择文件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="submitDialog.visible = false">取 消</el-button>
          <el-button type="primary" @click="confirmSubmit">确 定</el-button>
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
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'

const store = useStore()
const userType = computed(() => store.state.user.userType)

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

// 对话框相关数据
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

// 表单数据
const homeworkForm = reactive({
  title: '',
  courseId: '',
  content: '',
  deadline: '',
  attachments: []
})

const submitForm = reactive({
  answer: '',
  attachments: []
})

const gradeForm = reactive({
  score: 0,
  comment: ''
})

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

const handleSubmitFileChange = (file, fileList) => {
  submitForm.attachments = fileList
}

const submitHomework = async () => {
  // TODO: 调用API保存作业
  ElMessage.success('作业布置成功')
  homeworkDialog.visible = false
  handleQuery()
}

const handleSubmit = (row) => {
  submitDialog.homework = row
  submitDialog.visible = true
  Object.assign(submitForm, {
    answer: '',
    attachments: []
  })
}

const confirmSubmit = async () => {
  // TODO: 调用API提交作业
  ElMessage.success('作业提交成功')
  submitDialog.visible = false
  handleQuery()
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

// ... (其他必要的方法实现)
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
</style> 