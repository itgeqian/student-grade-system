<template>
  <div class="upload-container">
    <!-- 文件上传区域 -->
    <el-upload
      ref="uploadRef"
      :action="uploadUrl"
      :headers="headers"
      :multiple="multiple"
      :limit="limit"
      :file-list="fileList"
      :before-upload="handleBeforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-exceed="handleExceed"
      :on-remove="handleRemove"
      :accept="accept"
      :disabled="disabled"
      :drag="drag"
      name="file"
    >
      <template #trigger>
        <slot name="trigger">
          <el-button type="primary" :icon="Plus">选择文件</el-button>
        </slot>
      </template>

      <template #tip>
        <slot name="tip">
          <div class="el-upload__tip">
            {{ tipText }}
          </div>
        </slot>
      </template>

      <!-- 拖拽上传提示 -->
      <template v-if="drag" #default>
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
      </template>
    </el-upload>

    <!-- 文件预览 -->
    <el-dialog v-model="preview.visible" :title="preview.title" append-to-body>
      <div class="preview-content" v-loading="preview.loading">
        <!-- 图片预览 -->
        <img
          v-if="preview.isImage"
          :src="preview.url"
          class="preview-image"
          alt="预览图片"
        >
        <!-- PDF预览 -->
        <iframe
          v-else-if="preview.isPdf"
          :src="preview.url"
          class="preview-pdf"
        ></iframe>
        <!-- 其他文件 -->
        <div v-else class="preview-other">
          <el-icon :size="48"><document /></el-icon>
          <p>此文件类型暂不支持预览，请下载后查看</p>
          <el-button type="primary" @click="handleDownload(preview.url)">
            下载文件
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Document, UploadFilled } from '@element-plus/icons-vue'

const props = defineProps({
  // 上传地址
  uploadUrl: {
    type: String,
    required: true
  },
  // 请求头
  headers: {
    type: Object,
    default: () => ({})
  },
  // 是否多选
  multiple: {
    type: Boolean,
    default: false
  },
  // 最大上传数量
  limit: {
    type: Number,
    default: 5
  },
  // 接受的文件类型
  accept: {
    type: String,
    default: ''
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 是否启用拖拽上传
  drag: {
    type: Boolean,
    default: false
  },
  // 文件大小限制(MB)
  maxSize: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['update:fileList', 'success', 'error', 'remove'])

// 上传组件ref
const uploadRef = ref(null)
// 文件列表
const fileList = ref([])

// 提示文本
const tipText = computed(() => {
  const types = props.accept ? `支持 ${props.accept} 格式，` : ''
  return `${types}单个文件不超过 ${props.maxSize}MB`
})

// 预览相关
const preview = ref({
  visible: false,
  loading: false,
  title: '',
  url: '',
  isImage: false,
  isPdf: false
})

// 上传前校验
const handleBeforeUpload = (file) => {
  // 文件大小校验
  const isLt = file.size / 1024 / 1024 < props.maxSize
  if (!isLt) {
    ElMessage.error(`文件大小不能超过 ${props.maxSize}MB!`)
    return false
  }
  return true
}

// 上传成功
const handleSuccess = (response, file, fileList) => {
  ElMessage.success('上传成功')
  emit('success', { response, file, fileList })
}

// 上传失败
const handleError = (error, file, fileList) => {
  ElMessage.error('上传失败')
  emit('error', { error, file, fileList })
}

// 超出数量限制
const handleExceed = (files) => {
  ElMessage.warning(`最多只能上传 ${props.limit} 个文件`)
}

// 移除文件
const handleRemove = (file, fileList) => {
  emit('remove', { file, fileList })
}

// 预览文件
const handlePreview = async (file) => {
  preview.value = {
    visible: true,
    loading: true,
    title: file.name,
    url: file.url,
    isImage: /\.(jpg|jpeg|png|gif)$/i.test(file.name),
    isPdf: /\.pdf$/i.test(file.name)
  }

  try {
    // 如果是图片，预加载
    if (preview.value.isImage) {
      await new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = resolve
        img.onerror = reject
        img.src = file.url
      })
    }
  } catch (error) {
    ElMessage.error('文件预览失败')
  } finally {
    preview.value.loading = false
  }
}

// 下载文件
const handleDownload = (url) => {
  window.open(url)
}

// 对外暴露方法
defineExpose({
  uploadRef,
  clearFiles: () => {
    uploadRef.value?.clearFiles()
  },
  abort: (file) => {
    uploadRef.value?.abort(file)
  }
})
</script>

<style lang="scss" scoped>
.upload-container {
  .el-upload__tip {
    color: #909399;
    font-size: 12px;
    margin-top: 8px;
  }

  .preview-content {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;

    .preview-image {
      max-width: 100%;
      max-height: 500px;
    }

    .preview-pdf {
      width: 100%;
      height: 500px;
      border: none;
    }

    .preview-other {
      text-align: center;
      color: #909399;

      .el-icon {
        margin-bottom: 16px;
      }
    }
  }
}

// 拖拽上传样式
.el-upload-dragger {
  .el-icon--upload {
    font-size: 48px;
    color: #909399;
    margin-bottom: 16px;
  }

  .el-upload__text {
    color: #606266;
    em {
      color: #409EFF;
      font-style: normal;
    }
  }
}
</style> 