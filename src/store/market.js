import { defineStore } from 'pinia'

export const useMarketStore = defineStore('market', () => {
  // 所有的周期数据（默认顺序）
  const periodList = ref([
    { name: '分时', key: 'min' },
    { name: '日K', key: 'day' },
    { name: '周K', key: 'week' },
    { name: '月K', key: 'month' },
    { name: '五日', key: 'fiveDay' },
    { name: '120分', key: '120m' },
    { name: '60分', key: '60m' },
    { name: '30分', key: '30m' },
    { name: '15分', key: '15m' },
    { name: '5分', key: '5m' },
    { name: '1分', key: '1m' },
    { name: '年K', key: 'year' },
    { name: '季K', key: 'season' }
  ])

  // 更新列表（用于拖拽排序后保存）
  const updatePeriodList = (newList) => {
    periodList.value = newList
  }

  return { periodList, updatePeriodList }
})