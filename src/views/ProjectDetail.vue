<template lang="pug">
.h-full.flex.flex-col.gap-6
  //- Project Header & Tabs
  .glass-card.rounded-2xl.p-6.flex.flex-col.gap-6.flex-shrink-0(v-if="activeProject")
    .flex.justify-between.items-start
      .flex.flex-col.gap-2
        .flex.items-center.gap-3
          h2.text-3xl.text-header {{ activeProject.name }}
          span.px-3.py-1.rounded.text-metadata.bg-redAccent_20.text-redAccent(class="bg-redAccent/20") {{ activeProject.status }}
        p.text-white_60(class="text-white/60") {{ activeProject.description }}
      
      //- Mode Selector
      .flex.bg-white_5.p-1.rounded-xl(class="bg-white/5")
        button.px-6.py-2.rounded-lg.text-sm.font-bold.transition-colors(
          v-for="mode in modes" 
          :key="mode.id"
          @click="currentMode = mode.id"
          :class="currentMode === mode.id ? 'bg-redAccent text-white' : 'text-white/50 hover:text-white'"
        ) {{ mode.label }}

  //- Dynamic Sub-mode Content
  .flex-1.min-h-0.overflow-hidden(v-if="activeProject")
    
    //- Overview Mode
    .h-full.flex.flex-col.gap-6.overflow-y-auto(v-if="currentMode === 'overview'")
      .grid.grid-cols-2.gap-6
        .glass-panel.rounded-xl.p-6
          h3.text-xl.text-header.mb-4 STRATEGIC OBJECTIVES
          p.text-white_80(class="text-white/80") {{ activeProject.description }}
          .mt-6
            span.text-metadata PROGRESS
            .w-full.bg-white_5.h-2.rounded-full.mt-2(class="bg-white/5")
              .bg-redAccent.h-full.rounded-full.transition-all.duration-1000(:style="{ width: progress + '%' }")
        
        .glass-panel.rounded-xl.p-6
          h3.text-xl.text-header.mb-4 AUTOMATED LOGS
          .flex.flex-col.gap-3
            .flex.gap-3(v-for="log in activeProject.logs" :key="log.time")
              span.text-metadata.text-redAccent {{ log.time }}
              span.text-sm.text-white_80(class="text-white/80") {{ log.msg }}

    //- Kanban Board Mode
    .h-full.flex.gap-6.overflow-x-auto.pb-4(v-else-if="currentMode === 'board'")
      .flex-1.flex.flex-col.gap-4(v-for="status in boardStatuses" :key="status" class="min-w-[300px]")
        .flex.items-center.justify-between
          span.text-metadata {{ status }}
          span.w-6.h-6.rounded-full.bg-white_10.flex.items-center.justify-center.text-xs(class="bg-white/10") {{ tasksByStatus[status].length }}
        
        .flex.flex-col.gap-3.overflow-y-auto.flex-1.pr-2
          TransitionGroup(name="list")
            .glass-panel.rounded-xl.p-4.cursor-pointer.hover_border-redAccent.transition-colors(
              v-for="task in tasksByStatus[status]" 
              :key="task.wbsId"
              @click="rotateTaskStatus(task)"
              class="hover:border-redAccent"
            )
              .text-metadata.mb-1 ID: {{ task.wbsId }}
              h4.font-bold.mb-2 {{ task.title }}
              .flex.justify-between.items-end
                .flex.flex-col.gap-1
                  span.text-metadata ASSIGNEE
                  span.text-sm {{ getOperativeName(task.assignee) }}
                span.text-xs.bg-white_10.px-2.py-1.rounded(class="bg-white/10") {{ task.duration }}d

    //- Functional List Mode
    .h-full.glass-panel.rounded-xl.overflow-hidden.flex.flex-col(v-else-if="currentMode === 'list'")
      .flex.justify-between.p-4.border-b.border-white_5(class="border-white/5")
        h3.text-xl.text-header WORK BREAKDOWN STRUCTURE
        .flex.gap-2
          button.bg-white_5.text-white.px-4.py-2.rounded.text-sm.font-bold.hover_bg-white_10(class="bg-white/5 hover:bg-white/10" @click="addTask") + NEW TASK
          button.bg-redAccent.text-white.px-4.py-2.rounded.text-sm.font-bold(@click="onUpdateTasks") REFRESH DEPENDENCIES
      .flex-1.overflow-auto
        table.w-full.text-left.border-collapse.whitespace-nowrap
          thead(class="bg-[#d9ead3] text-black")
            tr
              th.p-2.text-xs.font-bold Task ID
              th.p-2.text-xs.font-bold Task Name
              th.p-2.text-xs.font-bold Duration (Days)
              th.p-2.text-xs.font-bold Predecessor ID
              th.p-2.text-xs.font-bold Dependency Type
              th.p-2.text-xs.font-bold Lag/Lead
              th.p-2.text-xs.font-bold Start Day
              th.p-2.text-xs.font-bold End Day
              th.p-2.text-xs.font-bold Float
              th.p-2.text-xs.font-bold Critical Path
              th.p-2.text-xs.font-bold Progress
              th.p-2.text-xs.font-bold Resource
              th.p-2.text-xs.font-bold Actions
          tbody
            tr.border-t.border-white_5(v-for="task in projectTasks" :key="task.wbsId" class="border-white/5 hover:bg-white/[0.02]" :class="{'bg-[#eef2ff] text-black hover:bg-[#eef2ff] font-bold': task.isParent}")
              td.p-2
                input.bg-transparent.border-none.outline-none.w-12(v-model="task.wbsId" @change="onUpdateTasks" :class="{'text-black': task.isParent, 'text-white': !task.isParent}")
              td.p-2
                .flex.items-center
                  span(v-if="!task.isParent").mr-2.text-white_40 ↳
                  input.bg-transparent.border-none.outline-none.w-48(v-model="task.title" @change="onUpdateTasks" :class="{'text-black': task.isParent, 'text-white': !task.isParent}")
              td.p-2
                input.bg-transparent.border-none.outline-none.w-16(v-if="!task.isParent" v-model.number="task.duration" type="number" @change="onUpdateTasks" class="text-white")
                span(v-else) {{ task.duration }}
              td.p-2
                input.bg-transparent.border-none.outline-none.w-16(v-if="!task.isParent" v-model="task.predecessorId" @change="onUpdateTasks" class="text-white")
              td.p-2
                select.bg-transparent.border-none.outline-none.w-16(v-if="!task.isParent" v-model="task.dependencyType" @change="onUpdateTasks" class="text-white")
                  option.text-obsidian(value="") None
                  option.text-obsidian(value="FS") FS
                  option.text-obsidian(value="SS") SS
                  option.text-obsidian(value="FF") FF
                  option.text-obsidian(value="SF") SF
              td.p-2
                input.bg-transparent.border-none.outline-none.w-16(v-if="!task.isParent" v-model.number="task.lag" type="number" @change="onUpdateTasks" class="text-white")
              td.p-2 {{ task.startDay }}
              td.p-2 {{ task.endDay }}
              td.p-2(v-if="!task.isParent") {{ task.float }}
              td.p-2(v-else)
              td.p-2(v-if="!task.isParent" :class="task.isCritical ? 'text-redAccent font-bold' : ''") {{ task.isCritical ? 'Yes' : 'No' }}
              td.p-2(v-else)
              td.p-2
                input.bg-transparent.border-none.outline-none.w-16(v-if="!task.isParent" v-model.number="task.progress" type="number" class="text-white" @change="onUpdateTasks")
                span(v-else) {{ task.progress }}%
              td.p-2
                select.bg-transparent.border-none.outline-none(v-if="!task.isParent" v-model="task.assignee" class="text-white")
                  option.text-obsidian(value="") Unassigned
                  option.text-obsidian(v-for="op in appState.operatives" :key="op.id" :value="op.id") {{ op.name }}
              td.p-2
                button.text-redAccent.opacity-50.hover_opacity-100(@click="deleteTask(task.wbsId)" class="hover:opacity-100" title="Delete Task") ✕

    //- Timeline (Gantt) Mode
    .h-full.glass-panel.rounded-xl.overflow-hidden.flex.flex-col.p-4(v-else-if="currentMode === 'timeline'")
      .flex.justify-between.mb-4
        .flex.bg-white_5.p-1.rounded-lg(class="bg-white/5")
          button.px-4.py-1.rounded.text-xs.font-bold(
            :class="!exportingPdf ? 'bg-redAccent text-white hover:bg-red-700 transition-colors' : 'bg-white/20 text-white cursor-not-allowed'"
            @click="exportPdf"
            :disabled="exportingPdf"
          ) {{ exportingPdf ? 'GENERATING PDF...' : 'EXPORT PDF' }}
        .flex.bg-white_5.p-1.rounded-lg(class="bg-white/5")
          button.px-3.py-1.rounded.text-xs.font-bold(
            :class="ganttScale === 'day' ? 'bg-redAccent text-white' : 'text-white/50'"
            @click="ganttScale = 'day'"
          ) Relative Day
          button.px-3.py-1.rounded.text-xs.font-bold(
            :class="ganttScale === 'date' ? 'bg-redAccent text-white' : 'text-white/50'"
            @click="ganttScale = 'date'"
          ) Calendar Date

      .flex-1.overflow-auto.relative.bg-obsidian#gantt-export-container
        table.w-full.border-collapse.table-fixed.bg-obsidian(class="min-w-[1200px]")
          thead
            tr
              th.w-64.p-2.text-left.text-metadata.text-white Task
              th.p-2.text-center.text-xs.font-bold.border-l.border-white_5(v-for="d in 30" :key="d" class="border-white/5 w-12 bg-[#cfe2f3] text-black")
                template(v-if="ganttScale === 'day'") D{{ d }}
                template(v-else) {{ formatShortDateFromDay(d) }}
          tbody
            //- Task Duration Layer
            tr(v-for="task in projectTasks" :key="'gantt-'+task.wbsId" class="border-t border-white/5 hover:bg-white/[0.02]")
              td.p-2.truncate.text-sm(:class="{'font-bold text-white': task.isParent, 'text-white/80': !task.isParent}")
                span(v-if="!task.isParent").mr-2.text-white_40 ↳
                | {{ task.wbsId }} - {{ task.title }}
              td.p-0.relative.border-l.border-white_5(v-for="d in 30" :key="d" class="border-white/5")
                .absolute.inset-y-2.inset-x-0.rounded-sm(
                  v-if="d >= task.startDay && d <= task.endDay" 
                  :class="getGanttBarColor(task)"
                  style="-webkit-print-color-adjust: exact; print-color-adjust: exact;"
                )
            
            //- Spacer
            tr
              td.p-4(colspan="100%")

            //- Resource Saturation Heatmap Layer
            tr
              th.p-2.text-left.text-metadata.text-redAccent(colspan="100%") RESOURCE SATURATION HEATMAP
            tr(v-for="op in appState.operatives" :key="'heat-'+op.id" class="border-t border-white/5 text-white")
              td.p-2.text-sm {{ op.name }}
              td.p-2.border-l.border-white_5(v-for="d in 30" :key="d" class="border-white/5 text-center relative")
                .absolute.inset-0.opacity-50(:style="{ backgroundColor: getHeatmapColor(heatmapData.heatmap[op.id]?.[getDateStr(d)]?.saturation || 0) }")
                span.relative.z-10.text-xs.font-bold(:class="{'text-black': getHeatmapColor(heatmapData.heatmap[op.id]?.[getDateStr(d)]?.saturation || 0) !== 'transparent'}") 
                  | {{ Math.round((heatmapData.heatmap[op.id]?.[getDateStr(d)]?.saturation || 0) * 100) }}%

</template>

<script setup>
import { ref, computed } from 'vue';
import { appState, getProjectProgress, getResourceHeatmap, calculateSchedule } from '../store/appState';
import { format, addDays, parseISO } from 'date-fns';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const modes = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'board', label: 'KANBAN' },
  { id: 'list', label: 'LIST' },
  { id: 'timeline', label: 'TIMELINE' }
];

const currentMode = ref('overview');
const ganttScale = ref('day'); // 'day' or 'date'
const exportingPdf = ref(false);

const activeProject = computed(() => {
  return appState.projects.find(p => p.id === appState.activeProjectId);
});

const projectTasks = computed(() => appState.tasks.filter(t => t.projectId === appState.activeProjectId));

const progress = computed(() => {
  if (!activeProject.value) return 0;
  return getProjectProgress(activeProject.value.id);
});

const boardStatuses = ['To Do', 'In Progress', 'In Review', 'Completed'];

// Only show subtasks on Kanban
const tasksByStatus = computed(() => {
  const result = {};
  boardStatuses.forEach(s => result[s] = []);
  projectTasks.value.filter(t => !t.isParent).forEach(t => {
    if (result[t.status]) result[t.status].push(t);
  });
  return result;
});

const getOperativeName = (id) => {
  const op = appState.operatives.find(o => o.id === id);
  return op ? op.name : 'Unknown';
};

const rotateTaskStatus = (task) => {
  const currentIndex = boardStatuses.indexOf(task.status);
  const nextIndex = (currentIndex + 1) % boardStatuses.length;
  task.status = boardStatuses[nextIndex];
  if (task.status === 'Completed') task.progress = 100;
  calculateSchedule();
};

const onUpdateTasks = () => {
  calculateSchedule();
};

const addTask = () => {
  appState.tasks.push({
    wbsId: `${Date.now()}`,
    projectId: appState.activeProjectId,
    title: 'New Task',
    status: 'To Do',
    assignee: '',
    duration: 1,
    predecessorId: '',
    dependencyType: '',
    lag: 0,
    startDay: 1,
    endDay: 1,
    isParent: false,
    progress: 0
  });
  calculateSchedule();
};

const deleteTask = (wbsId) => {
  if (confirm(`Are you sure you want to delete task ${wbsId}?`)) {
    appState.tasks = appState.tasks.filter(t => !(t.projectId === appState.activeProjectId && t.wbsId === wbsId));
    calculateSchedule();
  }
};

const heatmapData = computed(() => {
  if (!activeProject.value) return { dates: [], heatmap: {} };
  return getResourceHeatmap(activeProject.value.startDate, 30); // 30 days window for Gantt
});

const getDateStr = (dayNum) => {
  if (!activeProject.value) return '';
  return format(addDays(parseISO(activeProject.value.startDate), dayNum - 1), 'yyyy-MM-dd');
};

const formatShortDateFromDay = (dayNum) => {
  if (!activeProject.value) return '';
  const d = addDays(parseISO(activeProject.value.startDate), dayNum - 1);
  return format(d, 'MMM d');
};

const getGanttBarColor = (task) => {
  if (task.isParent) return 'bg-[#000000] border border-white/20'; // Main Task / Summary Bar
  if (task.isCritical) return 'bg-[#FF6347]'; // Critical Path Subtasks
  return 'bg-[#20B2AA]'; // Standard Subtasks
};

const getHeatmapColor = (saturation) => {
  if (saturation === 0) return 'transparent';
  if (saturation <= 0.5) return 'rgba(183,225,205,0.8)'; // Greenish from script
  if (saturation <= 1) return 'rgba(252,232,178,0.8)'; // Yellowish from script
  return 'rgba(244,199,195,1)'; // Redish for Over Capacity
};

const exportPdf = async () => {
  if (!activeProject.value) return;
  exportingPdf.value = true;
  
  try {
    const element = document.getElementById('gantt-export-container');
    
    // Temporarily remove overflow to capture full width
    const originalOverflow = element.style.overflow;
    element.style.overflow = 'visible';
    
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution
      backgroundColor: '#0B0B0D', // Obsidian base
      logging: false,
      useCORS: true
    });
    
    element.style.overflow = originalOverflow;
    
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    
    // Calculate PDF dimensions to fit the image
    const pdf = new jsPDF('l', 'pt', [canvas.width, canvas.height]);
    pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
    
    const filename = `Panopticon_${activeProject.value.name}_Timeline.pdf`.replace(/\s+/g, '_');
    pdf.save(filename);
  } catch (err) {
    console.error("PDF Export failed", err);
    alert("Failed to export PDF. Check console for details.");
  } finally {
    exportingPdf.value = false;
  }
};
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
