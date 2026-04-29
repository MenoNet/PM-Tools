<template lang="pug">
.h-full.w-full.flex.flex-col.gap-6.overflow-y-auto.pr-2
  .grid.grid-cols-4.gap-6
    //- Metrics Cards
    .glass-card.rounded-2xl.p-6.flex.flex-col.gap-4
      .flex.justify-between.items-center
        span.text-metadata ACTIVE INITIATIVES
        ActivityIcon.text-redAccent(:size="16")
      .text-5xl.text-header {{ metrics.activeProjects }}
      .w-full.bg-white_5.h-1.rounded-full.mt-auto(class="bg-white/5")
        .bg-redAccent.h-full.rounded-full(:style="{ width: '100%' }")
        
    .glass-card.rounded-2xl.p-6.flex.flex-col.gap-4
      .flex.justify-between.items-center
        span.text-metadata TOTAL TASKS
        ListIcon.text-white_40(:size="16" class="text-white/40")
      .text-5xl.text-header {{ metrics.totalTasks }}
      .w-full.bg-white_5.h-1.rounded-full.mt-auto(class="bg-white/5")
        .bg-white_20.h-full.rounded-full(class="bg-white/20" :style="{ width: '100%' }")

    .glass-card.rounded-2xl.p-6.flex.flex-col.gap-4
      .flex.justify-between.items-center
        span.text-metadata TASKS COMPLETED
        CheckCircleIcon.text-green-500(:size="16")
      .text-5xl.text-header {{ metrics.completedTasks }}
      .w-full.bg-white_5.h-1.rounded-full.mt-auto(class="bg-white/5")
        .bg-green-500.h-full.rounded-full(:style="{ width: (metrics.totalTasks > 0 ? (metrics.completedTasks / metrics.totalTasks * 100) : 0) + '%' }")

    .glass-card.rounded-2xl.p-6.flex.flex-col.gap-4.border-redAccent_20(class="border-redAccent/20")
      .flex.justify-between.items-center
        span.text-metadata SYSTEM LOAD
        CpuIcon.text-redAccent(:size="16")
      .text-5xl.text-header.text-redAccent {{ metrics.systemLoad }}%
      .w-full.bg-white_5.h-1.rounded-full.mt-auto(class="bg-white/5")
        .bg-redAccent.h-full.rounded-full(:style="{ width: metrics.systemLoad + '%' }")

  .grid.grid-cols-3.gap-6
    //- Charts Section
    .glass-card.rounded-2xl.p-6.flex.flex-col.gap-6
      h2.text-xl.text-header TASK STATUS DISTRIBUTION
      .flex-1.flex.items-center.justify-center(class="min-h-[200px]")
        Doughnut(:data="statusChartData" :options="chartOptions")
    
    .glass-card.rounded-2xl.p-6.flex.flex-col.gap-6
      h2.text-xl.text-header CRITICAL PATH ANALYSIS
      .flex-1.flex.items-center.justify-center(class="min-h-[200px]")
        Doughnut(:data="criticalChartData" :options="chartOptions")

    //- Global Activity Feed
    .glass-card.rounded-2xl.p-6.flex.flex-col.gap-6
      .flex.justify-between.items-center
        h2.text-xl.text-header GLOBAL FEED
        span.text-metadata LIVE LOGS
        
      .flex-1.overflow-y-auto.flex.flex-col.gap-4.pr-2(class="max-h-[240px]")
        .flex.gap-3(v-for="log in allLogs" :key="log.time + log.msg")
          .w-1.h-full.bg-white_10.rounded-full(class="bg-white/10" :class="{'bg-redAccent': log.msg.includes('Anomalous')}")
          .flex.flex-col
            span.text-metadata.text-redAccent {{ log.time }}
            span.text-sm.text-white_80(class="text-white/80") {{ log.msg }}

  .grid.grid-cols-1.gap-6.flex-1.min-h-0
    //- Operational Maturity (Projects List)
    .glass-card.rounded-2xl.p-6.flex.flex-col.gap-6
      .flex.justify-between.items-center
        h2.text-xl.text-header OPERATIONAL MATURITY
        span.text-metadata PROJECT STATUS
      
      .flex.flex-col.gap-4
        .glass-panel.rounded-xl.p-5.flex.items-center.gap-6.hover_bg-white_5.transition-colors(
          v-for="project in appState.projects" 
          :key="project.id"
          class="hover:bg-white/5"
        )
          //- Progress Ring (simplified with SVG)
          .relative.w-16.h-16.flex.items-center.justify-center.flex-shrink-0
            svg.w-full.h-full.-rotate-90(viewBox="0 0 36 36")
              path.text-white_10(class="text-white/10" stroke-width="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831")
              path.text-redAccent.transition-all.duration-1000(stroke-dasharray="100, 100" :stroke-dashoffset="100 - getProjectProgress(project.id)" stroke-width="3" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831")
            span.absolute.text-xs.font-bold {{ getProjectProgress(project.id) }}%

          .flex-1.min-w-0
            .flex.items-center.justify-between.mb-1
              h3.text-lg.font-bold.truncate {{ project.name }}
              span.px-2.py-1.rounded.text-metadata.bg-white_10(class="bg-white/10") {{ project.status }}
            p.text-sm.text-white_60.truncate(class="text-white/60") {{ project.description }}
          
          button.w-10.h-10.rounded-full.bg-white_5.flex.items-center.justify-center.hover_bg-redAccent.transition-colors(
            class="bg-white/5 hover:bg-redAccent"
            @click="$emit('open-project', project.id)"
          )
            ArrowRightIcon(:size="16")

</template>

<script setup>
import { computed } from 'vue';
import { Activity as ActivityIcon, List as ListIcon, CheckCircle as CheckCircleIcon, Cpu as CpuIcon, ArrowRight as ArrowRightIcon } from 'lucide-vue-next';
import { appState, metrics, getProjectProgress } from '../store/appState';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

defineEmits(['open-project']);

const allLogs = computed(() => {
  return appState.projects.flatMap(p => p.logs).sort((a, b) => b.time.localeCompare(a.time));
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: 'rgba(255, 255, 255, 0.6)',
        font: { size: 10 },
        padding: 20
      }
    }
  }
};

const statusChartData = computed(() => {
  const tasks = appState.tasks.filter(t => !t.isParent);
  const statusCounts = { 'To Do': 0, 'In Progress': 0, 'Completed': 0 };
  tasks.forEach(t => {
    if (statusCounts[t.status] !== undefined) statusCounts[t.status]++;
    else if (t.status === 'In Review') statusCounts['In Progress']++;
  });

  return {
    labels: ['To Do', 'In Progress', 'Completed'],
    datasets: [{
      data: [statusCounts['To Do'], statusCounts['In Progress'], statusCounts['Completed']],
      backgroundColor: ['rgba(255, 255, 255, 0.1)', 'rgba(224, 30, 46, 0.6)', 'rgba(34, 197, 94, 0.6)'],
      borderColor: 'rgba(11, 11, 13, 1)',
      borderWidth: 2
    }]
  };
});

const criticalChartData = computed(() => {
  const tasks = appState.tasks.filter(t => !t.isParent);
  const critical = tasks.filter(t => t.isCritical).length;
  const standard = tasks.length - critical;

  return {
    labels: ['Critical Path', 'Standard'],
    datasets: [{
      data: [critical, standard],
      backgroundColor: ['rgba(224, 30, 46, 0.8)', 'rgba(32, 178, 170, 0.6)'],
      borderColor: 'rgba(11, 11, 13, 1)',
      borderWidth: 2
    }]
  };
});
</script>
