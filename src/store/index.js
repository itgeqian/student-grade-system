import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export { useUserStore } from './modules/user'
export { useAppStore } from './modules/app'
export { useDataStore } from './modules/data'
export { useSystemStore } from './modules/system'
export default pinia 