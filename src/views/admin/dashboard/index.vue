<template>
  <div class="admin-dashboard">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card__icon users">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="stat-card__content">
          <span class="stat-card__value">{{ stats.userCount }}</span>
          <span class="stat-card__label">用户总数</span>
        </div>
        <div class="stat-card__trend" :class="stats.newSignCount >= 0 ? 'up' : 'down'">
          {{ stats.newSignCount >= 0 ? '↑' : '↓' }} {{ Math.abs(stats.newSignCount) }} 今日新增
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-card__icon articles">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <div class="stat-card__content">
          <span class="stat-card__value">{{ stats.articleCount }}</span>
          <span class="stat-card__label">文章总数</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-card__icon comments">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="stat-card__content">
          <span class="stat-card__value">{{ stats.commentCount }}</span>
          <span class="stat-card__label">评论总数</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-card__icon views">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </div>
        <div class="stat-card__content">
          <span class="stat-card__value">{{ stats.flowCount }}</span>
          <span class="stat-card__label">总浏览量</span>
        </div>
        <div class="stat-card__trend up">
          ↑ {{ stats.newLoginCount }} 今日登录
        </div>
      </div>
    </div>
    
    <div class="charts-grid">
      <div class="chart-card">
        <div class="chart-header">
          <h3>数据趋势</h3>
          <div class="chart-tabs">
            <button 
              v-for="t in growthTypes" 
              :key="t.value"
              class="tab-btn" 
              :class="{ active: activeType === t.value }"
              @click="changeType(t.value)"
            >
              {{ t.label }}
            </button>
          </div>
        </div>
        <div class="chart-body">
          <Line v-if="growthChartData" :data="growthChartData" :options="lineChartOptions" />
        </div>
        <div class="chart-footer">
          <span class="growth-rate" :class="growthData.growthRate >= 0 ? 'up' : 'down'">
            {{ growthData.growthRate >= 0 ? '↑' : '↓' }} {{ Math.abs(growthData.growthRate) }}%
          </span>
          <span class="growth-num">较上周{{ growthData.growthNum >= 0 ? '增长' : '减少' }} {{ Math.abs(growthData.growthNum) }}</span>
        </div>
      </div>
      
      <div class="chart-card">
        <div class="chart-header">
          <h3>年度文章统计</h3>
        </div>
        <div class="chart-body">
          <Bar v-if="yearChartData" :data="yearChartData" :options="barChartOptions" />
        </div>
      </div>
      
      <div class="chart-card system-resource">
        <div class="chart-header">
          <h3>系统资源</h3>
        </div>
        <div class="chart-body resource-grid">
          <div class="resource-ring">
            <Doughnut v-if="cpuChartData" :data="cpuChartData" :options="ringChartOptions" />
            <div class="ring-center">{{ systemResource.cpuPercent.toFixed(0) }}%</div>
            <div class="ring-label">CPU</div>
          </div>
          <div class="resource-ring">
            <Doughnut v-if="memChartData" :data="memChartData" :options="ringChartOptions" />
            <div class="ring-center">{{ systemResource.memPercent }}%</div>
            <div class="ring-label">内存</div>
          </div>
          <div class="resource-ring">
            <Doughnut v-if="diskChartData" :data="diskChartData" :options="ringChartOptions" />
            <div class="ring-center">{{ systemResource.diskPercent.toFixed(0) }}%</div>
            <div class="ring-label">磁盘</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Line, Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import type { DataSum, DataGrowth, SystemResource } from '@/types'
import { getDataSum, getArticleDataByYear, getGrowthData, getSystemResource } from '@/api/modules/logs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const growthTypes = [
  { label: '流量', value: 1 },
  { label: '文章', value: 2 },
  { label: '用户', value: 3 }
]

const stats = ref<DataSum>({
  flowCount: 0,
  userCount: 0,
  articleCount: 0,
  messageCount: 0,
  commentCount: 0,
  newLoginCount: 0,
  newSignCount: 0
})

const growthData = ref<DataGrowth>({
  growthRate: 0,
  growthNum: 0,
  dateList: [],
  countList: []
})

const yearData = ref<DataGrowth>({
  growthRate: 0,
  growthNum: 0,
  dateList: [],
  countList: []
})

const systemResource = ref<SystemResource>({
  cpuPercent: 0,
  memPercent: 0,
  diskPercent: 0
})

const activeType = ref(1)

const growthChartData = computed(() => {
  if (!growthData.value.dateList.length) return null
  return {
    labels: growthData.value.dateList,
    datasets: [
      {
        label: growthTypes.find(t => t.value === activeType.value)?.label || '数量',
        data: growthData.value.countList,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  }
})

const yearChartData = computed(() => {
  if (!yearData.value.dateList.length) return null
  return {
    labels: yearData.value.dateList,
    datasets: [
      {
        label: '文章数量',
        data: yearData.value.countList,
        backgroundColor: '#10b981',
        borderRadius: 6
      }
    ]
  }
})

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#f1f5f9'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
}

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#f1f5f9'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
}

const ringChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      enabled: false
    }
  }
}

const cpuChartData = computed(() => ({
  labels: ['已使用', '空闲'],
  datasets: [{
    data: [systemResource.value.cpuPercent, 100 - systemResource.value.cpuPercent],
    backgroundColor: [getResourceColor(systemResource.value.cpuPercent), '#e2e8f0'],
    borderWidth: 0
  }]
}))

const memChartData = computed(() => ({
  labels: ['已使用', '空闲'],
  datasets: [{
    data: [systemResource.value.memPercent, 100 - systemResource.value.memPercent],
    backgroundColor: [getResourceColor(systemResource.value.memPercent), '#e2e8f0'],
    borderWidth: 0
  }]
}))

const diskChartData = computed(() => ({
  labels: ['已使用', '空闲'],
  datasets: [{
    data: [systemResource.value.diskPercent, 100 - systemResource.value.diskPercent],
    backgroundColor: [getResourceColor(systemResource.value.diskPercent), '#e2e8f0'],
    borderWidth: 0
  }]
}))

function getResourceColor(value: number) {
  if (value < 50) return '#10b981'
  if (value < 80) return '#f59e0b'
  return '#ef4444'
}

async function fetchStats() {
  try {
    const res = await getDataSum()
    stats.value = res.data
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
}

async function fetchGrowthData(type: 1 | 2 | 3) {
  try {
    const res = await getGrowthData(type)
    growthData.value = res.data
  } catch (error) {
    console.error('Failed to fetch growth data:', error)
  }
}

async function fetchYearData() {
  try {
    const res = await getArticleDataByYear()
    yearData.value = res.data
  } catch (error) {
    console.error('Failed to fetch year data:', error)
  }
}

async function fetchSystemResource() {
  try {
    const res = await getSystemResource()
    systemResource.value = res.data
  } catch (error) {
    console.error('Failed to fetch system resource:', error)
  }
}

function changeType(type: number) {
  activeType.value = type
  fetchGrowthData(type as 1 | 2 | 3)
}

onMounted(() => {
  fetchStats()
  fetchGrowthData(1)
  fetchYearData()
  fetchSystemResource()
})
</script>

<style scoped lang="scss">
.admin-dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  &__icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    
    &.users {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }
    
    &.articles {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
    
    &.comments {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }
    
    &.views {
      background: rgba(139, 92, 246, 0.1);
      color: #8b5cf6;
    }
  }
  
  &__content {
    display: flex;
    flex-direction: column;
  }
  
  &__value {
    font-size: 28px;
    font-weight: 700;
    color: #1e293b;
  }
  
  &__label {
    font-size: 14px;
    color: #64748b;
    margin-top: 4px;
  }
  
  &__trend {
    font-size: 12px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f1f5f9;
    
    &.up {
      color: #10b981;
    }
    
    &.down {
      color: #ef4444;
    }
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.chart-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  &.system-resource {
    grid-column: span 2;
  }
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
  }
}

.chart-tabs {
  display: flex;
  gap: 8px;
}

.tab-btn {
  padding: 6px 12px;
  font-size: 13px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #e2e8f0;
  }
  
  &.active {
    background: #3b82f6;
    color: #fff;
  }
}

.chart-body {
  height: 280px;
}

.chart-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.growth-rate {
  font-size: 18px;
  font-weight: 600;
  
  &.up {
    color: #10b981;
  }
  
  &.down {
    color: #ef4444;
  }
}

.growth-num {
  font-size: 13px;
  color: #64748b;
}

.resource-grid {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: auto;
  padding: 20px 0;
}

.resource-ring {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.ring-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.ring-label {
  margin-top: 8px;
  font-size: 14px;
  color: #64748b;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-card.system-resource {
    grid-column: span 1;
  }
  
  .resource-grid {
    flex-direction: column;
    gap: 24px;
  }
}
</style>
