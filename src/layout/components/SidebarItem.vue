<template>
  <template v-if="!item.hidden">
    <el-sub-menu 
      v-if="item.children && item.children.length && item.meta" 
      :index="item.path"
    >
      <template #title>
        <el-icon v-if="item.meta?.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <span>{{ item.meta?.title }}</span>
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :item="child"
      />
    </el-sub-menu>

    <el-menu-item 
      v-else-if="item.meta" 
      :index="item.path" 
      @click="handleLink(item)"
    >
      <el-icon v-if="item.meta?.icon">
        <component :is="item.meta.icon" />
      </el-icon>
      <template #title>{{ item.meta?.title }}</template>
    </el-menu-item>
  </template>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const handleLink = (item) => {
  router.push(item.path)
}
</script> 