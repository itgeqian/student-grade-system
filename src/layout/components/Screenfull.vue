<template>
  <div @click="toggle">
    <el-icon :size="20">
      <FullScreen v-if="!isFullscreen" />
      <Aim v-else />
    </el-icon>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { FullScreen, Aim } from '@element-plus/icons-vue'
import screenfull from 'screenfull'
import { ElMessage } from 'element-plus'

const isFullscreen = ref(false)

const change = () => {
  isFullscreen.value = screenfull.isFullscreen
}

const toggle = () => {
  if (!screenfull.isEnabled) {
    ElMessage.warning('你的浏览器不支持全屏')
    return
  }
  screenfull.toggle()
}

onMounted(() => {
  if (screenfull.isEnabled) {
    screenfull.on('change', change)
  }
})

onUnmounted(() => {
  if (screenfull.isEnabled) {
    screenfull.off('change', change)
  }
})
</script>

<style scoped>
.screenfull {
  cursor: pointer;
  transition: all .3s;
  
  &:hover {
    color: #409EFF;
  }
}
</style> 