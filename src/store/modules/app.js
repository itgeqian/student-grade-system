import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    sidebar: {
      opened: true
    },
    theme: {
      primaryColor: '#409EFF',
      menuBg: '#304156',
      menuText: '#bfcbd9',
      menuActiveText: '#409EFF'
    },
    settings: {
      showBreadcrumb: true,
      showTags: true,
      fixedHeader: true
    }
  }),

  persist: {
    key: 'app-state',
    storage: localStorage,
    paths: ['sidebar', 'theme', 'settings']
  }
}) 