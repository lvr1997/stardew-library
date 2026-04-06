declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 全局组件类型声明
declare module '@/components/common/CheckBox.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{
    modelValue?: boolean
  }, {
    'update:modelValue': (value: boolean) => void
    change: (value: boolean) => void
  }, any>
  export default component
}