<template>
  <div class="teacher-container">
    <el-card>
      <template #header>
        <div class="header">
          <span>教师管理</span>
          <el-button type="primary" @click="handleAdd">新增教师</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="教师姓名">
          <el-input v-model="queryParams.name" placeholder="请输入教师姓名" />
        </el-form-item>
        <el-form-item label="所属部门">
          <el-select v-model="queryParams.department" placeholder="请选择部门">
            <el-option label="计算机学院" value="计算机学院" />
            <el-option label="外国语学院" value="外国语学院" />
            <el-option label="经济管理学院" value="经济管理学院" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格区域 -->
      <el-table :data="teacherList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="工号" width="120" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="department" label="所属部门" />
        <el-table-column prop="title" label="职称" />
        <el-table-column prop="phone" label="联系电话" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
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

    <!-- 教师表单对话框 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="500px"
      append-to-body
    >
      <el-form
        ref="teacherFormRef"
        :model="teacherForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="工号" prop="id">
          <el-input v-model="teacherForm.id" placeholder="请输入工号" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="teacherForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="所属部门" prop="department">
          <el-select v-model="teacherForm.department" placeholder="请选择部门">
            <el-option label="计算机学院" value="计算机学院" />
            <el-option label="外国语学院" value="外国语学院" />
            <el-option label="经济管理学院" value="经济管理学院" />
          </el-select>
        </el-form-item>
        <el-form-item label="职称" prop="title">
          <el-select v-model="teacherForm.title" placeholder="请选择职称">
            <el-option label="教授" value="教授" />
            <el-option label="副教授" value="副教授" />
            <el-option label="讲师" value="讲师" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="teacherForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="teacherForm.email" placeholder="请输入邮箱" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialog.visible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: '',
  department: ''
})

// 模拟数据
const teacherList = ref([
  {
    id: 'T001',
    name: '张三',
    department: '计算机学院',
    title: '教授',
    phone: '13800138000',
    email: 'zhangsan@example.com'
  },
  {
    id: 'T002',
    name: '李四',
    department: '外国语学院',
    title: '副教授',
    phone: '13800138001',
    email: 'lisi@example.com'
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

const teacherForm = reactive({
  id: '',
  name: '',
  department: '',
  title: '',
  phone: '',
  email: ''
})

const rules = {
  id: [{ required: true, message: '请输入工号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  title: [{ required: true, message: '请选择职称', trigger: 'change' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }]
}

const teacherFormRef = ref(null)

// 方法
const handleQuery = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const resetQuery = () => {
  queryParams.name = ''
  queryParams.department = ''
  handleQuery()
}

const handleAdd = () => {
  dialog.type = 'add'
  dialog.title = '添加教师'
  dialog.visible = true
  Object.assign(teacherForm, {
    id: '',
    name: '',
    department: '',
    title: '',
    phone: '',
    email: ''
  })
}

const handleEdit = (row) => {
  dialog.type = 'edit'
  dialog.title = '编辑教师'
  dialog.visible = true
  Object.assign(teacherForm, row)
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认要删除该教师吗？', '警告', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const submitForm = async () => {
  if (!teacherFormRef.value) return
  
  try {
    await teacherFormRef.value.validate()
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
</script>

<style scoped>
.teacher-container {
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