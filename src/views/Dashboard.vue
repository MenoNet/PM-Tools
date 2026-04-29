<template lang="pug">
.h-full.w-full.flex.flex-col.gap-6.overflow-y-auto.pr-2.pb-10
  //- Page Title (Dashboard)
  .flex.flex-col.gap-1
    h2.text-2xl.text-header DASHBOARD
    .w-12.h-1.bg-redAccent.rounded-full

  //- Dashboard Controls
  .flex.justify-between.items-end.border-b.border-white_5.pb-6(class="border-white/5")
    .flex.items-center.gap-6
      .flex.flex-col.gap-1
        label.text-metadata(class="text-[9px] tracking-widest") DATA SOURCE CONTEXT
        select.bg-white_5.border.border-white_10.rounded.px-4.py-2.text-sm.outline-none.text-white.cursor-pointer.hover_border-redAccent(
          v-model="appState.dashboardContext"
          class="bg-white/5 border-white/10 min-w-[240px]"
        )
          option(value="GLOBAL") Global Portfolio (Full View)
          option(v-for="p in appState.projects" :key="p.id" :value="p.id") {{ p.name }}
      
      .flex.flex-col.gap-1
        label.text-metadata(class="text-[9px] tracking-widest") ACTIVE SCOPE
        .flex.items-center.gap-2.px-4.py-2.rounded.bg-white_5.border.border-white_10(class="bg-white/5 border-white/10")
          span.w-2.h-2.rounded-full.bg-redAccent.animate-pulse
          span.text-xs.font-bold.text-white {{ appState.dashboardContext === 'GLOBAL' ? 'GLOBAL OVERVIEW' : getProjectName(appState.dashboardContext).toUpperCase() }}

    .flex.gap-3
      button.bg-white_5.px-6.py-2.rounded-lg.text-xs.font-bold.transition-all(
        class="bg-white/5 hover:bg-white/10"
        @click="isCustomizing = !isCustomizing"
        :class="isCustomizing ? 'border border-redAccent text-redAccent shadow-[0_0_15px_rgba(224,30,46,0.2)]' : 'text-white'"
      ) {{ isCustomizing ? 'SAVE LAYOUT' : 'CUSTOMIZE DASHBOARD' }}
      
      button.bg-redAccent.px-6.py-2.rounded-lg.text-xs.font-bold.text-white.shadow-lg(
        v-if="isCustomizing"
        @click="showAddModal = true"
        style="box-shadow: 0 0 15px rgba(224,30,46,0.3);"
      ) + ADD WIDGET

  //- Dynamic Widget Grid
  draggable.grid.grid-cols-3.gap-6(
    v-model="appState.dashboardLayout"
    item-key="id"
    :disabled="!isCustomizing"
    ghost-class="opacity-50"
    class="min-h-[500px] mt-2"
  )
    template(#item="{ element }")
      .relative.group(:class="element.w === 3 ? 'col-span-3' : 'col-span-1'")
        button.absolute.-top-2.-right-2.z-10.w-6.h-6.bg-redAccent.rounded-full.flex.items-center.justify-center.shadow-lg.transition-all(
          v-if="isCustomizing"
          @click="removeWidget(element.id)"
        ) ✕
        
        .glass-card.rounded-2xl.p-6.h-full.flex.flex-col.gap-6(
          :class="isCustomizing ? 'border-dashed border-white/20 cursor-move' : ''"
        )
          //- 1. METRICS GRID
          template(v-if="element.id === 'metric-grid'")
            .grid.grid-cols-5.gap-6
              .flex.flex-col.gap-4(v-for="m in metricList" :key="m.label")
                .flex.justify-between.items-center
                  span.text-metadata {{ m.label }}
                  component(:is="m.icon" :class="m.color" :size="16")
                .text-4xl.text-header(:class="m.color") {{ m.value }}{{ m.suffix }}
                .w-full.bg-white_5.h-1.rounded-full(class="bg-white/5")
                  .h-full.rounded-full(:class="m.barColor" :style="{ width: m.percent + '%' }")

          //- 2. UPCOMING DEADLINES
          template(v-else-if="element.id === 'deadlines'")
            h2.text-xl.text-header UPCOMING DEADLINES
            .flex.flex-col.gap-3
              .glass-panel.rounded-xl.p-3.flex.items-center.gap-4(v-for="task in upcomingDeadlines" :key="task.wbsId")
                .w-1.h-10.bg-redAccent.rounded-full
                .flex-1.min-w-0
                  p.font-bold.text-sm.truncate {{ task.title }}
                  p.text-metadata(v-if="appState.dashboardContext === 'GLOBAL'") {{ getProjectName(task.projectId) }}
                  p.text-metadata DUE D+{{ task.endDay }}
                span.text-xs.bg-white_10.px-2.py-1.rounded(class="bg-white/10") {{ task.wbsId }}

          //- 3. ROADMAP SNIPPET
          template(v-else-if="element.id === 'roadmap'")
            h2.text-xl.text-header ROADMAP SNIPPET
            .flex.flex-col.gap-4
              .flex.flex-col.gap-2(v-for="proj in filteredProjects" :key="proj.id")
                .flex.justify-between.text-metadata
                  span {{ proj.name }}
                  span {{ getProjectProgress(proj.id) }}%
                .w-full.bg-white_5.h-2.rounded-full.overflow-hidden(class="bg-white/5")
                  .bg-redAccent.h-full.rounded-full(:style="{ width: getProjectProgress(proj.id) + '%' }")

          //- 4. ACTIVE BLOCKERS
          template(v-else-if="element.id === 'blockers'")
            .flex.justify-between.items-center
              h2.text-xl.text-header ACTIVE BLOCKERS
              span.text-xs.bg-redAccent.text-white.px-2.rounded {{ activeBlockers.length }}
            .flex.flex-col.gap-3
              .p-3.bg-redAccent_10.border.border-redAccent_20.rounded-xl(v-for="task in activeBlockers" :key="task.wbsId" class="bg-redAccent/10 border-redAccent/20")
                .flex.justify-between.items-start
                  span.font-bold.text-sm {{ task.title }}
                  AlertTriangleIcon.text-redAccent(:size="14")
                p.text-metadata.mt-1(v-if="appState.dashboardContext === 'GLOBAL'") {{ getProjectName(task.projectId) }}
                p.text-metadata.mt-1 STATUS: {{ task.status.toUpperCase() }}

          //- 5. TOP RED FLAGS
          template(v-else-if="element.id === 'red-flags'")
            h2.text-xl.text-header TOP RED FLAGS
            .flex.flex-col.gap-3
              .glass-panel.rounded-xl.p-3.flex.justify-between.items-center(v-for="issue in topIssues" :key="issue.id")
                .flex.flex-col
                  span.font-bold.text-sm {{ issue.title }}
                  span.text-metadata(class="text-[8px]") {{ issue.priority.toUpperCase() }} | {{ getProjectName(issue.projectId) }}
                span.text-redAccent.font-black !

          //- 6. RESOURCE CAPACITY
          template(v-else-if="element.id === 'team-load'")
            h2.text-xl.text-header RESOURCE CAPACITY
            .flex.flex-col.gap-4
              .flex.items-center.gap-4(v-for="op in appState.operatives" :key="op.id")
                .w-8.h-8.rounded-full.bg-white_10.flex.items-center.justify-center.text-xs.font-bold(class="bg-white/10") {{ op.name[0] }}
                .flex-1.flex.flex-col.gap-1
                  .flex.justify-between.text-metadata
                    span {{ op.name }}
                    span(:class="getResourceLoadClass(op.id)") {{ getResourceLoad(op.id) }}%
                  .w-full.bg-white_5.h-1.rounded-full(class="bg-white/5")
                    .h-full.rounded-full(:style="{ width: Math.min(100, getResourceLoad(op.id)) + '%' }" :class="getResourceBarClass(op.id)")

          //- 7. RECENT ACTIVITY
          template(v-else-if="element.id === 'activity'")
            .flex.justify-between.items-center
              h2.text-xl.text-header RECENT ACTIVITY
              span.text-metadata LIVE
            .flex.flex-col.gap-3.max-h-64.overflow-y-auto.pr-2
              .flex.gap-3(v-for="log in allLogs" :key="log.time + log.msg")
                .w-1.h-6.bg-white_10.rounded-full(class="bg-white/10")
                .flex.flex-col
                  span.text-sm.text-white_80(class="text-white/80") {{ log.msg }}
                  span.text-metadata(class="text-[8px]") {{ log.time }}

          //- 8. STATUS CHART
          template(v-else-if="element.id === 'status-chart'")
            h2.text-xl.text-header TASK DISTRIBUTION
            .flex-1.flex.items-center.justify-center(class="min-h-[200px]")
              Doughnut(:data="statusChartData" :options="chartOptions")

          //- 9. CRITICAL CHART
          template(v-else-if="element.id === 'critical-chart'")
            h2.text-xl.text-header CRITICAL PATH
            .flex-1.flex.items-center.justify-center(class="min-h-[200px]")
              Doughnut(:data="criticalChartData" :options="chartOptions")

  //- Add Widget Modal
  .fixed.inset-0.z-50.flex.items-center.justify-center.bg-black_80.backdrop-blur-sm(v-if="showAddModal" class="bg-black/80")
    .glass-card.rounded-2xl.p-8.w-96.flex.flex-col.gap-6.border.border-white_10(class="border-white/10")
      h2.text-2xl.text-header ADD WIDGET
      .flex.flex-col.gap-3.max-h-96.overflow-y-auto
        button.glass-panel.p-4.rounded-xl.text-left.hover_border-redAccent.transition-all(
          v-for="w in availableWidgets"
          :key="w.id"
          @click="addWidget(w)"
          class="hover:border-redAccent group"
        )
          p.font-bold.group-hover_text-redAccent {{ w.title }}
          p.text-metadata(class="text-[8px]") {{ w.type.toUpperCase() }}
      button.w-full.py-2.text-metadata.hover_text-white(@click="showAddModal = false") CANCEL

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
  { label: 'ACTIVE INITIATIVES', value: metrics.value.activeProjects, suffix: '', icon: ActivityIcon, color: 'text-redAccent', barColor: 'bg-redAccent', percent: 100 },
  { label: 'TOTAL TASKS', value: metrics.value.totalTasks, suffix: '', icon: ListIcon, color: 'text-white/40', barColor: 'bg-white/20', percent: 100 },
  { label: 'TASKS COMPLETED', value: metrics.value.completedTasks, suffix: '', icon: CheckCircleIcon, color: 'text-green-500', barColor: 'bg-green-500', percent: (metrics.value.totalTasks > 0 ? (metrics.value.completedTasks / metrics.value.totalTasks * 100) : 0) },
  { label: 'SYSTEM LOAD', value: metrics.value.systemLoad, suffix: '%', icon: CpuIcon, color: 'text-redAccent', barColor: 'bg-redAccent', percent: metrics.value.systemLoad },
  { label: 'OPEN ISSUES', value: metrics.value.openIssues, suffix: '', icon: AlertCircleIcon, color: 'text-redAccent', barColor: 'bg-redAccent', percent: (metrics.value.openIssues > 0 ? 100 : 0) },
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
  if (load > 90) return 'text-redAccent';
  if (load > 70) return 'text-yellow-500';
  return 'text-green-500';
};

const getResourceBarClass = (opId) => {
  const load = getResourceLoad(opId);
  if (load > 90) return 'bg-redAccent';
  if (load > 70) return 'bg-yellow-500';
  return 'bg-green-500';
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: { color: "rgba(255, 255, 255, 0.6)", font: { size: 9 }, padding: 10 },
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
      backgroundColor: ["rgba(255, 255, 255, 0.1)", "rgba(224, 30, 46, 0.6)", "rgba(34, 197, 94, 0.6)"],
      borderColor: "rgba(11, 11, 13, 1)",
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
      backgroundColor: ["rgba(224, 30, 46, 0.8)", "rgba(32, 178, 170, 0.6)"],
      borderColor: "rgba(11, 11, 13, 1)",
      borderWidth: 2,
    }],
  };
});
</script>
