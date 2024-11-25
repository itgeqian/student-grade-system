<template>
  <div class="score-container">
    <el-tabs v-model="activeTab">
      <!-- 成绩录入标签页 -->
      <el-tab-pane label="成绩录入" name="input">
        <el-card>
          <template #header>
            <div class="header">
              <span>成绩录入</span>
              <el-button v-if="isTeacher" type="primary" @click="handleSaveScores">保存成绩</el-button>
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
            <el-form-item label="班级">
              <el-select v-model="queryParams.classId" placeholder="请选择班级">
                <el-option
                  v-for="cls in classOptions"
                  :key="cls.id"
                  :label="cls.name"
                  :value="cls.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleQuery">查询</el-button>
              <el-button @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>

          <!-- 成绩构成设置 -->
          <div v-if="isTeacher" class="score-settings mb-20">
            <el-alert
              title="请设置成绩构成比例（总和需为100%）"
              type="info"
              :closable="false"
            />
            <el-form :inline="true" :model="scoreSettings" class="mt-10">
              <el-form-item label="作业成绩">
                <el-input-number
                  v-model="scoreSettings.homework"
                  :min="0"
                  :max="100"
                  @change="validateTotal"
                />
                <span class="ml-5">%</span>
              </el-form-item>
              <el-form-item label="实验成绩">
                <el-input-number
                  v-model="scoreSettings.experiment"
                  :min="0"
                  :max="100"
                  @change="validateTotal"
                />
                <span class="ml-5">%</span>
              </el-form-item>
              <el-form-item label="期末成绩">
                <el-input-number
                  v-model="scoreSettings.final"
                  :min="0"
                  :max="100"
                  @change="validateTotal"
                />
                <span class="ml-5">%</span>
              </el-form-item>
            </el-form>
          </div>

          <!-- 成绩表格 -->
          <el-table :data="scoreList" style="width: 100%" v-loading="loading">
            <el-table-column prop="studentId" label="学号" width="120" />
            <el-table-column prop="studentName" label="姓名" width="100" />
            <el-table-column prop="className" label="班级" width="120" />
            <el-table-column label="作业成绩" width="120">
              <template #default="{ row }">
                <el-input-number
                  v-if="isTeacher"
                  v-model="row.homeworkScore"
                  :min="0"
                  :max="100"
                  size="small"
                />
                <span v-else>{{ row.homeworkScore }}</span>
              </template>
            </el-table-column>
            <el-table-column label="实验成绩" width="120">
              <template #default="{ row }">
                <el-input-number
                  v-if="isTeacher"
                  v-model="row.experimentScore"
                  :min="0"
                  :max="100"
                  size="small"
                />
                <span v-else>{{ row.experimentScore }}</span>
              </template>
            </el-table-column>
            <el-table-column label="期末成绩" width="120">
              <template #default="{ row }">
                <el-input-number
                  v-if="isTeacher"
                  v-model="row.finalScore"
                  :min="0"
                  :max="100"
                  size="small"
                />
                <span v-else>{{ row.finalScore }}</span>
              </template>
            </el-table-column>
            <el-table-column label="总评成绩" width="120">
              <template #default="{ row }">
                {{ calculateTotalScore(row) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 成绩统计标签页 -->
      <el-tab-pane label="成绩统计" name="statistics">
        <el-card>
          <template #header>
            <div class="header">
              <span>成绩统计</span>
              <el-button type="primary" @click="handleExport">导出统计</el-button>
            </div>
          </template>

          <!-- 统计图表 -->
          <el-row :gutter="20">
            <el-col :span="12">
              <div ref="chartRef1" style="height: 400px"></div>
            </el-col>
            <el-col :span="12">
              <div ref="chartRef2" style="height: 400px"></div>
            </el-col>
          </el-row>

          <!-- 统计数据 -->
          <el-row :gutter="20" class="mt-20">
            <el-col :span="24">
              <el-card>
                <template #header>
                  <div class="card-header">
                    <span>成绩分布</span>
                  </div>
                </template>
                <el-table :data="statisticsData" border style="width: 100%">
                  <el-table-column prop="range" label="分数段" />
                  <el-table-column prop="count" label="人数" />
                  <el-table-column prop="percentage" label="占比">
                    <template #default="{ row }">
                      {{ row.percentage }}%
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import XLSX from 'xlsx'

const store = useStore()
const activeTab = ref('input')
const chartRef1 = ref(null)
const chartRef2 = ref(null)

// 用户角色判断
const isTeacher = computed(() => store.state.user.userType === 'teacher')

// 查询参数
const queryParams = reactive({
  courseId: '',
  classId: ''
})

// 课程和班级选项
const courseOptions = ref([
  { id: 1, name: '计算机导论' },
  { id: 2, name: '程序设计基础' }
])

const classOptions = ref([
  { id: 1, name: '计算机2101' },
  { id: 2, name: '计算机2102' }
])

// 成绩构成设置
const scoreSettings = reactive({
  homework: 30,
  experiment: 30,
  final: 40
})

// 模拟成绩数据
const scoreList = ref([
  {
    studentId: '2021001',
    studentName: '张三',
    className: '计算机2101',
    homeworkScore: 85,
    experimentScore: 88,
    finalScore: 90
  },
  {
    studentId: '2021002',
    studentName: '李四',
    className: '计算机2101',
    homeworkScore: 78,
    experimentScore: 82,
    finalScore: 85
  }
])

// 统计数据
const statisticsData = ref([
  { range: '90-100', count: 5, percentage: 20 },
  { range: '80-89', count: 10, percentage: 40 },
  { range: '70-79', count: 6, percentage: 24 },
  { range: '60-69', count: 3, percentage: 12 },
  { range: '0-59', count: 1, percentage: 4 }
])

const loading = ref(false)

// 方法
const handleQuery = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const resetQuery = () => {
  queryParams.courseId = ''
  queryParams.classId = ''
  handleQuery()
}

const validateTotal = () => {
  const total = scoreSettings.homework + scoreSettings.experiment + scoreSettings.final
  if (total !== 100) {
    ElMessage.warning(`当前比例总和为${total}%，需要调整为100%`)
  }
}

const calculateTotalScore = (row) => {
  const { homeworkScore = 0, experimentScore = 0, finalScore = 0 } = row
  const total = 
    (homeworkScore * scoreSettings.homework / 100) +
    (experimentScore * scoreSettings.experiment / 100) +
    (finalScore * scoreSettings.final / 100)
  return Math.round(total)
}

const handleSaveScores = () => {
  ElMessage.success('成绩保存成功')
}

const handleExport = () => {
  ElMessage.success('统计数据导出成功')
}

// 初始化图表
const initCharts = () => {
  // 成绩分布饼图
  const chart1 = echarts.init(chartRef1.value)
  chart1.setOption({
    title: {
      text: '成绩分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: [
          { value: 5, name: '90-100分' },
          { value: 10, name: '80-89分' },
          { value: 6, name: '70-79分' },
          { value: 3, name: '60-69分' },
          { value: 1, name: '60分以下' }
        ]
      }
    ]
  })

  // 成绩趋势柱状图
  const chart2 = echarts.init(chartRef2.value)
  chart2.setOption({
    title: {
      text: '各项成绩平均分',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['作业成绩', '实验成绩', '期末成绩', '总评成绩']
    },
    yAxis: {
      type: 'value',
      max: 100
    },
    series: [
      {
        data: [82, 85, 88, 85],
        type: 'bar'
      }
    ]
  })

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    chart1.resize()
    chart2.resize()
  })
}

// 添加成绩统计方法
const calculateStatistics = (scores) => {
  const total = scores.length
  const passing = scores.filter(s => s >= 60).length
  const excellent = scores.filter(s => s >= 90).length
  
  return {
    passingRate: ((passing / total) * 100).toFixed(2),
    excellentRate: ((excellent / total) * 100).toFixed(2),
    average: (scores.reduce((a, b) => a + b, 0) / total).toFixed(2)
  }
}

// 添加导出成绩单功能
const exportScores = () => {
  const headers = ['学号', '姓名', '课程', '成绩']
  const data = scoreList.value.map(item => [
    item.studentId,
    item.studentName,
    item.courseName,
    item.score
  ])
  
  // 使用 xlsx 库导出 Excel
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Scores')
  XLSX.writeFile(wb, '成绩单.xlsx')
}

onMounted(() => {
  initCharts()
})
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

.search-form {
  margin-bottom: 20px;
}

.score-settings {
  margin: 20px 0;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.mb-20 {
  margin-bottom: 20px;
}

.mt-10 {
  margin-top: 10px;
}

.mt-20 {
  margin-top: 20px;
}

.ml-5 {
  margin-left: 5px;
}
</style> 