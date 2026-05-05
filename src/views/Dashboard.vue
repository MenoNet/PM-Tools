<template lang="pug">
.h-full.w-full.flex.flex-col.gap-6.overflow-y-auto.pr-2.pb-10
  //- Page Title (Dashboard)
  .flex.justify-between.items-end
    .flex.flex-col.gap-1
      h2.text-2xl.font-bold.tracking-tight DASHBOARD
      p.text-appTextMuted.text-xs Overview of all active initiatives and system health.
    
    .flex.gap-3
      button.px-4.py-2.rounded-xl.text-sm.font-semibold.transition-all.border.border-appBorder(
        @click="isCustomizing = !isCustomizing"
        :class="isCustomizing ? 'bg-purple-brand text-white' : 'bg-appBgSoft text-appText hover:bg-appBg'"
      ) {{ isCustomizing ? 'Save Layout' : 'Customize' }}
      
      button.btn-primary.text-sm(
        v-if="isCustomizing"
        @click="showAddModal = true"
      ) + Add Widget

  //- Dashboard Controls
  .flex.items-center.gap-6.p-4.bg-appBgSoft.rounded-2xl.border.border-appBorder
    .flex.flex-col.gap-1
      label(class="text-[10px]").font-bold.text-appTextMuted.uppercase.tracking-widest Data Source
      select.bg-appBg.border.border-appBorder.rounded-lg.px-3.py-1.text-xs.outline-none.cursor-pointer.hover_border-purple-brand.transition-all(
        v-model="appState.dashboardContext"
        class="min-w-[200px]"
      )
        option(value="GLOBAL") Global Portfolio
        option(v-for="p in appState.projects" :key="p.id" :value="p.id") {{ p.name }}
    
    .flex.flex-col.gap-1
      label(class="text-[10px]").font-bold.text-appTextMuted.uppercase.tracking-widest Status
      .flex.items-center.gap-2.px-3.py-1.rounded-lg.bg-appBg.border.border-appBorder
        .w-2.h-2.rounded-full.bg-purple-brand.animate-pulse
        span(class="text-[10px]").font-bold {{ appState.dashboardContext === 'GLOBAL' ? 'LIVE OVERVIEW' : 'PROJECT SCOPE' }}

  //- Dynamic Widget Grid
  draggable.grid.grid-cols-3.gap-6(
    v-model="appState.dashboardLayout"
    item-key="id"
    :disabled="!isCustomizing"
    ghost-class="opacity-50"
    class="min-h-[500px]"
  )
    template(#item="{ element }")
      .relative.group(:class="element.w === 3 ? 'col-span-3' : 'col-span-1'")
        button.absolute.-top-2.-right-2.z-10.w-6.h-6.bg-raspberry.rounded-full.flex.items-center.justify-center.text-white.shadow-lg(
          v-if="isCustomizing"
          @click="removeWidget(element.id)"
        ) ✕
        
        .bg-appBgSoft.rounded-3xl.p-6.h-full.flex.flex-col.gap-6.border.border-appBorder.shadow-sm(
          :class="isCustomizing ? 'border-dashed border-purple-brand/50 cursor-move' : ''"
        )
          //- 1. METRICS GRID
          template(v-if="element.id === 'metric-grid'")
            .grid.grid-cols-5.gap-6
              .flex.flex-col.gap-3(v-for="m in metricList" :key="m.label")
                .flex.justify-between.items-center
                  span(class="text-[10px]").font-bold.text-appTextMuted.uppercase {{ m.label }}
                  component(:is="m.icon" :class="m.color" :size="14")
                .text-3xl.font-bold(:class="m.color") {{ m.value }}{{ m.suffix }}
                .w-full.bg-appBg.h-1.rounded-full
                  .h-full.rounded-full(:class="m.barColor" :style="{ width: m.percent + '%' }")

          //- 2. UPCOMING DEADLINES
          template(v-else-if="element.id === 'deadlines'")
            h2.text-sm.font-bold.text-appText UPCOMING DEADLINES
            .flex.flex-col.gap-2
              .p-3.rounded-2xl.bg-appBg.border.border-appBorder.flex.items-center.gap-3(v-for="task in upcomingDeadlines" :key="task.wbsId")
                .w-1.h-8.rounded-full(:class="task.isCritical ? 'bg-raspberry' : 'bg-purple-brand'")
                .flex-1.min-w-0
                  p.font-bold.text-xs.truncate {{ task.title }}
                  p(class="text-[10px]").text-appTextMuted DUE D+{{ task.endDay }}
                span(class="text-[10px]").font-mono.bg-appBgSoft.px-2.py-1.rounded-lg.border.border-appBorder {{ task.wbsId }}

          //- 3. ROADMAP SNIPPET
          template(v-else-if="element.id === 'roadmap'")
            h2.text-sm.font-bold.text-appText ROADMAP SNIPPET
            .flex.flex-col.gap-4
              .flex.flex-col.gap-2(v-for="proj in filteredProjects" :key="proj.id")
                .flex.justify-between.items-center
                  span.text-xs.font-semibold {{ proj.name }}
                  span(class="text-[10px]").font-bold.text-purple-brand {{ getProjectProgress(proj.id) }}%
                .w-full.bg-appBg.h-2.rounded-full.overflow-hidden
                  .bg-purple-brand.h-full.rounded-full(:style="{ width: getProjectProgress(proj.id) + '%' }")

          //- 4. ACTIVE BLOCKERS
          template(v-else-if="element.id === 'blockers'")
            .flex.justify-between.items-center
              h2.text-sm.font-bold.text-appText ACTIVE BLOCKERS
              span(class="text-[10px] py-0.5").bg-raspberry.text-white.px-2.rounded-lg {{ activeBlockers.length }}
            .flex.flex-col.gap-2
              .p-3.rounded-2xl(class="bg-raspberry/5 border border-raspberry/10" v-for="task in activeBlockers" :key="task.wbsId")
                .flex.justify-between.items-start
                  span.font-bold.text-xs.text-raspberry {{ task.title }}
                  AlertTriangleIcon.text-raspberry(:size="14")
                p(class="text-[10px]").text-appTextMuted.mt-1 {{ task.status.toUpperCase() }}

          //- 5. TOP RED FLAGS
          template(v-else-if="element.id === 'red-flags'")
            h2.text-sm.font-bold.text-appText TOP RED FLAGS
            .flex.flex-col.gap-2
              .p-3.rounded-2xl.bg-appBg.border.border-appBorder.flex.justify-between.items-center(v-for="issue in topIssues" :key="issue.id")
                .flex.flex-col
                  span.font-bold.text-xs {{ issue.title }}
                  span(class="text-[10px]").text-appTextMuted {{ issue.priority.toUpperCase() }}
                span.text-raspberry.font-bold !

          //- 6. RESOURCE CAPACITY
          template(v-else-if="element.id === 'team-load'")
            h2.text-sm.font-bold.text-appText RESOURCE CAPACITY
            .flex.flex-col.gap-4
              .flex.items-center.gap-3(v-for="op in appState.operatives" :key="op.id")
                .w-8.h-8.rounded-full.flex.items-center.justify-center.text-xs.font-bold(class="bg-purple-brand/10 text-purple-brand") {{ op.name[0] }}
                .flex-1.flex.flex-col.gap-1
                  .flex.justify-between.items-center
                    span.text-xs.font-medium {{ op.name }}
                    span(class="text-[10px]").font-bold(:class="getResourceLoadClass(op.id)") {{ getResourceLoad(op.id) }}%
                  .w-full.bg-appBg.h-1.rounded-full
                    .h-full.rounded-full(:style="{ width: Math.min(100, getResourceLoad(op.id)) + '%' }" :class="getResourceBarClass(op.id)")

          //- 7. RECENT ACTIVITY
          template(v-else-if="element.id === 'activity'")
            .flex.justify-between.items-center
              h2.text-sm.font-bold.text-appText RECENT ACTIVITY
              span(class="text-[10px]").text-purple-brand.font-bold LIVE
            .flex.flex-col.gap-3.max-h-64.overflow-y-auto.pr-2
              .flex.gap-3(v-for="log in allLogs" :key="log.time + log.msg")
                .w-1.h-6.rounded-full(class="bg-purple-brand/20")
                .flex.flex-col
                  span.text-xs.text-appText {{ log.msg }}
                  span(class="text-[9px]").text-appTextMuted {{ log.time }}

          //- 8. STATUS CHART
          template(v-else-if="element.id === 'status-chart'")
            h2.text-sm.font-bold.text-appText TASK DISTRIBUTION
            .flex-1.flex.items-center.justify-center(class="min-h-[200px]")
              Doughnut(:data="statusChartData" :options="chartOptions")

          //- 9. CRITICAL CHART
          template(v-else-if="element.id === 'critical-chart'")
            h2.text-sm.font-bold.text-appText CRITICAL PATH
            .flex-1.flex.items-center.justify-center(class="min-h-[200px]")
              Doughnut(:data="criticalChartData" :options="chartOptions")

  //- Add Widget Modal
  .fixed.inset-0.z-50.flex.items-center.justify-center.backdrop-blur-sm(class="bg-midnight/80" v-if="showAddModal")
    .bg-appBgSoft.rounded-3xl.p-8.w-96.flex.flex-col.gap-6.border.border-appBorder.shadow-2xl
      h2.text-xl.font-bold ADD WIDGET
      .flex.flex-col.gap-2.max-h-96.overflow-y-auto
        button.p-4.rounded-2xl.bg-appBg.border.border-appBorder.text-left.hover_border-purple-brand.transition-all(
          v-for="w in availableWidgets"
          :key="w.id"
          @click="addWidget(w)"
          class="group"
        )
          p.font-bold.text-xs.group-hover_text-purple-brand {{ w.title }}
          p(class="text-[10px]").text-appTextMuted {{ w.type.toUpperCase() }}
      button.w-full.py-2.text-xs.font-bold.text-appTextMuted.hover_text-appText(@click="showAddModal = false") CANCEL

</template>

<script setup>
import { ref, computed } from "vue";
import draggable from "vuedraggable";
import { 
  Activity as ActivityIcon, 
  List as ListIcon, 
  CheckCircle as CheckCircleIcon, 
  Cpu as CpuIcon, 
  AlertCircle as AlertCircleIcon,
  AlertTriangle as AlertTriangleIcon,
  Clock as ClockIcon
} from "lucide-vue-next";
import { appState, metrics, getProjectProgress } from "../store/appState";
import { Doughnut } from "vue-chartjs";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from "chart.js";

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

defineEmits(["open-project"]);

const isCustomizing = ref(false);
const showAddModal = ref(false);

const availableWidgets = [
  { id: "metric-grid", type: "metrics", title: "Vital Signs", w: 3 },
  { id: "deadlines", type: "list", title: "Upcoming Deadlines", w: 1 },
  { id: "roadmap", type: "list", title: "Roadmap Snippet", w: 1 },
  { id: "blockers", type: "list", title: "Active Blockers", w: 1 },
  { id: "red-flags", type: "list", title: "Top Red Flags", w: 1 },
  { id: "team-load", type: "list", title: "Resource Capacity", w: 1 },
  { id: "activity", type: "list", title: "Recent Activity", w: 1 },
  { id: "status-chart", type: "chart", title: "Task Status Dist.", w: 1 },
  { id: "critical-chart", type: "chart", title: "Critical Path Analysis", w: 1 },
];

const addWidget = (w) => {
  if (!appState.dashboardLayout.find(item => item.id === w.id)) {
    appState.dashboardLayout.push(w);
  }
  showAddModal.value = false;
};

const removeWidget = (id) => {
  appState.dashboardLayout = appState.dashboardLayout.filter(w => w.id !== id);
};

const getProjectName = (id) => appState.projects.find(p => p.id === id)?.name || "Unknown";

const filteredProjects = computed(() => {
  if (appState.dashboardContext === "GLOBAL") return appState.projects;
  return appState.projects.filter(p => p.id === appState.dashboardContext);
});

const filteredTasks = computed(() => {
  if (appState.dashboardContext === "GLOBAL") return appState.tasks;
  return appState.tasks.filter(t => t.projectId === appState.dashboardContext);
});

const metricList = computed(() => [
  { label: 'ACTIVE INITIATIVES', value: metrics.value.activeProjects, suffix: '', icon: ActivityIcon, color: 'text-purple-brand', barColor: 'bg-purple-brand', percent: 100 },
  { label: 'TOTAL TASKS', value: metrics.value.totalTasks, suffix: '', icon: ListIcon, color: 'text-appTextMuted', barColor: 'bg-purple-brand/10', percent: 100 },
  { label: 'TASKS COMPLETED', value: metrics.value.completedTasks, suffix: '', icon: CheckCircleIcon, color: 'text-green-500', barColor: 'bg-green-500', percent: (metrics.value.totalTasks > 0 ? (metrics.value.completedTasks / metrics.value.totalTasks * 100) : 0) },
  { label: 'SYSTEM LOAD', value: metrics.value.systemLoad, suffix: '%', icon: CpuIcon, color: 'text-raspberry', barColor: 'bg-raspberry', percent: metrics.value.systemLoad },
  { label: 'OPEN ISSUES', value: metrics.value.openIssues, suffix: '', icon: AlertCircleIcon, color: 'text-raspberry', barColor: 'bg-raspberry', percent: (metrics.value.openIssues > 0 ? 100 : 0) },
]);

const allLogs = computed(() => {
  return filteredProjects.value.flatMap((p) => p.logs).sort((a, b) => b.time.localeCompare(a.time));
});

const upcomingDeadlines = computed(() => {
  return filteredTasks.value
    .filter(t => !t.isParent && t.status !== 'Completed')
    .sort((a, b) => a.endDay - b.endDay)
    .slice(0, 4);
});

const activeBlockers = computed(() => {
  return filteredTasks.value.filter(t => t.status === 'Blocked');
});

const topIssues = computed(() => {
  return filteredProjects.value
    .flatMap(p => p.issues.map(i => ({...i, projectId: p.id})))
    .filter(i => i.status !== 'Resolved')
    .sort((a, b) => {
      const p = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      return p[b.priority] - p[a.priority];
    })
    .slice(0, 3);
});

const getResourceLoad = (opId) => {
  const opTasks = appState.tasks.filter(t => !t.isParent && t.status !== 'Completed' && t.assignees.includes(opId));
  const totalLoad = opTasks.reduce((sum, t) => sum + t.duration, 0);
  const capacity = 20; 
  return Math.round((totalLoad / capacity) * 100);
};

const getResourceLoadClass = (opId) => {
  const load = getResourceLoad(opId);
  if (load > 90) return 'text-raspberry';
  if (load > 70) return 'text-tuscany';
  return 'text-green-500';
};

const getResourceBarClass = (opId) => {
  const load = getResourceLoad(opId);
  if (load > 90) return 'bg-raspberry';
  if (load > 70) return 'bg-tuscany';
  return 'bg-green-500';
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: { 
        color: appState.theme === 'dark' ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)", 
        font: { size: 9, family: 'Poppins' }, 
        padding: 10 
      },
    },
  },
};

const statusChartData = computed(() => {
  const tasks = filteredTasks.value.filter((t) => !t.isParent);
  const statusCounts = { "To Do": 0, "In Progress": 0, Completed: 0 };
  tasks.forEach((t) => {
    if (statusCounts[t.status] !== undefined) statusCounts[t.status]++;
    else if (t.status === "In Review" || t.status === "Blocked") statusCounts["In Progress"]++;
  });
  return {
    labels: ["To Do", "In Progress", "Completed"],
    datasets: [{
      data: [statusCounts["To Do"], statusCounts["In Progress"], statusCounts["Completed"]],
      backgroundColor: ["#E5E7EB", "#7F24DD", "#22C55E"],
      borderColor: appState.theme === 'dark' ? "#191819" : "#FFFFFF",
      borderWidth: 2,
    }],
  };
});

const criticalChartData = computed(() => {
  const tasks = filteredTasks.value.filter((t) => !t.isParent);
  const critical = tasks.filter((t) => t.isCritical).length;
  const standard = tasks.length - critical;
  return {
    labels: ["Critical Path", "Standard"],
    datasets: [{
      data: [critical, standard],
      backgroundColor: ["#FB006D", "#7F24DD"],
      borderColor: appState.theme === 'dark' ? "#191819" : "#FFFFFF",
      borderWidth: 2,
    }],
  };
});
</script>
