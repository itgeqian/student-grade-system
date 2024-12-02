<template>
  <div style="padding: 0 15px;" @click="toggleClick">
    <el-icon :class="{'is-active': isActive}">
      <Fold v-if="isActive" />
      <Expand v-else />
    </el-icon>
  </div>
</template>

<script setup>
import { Fold, Expand } from '@element-plus/icons-vue'

defineProps({
  isActive: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggleClick'])

const toggleClick = () => {
  emit('toggleClick')
}
</script>

<style scoped>
.el-icon {
  vertical-align: middle;
  cursor: pointer;
  width: 20px;
  height: 20px;
}

.is-active {
  transform: rotate(180deg);
}
</style> 