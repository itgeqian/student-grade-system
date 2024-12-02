<template>
  <div class="score-container">
    <el-card>
      <template #header>
        <div class="header">
          <span>成绩管理</span>
          <div class="header-btns" v-if="userType === 'teacher'">
            <el-button type="primary" @click="handleSetRatio">设置成绩比例</el-button>
            <el-button type="success" @click="handleSubmitToAdmin">提交成绩</el-button>
            <el-button type="warning" @click="handleExport">导出成绩</el-button>
          </div>
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
        <el-form-item label="班级">
          <el-select v-model="queryParams.classId" placeholder="请选择班级">
            <el-option 
              v-for="item in classOptions" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="userType === 'teacher'" label="学号">
          <el-input v-model="queryParams.studentId" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 成绩比例显示 -->
      <div class="ratio-info" v-if="queryParams.courseId">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="作业成绩占比">{{ scoreSettings.homework }}%</el-descriptions-item>
          <el-descriptions-item label="实验成绩占比">{{ scoreSettings.experiment }}%</el-descriptions-item>
          <el-descriptions-item label="期末成绩占比">{{ scoreSettings.final }}%</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 成绩列表 -->
      <el-table :data="scoreList" v-loading="loading" border>
        <el-table-column prop="studentId" label="学号" width="120" />
        <el-table-column prop="studentName" label="姓名" width="100" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="homeworkScore" label="作业成绩" width="100">
          <template #default="{ row }">
            <template v-if="userType === 'teacher' && !row.submitted">
              <el-input-number 
                v-model="row.homeworkScore" 
                :min="0" 
                :max="100"
                :precision="0"
                size="small"
                @change="handleScoreChange(row)"
              />
            </template>
            <template v-else>
              {{ row.homeworkScore || '-' }}
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="experimentScore" label="实验成绩" width="100">
          <template #default="{ row }">
            <template v-if="userType === 'teacher' && !row.submitted">
              <el-input-number 
                v-model="row.experimentScore" 
                :min="0" 
                :max="100"
                :precision="0"
                size="small"
                @change="handleScoreChange(row)"
              />
            </template>
            <template v-else>
              {{ row.experimentScore || '-' }}
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="finalScore" label="期末成绩" width="100">
          <template #default="{ row }">
            <template v-if="userType === 'teacher' && !row.submitted">
              <el-input-number 
                v-model="row.finalScore" 
                :min="0" 
                :max="100"
                :precision="0"
                size="small"
                @change="handleScoreChange(row)"
              />
            </template>
            <template v-else>
              {{ row.finalScore || '-' }}
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="totalScore" label="总评成绩" width="100">
          <template #default="{ row }">
            {{ calculateTotalScore(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.submitted ? 'success' : 'warning'">
              {{ row.submitted ? '已提交' : '未提交' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 成绩统计 -->
      <div class="statistics" v-if="scoreList.length > 0">
        <el-divider>成绩统计</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="stat-card">
              <h4>班级成绩概况</h4>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="平均分">{{ statistics.average }}</el-descriptions-item>
                <el-descriptions-item label="最高分">{{ statistics.highest }}</el-descriptions-item>
                <el-descriptions-item label="最低分">{{ statistics.lowest }}</el-descriptions-item>
                <el-descriptions-item label="及格率">{{ statistics.passRate }}%</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="stat-card">
              <h4>成绩分布</h4>
              <div class="score-distribution">
                <div v-for="(count, range) in statistics.distribution" :key="range" class="distribution-item">
                  <span>{{ range }}分</span>
                  <el-progress 
                    :percentage="(count / scoreList.length) * 100" 
                    :format="() => count + '人'"
                  />
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 成绩比例设置对话框 -->
    <el-dialog
      title="设置成绩比例"
      v-model="ratioDialog.visible"
      width="500px"
    >
      <el-form :model="ratioForm" label-width="120px">
        <el-form-item label="作业成绩占比">
          <el-input-number 
            v-model="ratioForm.homework" 
            :min="0" 
            :max="100"
            :precision="0"
            @change="validateTotal"
          />
          <span class="unit">%</span>
        </el-form-item>
        <el-form-item label="实验成绩占比">
          <el-input-number 
            v-model="ratioForm.experiment" 
            :min="0" 
            :max="100"
            :precision="0"
            @change="validateTotal"
          />
          <span class="unit">%</span>
        </el-form-item>
        <el-form-item label="期末成绩占比">
          <el-input-number 
            v-model="ratioForm.final" 
            :min="0" 
            :max="100"
            :precision="0"
            @change="validateTotal"
          />
          <span class="unit">%</span>
        </el-form-item>
        <el-form-item>
          <div class="total-ratio">
            总计：{{ ratioForm.homework + ratioForm.experiment + ratioForm.final }}%
            <span v-if="ratioForm.homework + ratioForm.experiment + ratioForm.final !== 100" class="error-tip">
              (必须等于100%)
            </span>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="ratioDialog.visible = false">取 消</el-button>
          <el-button type="primary" @click="confirmRatio">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as XLSX from 'xlsx'

const store = useStore()
const userType = computed(() => store.state.user.userType)

// 查询参数
const queryParams = reactive({
  courseId: '',
  classId: '',
  studentId: ''
})

// 成绩设置
const scoreSettings = reactive({
  homework: 30,
  experiment: 30,
  final: 40
})

// 成绩列表
const scoreList = ref([
  {
    studentId: '2021001',
    studentName: '张三',
    className: '计算机2101',
    homeworkScore: 85,
    experimentScore: 90,
    finalScore: 88,
    submitted: false
  },
  {
    studentId: '2021002',
    studentName: '李四',
    className: '计算机2101',
    homeworkScore: 92,
    experimentScore: 88,
    finalScore: 85,
    submitted: false
  }
])

const loading = ref(false)

// 成绩统计
const statistics = computed(() => {
  const totalScores = scoreList.value.map(item => calculateTotalScore(item))
  const distribution = {
    '0-59': 0,
    '60-69': 0,
    '70-79': 0,
    '80-89': 0,
    '90-100': 0
  }

  totalScores.forEach(score => {
    if (score < 60) distribution['0-59']++
    else if (score < 70) distribution['60-69']++
    else if (score < 80) distribution['70-79']++
    else if (score < 90) distribution['80-89']++
    else distribution['90-100']++
  })

  return {
    average: Math.round(totalScores.reduce((a, b) => a + b, 0) / totalScores.length),
    highest: Math.max(...totalScores),
    lowest: Math.min(...totalScores),
    passRate: Math.round((totalScores.filter(score => score >= 60).length / totalScores.length) * 100),
    distribution
  }
})

// 成绩比例设置
const ratioDialog = reactive({
  visible: false
})

const ratioForm = reactive({
  homework: 30,
  experiment: 30,
  final: 40
})

// 方法
const handleSetRatio = () => {
  Object.assign(ratioForm, scoreSettings)
  ratioDialog.visible = true
}

const validateTotal = () => {
  const total = ratioForm.homework + ratioForm.experiment + ratioForm.final
  if (total !== 100) {
    ElMessage.warning(`当前比例总和为${total}%，需要调整为100%`)
  }
}

const confirmRatio = () => {
  const total = ratioForm.homework + ratioForm.experiment + ratioForm.final
  if (total !== 100) {
    ElMessage.error('成绩比例之和必须为100%')
    return
  }
  
  Object.assign(scoreSettings, ratioForm)
  ratioDialog.visible = false
  ElMessage.success('成绩比例设置成功')
}

const calculateTotalScore = (row) => {
  const { homeworkScore = 0, experimentScore = 0, finalScore = 0 } = row
  const total = 
    (homeworkScore * scoreSettings.homework / 100) +
    (experimentScore * scoreSettings.experiment / 100) +
    (finalScore * scoreSettings.final / 100)
  return Math.round(total)
}

const handleScoreChange = (row) => {
  // 验证分数范围
  const scores = ['homeworkScore', 'experimentScore', 'finalScore']
  scores.forEach(key => {
    if (row[key] > 100) row[key] = 100
    if (row[key] < 0) row[key] = 0
  })
}

const handleSubmitToAdmin = () => {
  ElMessageBox.confirm('确认要提交成绩吗？提交后将不能修改', '提示', {
    type: 'warning'
  }).then(() => {
    scoreList.value.forEach(item => {
      item.submitted = true
    })
    ElMessage.success('成绩提交成功')
  })
}

const handleExport = () => {
  const headers = ['学号', '姓名', '班级', '作业成绩', '实验成绩', '期末成绩', '总评成绩']
  const data = scoreList.value.map(item => [
    item.studentId,
    item.studentName,
    item.className,
    item.homeworkScore,
    item.experimentScore,
    item.finalScore,
    calculateTotalScore(item)
  ])
  
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Scores')
  XLSX.writeFile(wb, '成绩单.xlsx')
}

// ... (其他必要的方法实现)
</script>

<style scoped>
.score-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ratio-info {
  margin: 20px 0;
}

.statistics {
  margin-top: 30px;
}

.stat-card {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.stat-card h4 {
  margin: 0 0 15px 0;
}

.score-distribution {
  margin-top: 15px;
}

.distribution-item {
  margin-bottom: 10px;
}

.unit {
  margin-left: 5px;
}

.total-ratio {
  margin-top: 10px;
  text-align: right;
}

.error-tip {
  color: #f56c6c;
  margin-left: 5px;
}
</style> 