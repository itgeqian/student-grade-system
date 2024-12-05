<template>
  <template v-if="!item.hidden">
    <!-- 没有子菜单的情况 -->
    <template v-if="!item.children">
      <el-menu-item :index="item.path">
        <el-icon v-if="item.meta?.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <template #title>{{ item.meta?.title }}</template>
      </el-menu-item>
    </template>

    <!-- 有子菜单的情况 -->
    <el-sub-menu v-else :index="item.path">
      <template #title>
        <el-icon v-if="item.meta?.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <span>{{ item.meta?.title }}</span>
      </template>
      <template v-for="child in item.children" :key="child.path">
        <el-menu-item 
          :index="child.path"
          @click="handleLink(child.path)"
        >
          {{ child.meta?.title }}
        </el-menu-item>
      </template>
    </el-sub-menu>
  </template>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLink = (path) => {
  // 确保使用完整路径
  if (!path.startsWith('/')) {
    path = '/' + path
  }
  router.push(path)
}

defineProps({
  item: {
    type: Object,
    required: true
  }
})
</script> 