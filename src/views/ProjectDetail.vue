<template lang="pug">
.h-full.flex.flex-col.gap-6
  //- Project Header & Tabs
  .glass-card.rounded-2xl.p-6.flex.flex-col.gap-6.flex-shrink-0(v-if="activeProject")
    .flex.justify-between.items-start
      .flex.flex-col.gap-2
        .flex.items-center.gap-3
          h2.text-header.text-3xl {{ activeProject.name }}
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
        .glass-panel.rounded-xl.p-6.flex.flex-col.gap-4
          h3.text-xl.text-header STRATEGIC OBJECTIVES
          p.text-white_80(class="text-white/80") {{ activeProject.description }}
          .mt-2
            span.text-metadata PROGRESS
            .w-full.bg-white_5.h-2.rounded-full.mt-2(class="bg-white/5")
              .bg-redAccent.h-full.rounded-full.transition-all.duration-1000(:style="{ width: progress + '%' }")
          
          .mt-6.grid.grid-cols-2.gap-4
            .p-3.bg-white_5.rounded-lg(class="bg-white/5")
              span.text-metadata START DATE
              p.font-bold {{ activeProject.startDate }}
            .p-3.bg-white_5.rounded-lg(class="bg-white/5")
              span.text-metadata TARGET END
              p.font-bold {{ activeProject.endDate }}

        .glass-panel.rounded-xl.p-6.flex.flex-col.gap-4
          h3.text-xl.text-header KEY RISKS & ISSUES
          .flex.flex-col.gap-3
            .p-3.bg-redAccent_5.border.border-redAccent_20.rounded-lg(v-for="issue in activeProject.issues" :key="issue.id" class="bg-redAccent/5 border-redAccent/20")
              .flex.justify-between.items-start
                span.font-bold.text-sm {{ issue.title }}
                span.bg-redAccent.text-white.px-2.py-0_5.rounded(class="text-[10px]") {{ issue.priority }}
              p.text-xs.text-white_60.mt-1(class="text-white/60") Status: {{ issue.status }}

      .glass-panel.rounded-xl.p-6
        h3.text-xl.text-header SYSTEM LOGS
        .mt-4.flex.flex-col.gap-3
          .flex.gap-3(v-for="log in activeProject.logs" :key="log.time")
            span.text-metadata.text-redAccent {{ log.time }}
            span.text-sm.text-white_80(class="text-white/80") {{ log.msg }}

    //- Kanban Board Mode
    .h-full.flex.gap-6.overflow-x-auto.pb-4(v-else-if="currentMode === 'board'")
      .flex-1.flex.flex-col.gap-4(v-for="status in boardStatuses" :key="status" class="min-w-[320px]")
        .flex.items-center.justify-between.px-2
          span.text-metadata {{ status }}
          span.w-6.h-6.rounded-full.bg-white_10.flex.items-center.justify-center.text-xs(class="bg-white/10") {{ getTasksByStatus(status).length }}
        
        draggable.flex-1.flex.flex-col.gap-3.overflow-y-auto.pr-2(
          :list="getTasksByStatus(status)"
          group="tasks"
          item-key="wbsId"
          @change="(evt) => onDragChange(evt, status)"
          class="min-h-[200px]"
        )
          template(#item="{element}")
            .glass-panel.rounded-xl.p-4.cursor-grab.active_cursor-grabbing.hover_border-redAccent.transition-colors(class="hover:border-redAccent")
              .flex.justify-between.items-start.mb-2
                span.text-metadata ID: {{ element.wbsId }}
                span.bg-white_10.rounded(v-if="element.isCritical" class="text-[10px] bg-redAccent text-white") CRITICAL
              h4.font-bold.mb-2 {{ element.title }}
              .flex.justify-between.items-end
                .flex.flex-col.gap-1
                  span.text-metadata ASSIGNEES
                  .flex.flex-wrap.gap-1.mt-1
                    span.bg-white_5.px-1.rounded(v-for="opId in element.assignees" :key="opId" class="text-[10px] bg-white/5") {{ getOperativeName(opId) }}
                span.text-xs.bg-white_10.px-2.py-1.rounded(class="bg-white/10") {{ element.duration }}d

    //- Functional List Mode (Sorted)
    .h-full.glass-panel.rounded-xl.overflow-hidden.flex.flex-col(v-else-if="currentMode === 'list'")
      .flex.justify-between.p-4.border-b.border-white_5(class="border-white/5")
        h3.text-xl.text-header WORK BREAKDOWN STRUCTURE
        .flex.gap-2
          button.bg-white_5.text-white.px-4.py-2.rounded.text-sm.font-bold.hover_bg-white_10.transition-colors(class="bg-white/5 hover:bg-white/10" @click="addParentTask") + PARENT
          button.bg-white_5.text-white.px-4.py-2.rounded.text-sm.font-bold.hover_bg-white_10.transition-colors(class="bg-white/5 hover:bg-white/10" @click="addSubtask") + SUBTASK
          button.bg-redAccent.text-white.px-4.py-2.rounded.text-sm.font-bold(@click="onUpdateTasks") REFRESH
      .flex-1.overflow-auto
        table.w-full.text-left.border-collapse.whitespace-nowrap
          thead(class="bg-[#d9ead3] text-black")
            tr
              th.p-2.text-xs.font-bold Task ID
              th.p-2.text-xs.font-bold Task Name
              th.p-2.text-xs.font-bold Duration
              th.p-2.text-xs.font-bold Pred IDs
              th.p-2.text-xs.font-bold Type
              th.p-2.text-xs.font-bold Lag
              th.p-2.text-xs.font-bold Start
              th.p-2.text-xs.font-bold End
              th.p-2.text-xs.font-bold Critical
              th.p-2.text-xs.font-bold %
              th.p-2.text-xs.font-bold Resources
              th.p-2.text-xs.font-bold Actions
          tbody
            tr.border-t.border-white_5(v-for="task in projectTasksSorted" :key="task.wbsId" class="border-white/5 hover:bg-white/[0.02] group" :class="{'bg-[#eef2ff] text-black hover:bg-[#eef2ff] font-bold': task.isParent}")
              td.p-2
                input.bg-transparent.outline-none.w-12.px-1.rounded(v-model="task.wbsId" @change="onUpdateTasks" :class="{'text-black': task.isParent}")
              td.p-2
                .flex.items-center
                  span(v-if="!task.isParent").mr-2.text-white_40 ↳
                  input.bg-transparent.outline-none.w-48.px-1.rounded(v-model="task.title" @change="onUpdateTasks" :class="{'text-black': task.isParent}")
              td.p-2
                input.bg-transparent.outline-none.w-12(v-if="!task.isParent" v-model.number="task.duration" type="number" @change="onUpdateTasks")
                span.px-1(v-else) {{ task.duration }}
              td.p-2
                input.bg-transparent.outline-none.w-24.px-1.border.border-white_10.rounded(v-if="!task.isParent" :value="task.predecessorIds.join(', ')" @input="e => updatePredecessors(task, e.target.value)" class="border-white/10")
              td.p-2
                select.bg-transparent.outline-none.w-12(v-if="!task.isParent" v-model="task.dependencyType" @change="onUpdateTasks")
                  option(value="") -
                  option(value="FS") FS
                  option(value="SS") SS
                  option(value="FF") FF
                  option(value="SF") SF
              td.p-2
                input.bg-transparent.outline-none.w-10(v-if="!task.isParent" v-model.number="task.lag" type="number" @change="onUpdateTasks")
              td.p-2.text-xs {{ task.startDay }}
              td.p-2.text-xs {{ task.endDay }}
              td.p-2.text-xs(v-if="!task.isParent" :class="task.isCritical ? 'text-redAccent font-bold' : ''") {{ task.isCritical ? 'Y' : 'N' }}
              td.p-2(v-else)
              td.p-2
                input.bg-transparent.outline-none.w-10(v-if="!task.isParent" v-model.number="task.progress" type="number" @change="onUpdateTasks")
                span.px-1(v-else) {{ task.progress }}%
              td.p-2
                .flex.flex-col.gap-1(v-if="!task.isParent")
                  .flex.items-center.gap-2(v-for="op in appState.operatives" :key="op.id")
                    input(type="checkbox" :value="op.id" :checked="task.assignees.includes(op.id)" @change="toggleAssignee(task, op.id)")
                    .flex.flex-col
                      span(class="text-[10px] font-bold") {{ op.name }}
                      span(class="text-[8px] opacity-60") {{ op.role }}
              td.p-2
                button.text-redAccent.opacity-50.hover_opacity-100(@click="deleteTask(task.wbsId)") ✕

    //- Timeline Mode
    .h-full.glass-panel.rounded-xl.overflow-hidden.flex.flex-col.p-4(v-else-if="currentMode === 'timeline'")
      .flex.justify-between.mb-4
        .flex.items-center.gap-4
          button.px-4.py-1.rounded.text-xs.font-bold.bg-redAccent.text-white(@click="exportPdf") EXPORT PDF
          .flex.items-center.gap-2
            span.text-metadata RANGE:
            input.bg-white_5.border.border-white_10.rounded.px-2.py-0_5.text-xs.w-16(type="number" v-model.number="ganttDays" class="bg-white/5 border-white/10")
        .flex.bg-white_5.p-1.rounded-lg(class="bg-white/5")
          button.px-3.py-1.rounded.text-xs.font-bold(:class="ganttScale === 'day' ? 'bg-redAccent text-white' : 'text-metadata'" @click="ganttScale = 'day'") Day
          button.px-3.py-1.rounded.text-xs.font-bold(:class="ganttScale === 'date' ? 'bg-redAccent text-white' : 'text-metadata'" @click="ganttScale = 'date'") Date

      .flex-1.overflow-auto.relative.bg-obsidian#gantt-export-container
        table.w-full.border-collapse.table-fixed.bg-obsidian(class="min-w-[1200px]")
          thead: tr
            th.w-64.p-2.text-left.text-metadata Task
            th.p-2.text-center.text-xs.font-bold.border-l.border-white_5(v-for="d in ganttDays" :key="d" class="border-white/5 w-12 bg-[#cfe2f3] text-black")
              | {{ ganttScale === 'day' ? 'D' + d : formatShortDateFromDay(d) }}
          tbody
            tr(v-for="task in projectTasksSorted" :key="'gantt-'+task.wbsId" class="border-t border-white/5")
              td.p-2.truncate.text-sm(:class="{'font-bold text-white': task.isParent}")
                span(v-if="!task.isParent").mr-2.text-white_40 ↳
                | {{ task.wbsId }} - {{ task.title }}
              td.p-0.relative.border-l.border-white_5(v-for="d in ganttDays" :key="d" class="border-white/5")
                .absolute.inset-y-2.inset-x-0.rounded-sm(v-if="d >= task.startDay && d <= task.endDay" :class="getGanttBarColor(task)")

    //- Heatmap Mode
    .h-full.glass-panel.rounded-xl.overflow-hidden.flex.flex-col(v-else-if="currentMode === 'heatmap'")
      .p-4.border-b.border-white_5.flex.justify-between.items-center(class="border-white/5")
        .flex.items-center.gap-6
          h3.text-xl.text-header PROJECT RESOURCE LOAD
          .flex.items-center.gap-2
            span.text-metadata RANGE:
            input.bg-white_5.border.border-white_10.rounded.px-2.py-0_5.text-xs.w-16(type="number" v-model.number="heatmapDays" class="bg-white/5 border-white/10")
          .flex.bg-white_5.p-1.rounded-lg(class="bg-white/5")
            button.px-3.py-1.rounded.text-xs.font-bold(:class="viewMode === 'hours' ? 'bg-redAccent text-white' : 'text-metadata'" @click="viewMode = 'hours'") HOURS
            button.px-3.py-1.rounded.text-xs.font-bold(:class="viewMode === 'percent' ? 'bg-redAccent text-white' : 'text-metadata'" @click="viewMode = 'percent'") %
      .flex-1.overflow-auto.p-4
        table.w-full.border-collapse.text-left
          thead: tr
            th.p-2.border-b.border-white_10.text-metadata(class="border-white/10") OPERATIVE
            th.p-2.border-b.border-white_10.text-metadata.text-center(v-for="d in heatmapData.dates" :key="d" class="border-white/10") {{ formatShortDate(d) }}
          tbody
            tr.border-b.border-white_5(v-for="op in assignedOperatives" :key="op.id" class="border-white/5 hover:bg-white/[0.02]")
              td.p-2.font-bold.text-sm {{ op.name }}
              td.p-0.relative(v-for="d in heatmapData.dates" :key="d" class="border-l border-white/5")
                .absolute.inset-0.opacity-70(:style="{ backgroundColor: getHeatmapColor(heatmapData.heatmap[op.id][d]?.saturation || 0) }")
                .flex.items-center.justify-center.h-full.relative.z-10.py-2
                  span.text-xs.font-bold(:class="getSaturationTextColor(heatmapData.heatmap[op.id][d]?.saturation || 0)")
                    | {{ viewMode === 'hours' ? Math.round(heatmapData.heatmap[op.id][d]?.hoursAssigned || 0) + 'h' : Math.round((heatmapData.heatmap[op.id][d]?.saturation || 0) * 100) + '%' }}

    //- Integrated Issues Mode
    .h-full.glass-panel.rounded-xl.overflow-hidden.flex.flex-col(v-else-if="currentMode === 'issues'")
      .p-6.border-b.border-white_5.flex.justify-between.items-end(class="border-white/5")
        .flex.flex-col.gap-2
          h3.text-xl.text-header PROJECT ISSUES & RISKS
          p.text-metadata TRACKING IMPEDIMENTS FOR {{ activeProject.name.toUpperCase() }}
        .flex.gap-3.items-end
          .flex.flex-col.gap-1
            label.text-metadata(class="text-[10px]") TITLE
            input.bg-white_5.border.border-white_10.rounded.px-3.py-2.text-xs.outline-none(v-model="newIssue.title" placeholder="Description" class="bg-white/5 border-white/10 focus:border-redAccent w-48")
          .flex.flex-col.gap-1
            label.text-metadata(class="text-[10px]") PRIORITY
            select.bg-white_5.border.border-white_10.rounded.px-3.py-2.text-xs.outline-none(v-model="newIssue.priority" class="bg-white/5 border-white/10 focus:border-redAccent")
              option Low
              option Medium
              option High
              option Critical
          button.bg-redAccent.text-white.px-4.py-2.rounded.font-bold.text-xs(@click="addIssue") LOG ISSUE

      .flex-1.overflow-auto.p-6
        table.w-full.border-collapse.text-left
          thead: tr
            th.p-3.border-b.border-white_10.text-metadata ID
            th.p-3.border-b.border-white_10.text-metadata TITLE
            th.p-3.border-b.border-white_10.text-metadata PRIORITY
            th.p-3.border-b.border-white_10.text-metadata STATUS
            th.p-3.border-b.border-white_10.text-metadata ACTIONS
          tbody
            tr.border-b.border-white_5(v-for="issue in activeProject.issues" :key="issue.id" class="border-white/5 hover:bg-white/[0.02]")
              td.p-3.text-xs.font-mono {{ issue.id }}
              td.p-3.font-bold.text-sm {{ issue.title }}
              td.p-3: span.px-2.py-1.rounded.font-bold.text-white(class="text-[10px]" :class="getPriorityClass(issue.priority)") {{ issue.priority }}
              td.p-3
                select.bg-transparent.outline-none.text-sm(v-model="issue.status")
                  option Open
                  option In Progress
                  option Resolved
                  option Blocked
              td.p-3: button.text-redAccent.opacity-50.hover_opacity-100(@click="deleteIssue(issue.id)") ✕
</template>

<script setup>
import { ref, computed, reactive } from "vue";
import draggable from "vuedraggable";
import { appState, getProjectProgress, calculateSchedule, getResourceHeatmap } from "../store/appState";
import { format, addDays, parseISO } from "date-fns";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const modes = [
  { id: "overview", label: "OVERVIEW" },
  { id: "board", label: "KANBAN" },
  { id: "list", label: "LIST" },
  { id: "timeline", label: "TIMELINE" },
  { id: "heatmap", label: "HEATMAP" },
  { id: "issues", label: "ISSUES" },
];

const currentMode = ref("overview");
const ganttScale = ref("day");
const ganttDays = ref(30);
const heatmapDays = ref(14);
const viewMode = ref("hours");
const newIssue = reactive({ title: "", priority: "Medium" });

const activeProject = computed(() => appState.projects.find((p) => p.id === appState.activeProjectId));
const projectTasks = computed(() => appState.tasks.filter((t) => t.projectId === appState.activeProjectId));
const progress = computed(() => activeProject.value ? getProjectProgress(activeProject.value.id) : 0);

const projectTasksSorted = computed(() => {
  return [...projectTasks.value].sort((a, b) => {
    const aParts = a.wbsId.split('.').map(Number);
    const bParts = b.wbsId.split('.').map(Number);
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      if ((aParts[i] || 0) !== (bParts[i] || 0)) return (aParts[i] || 0) - (bParts[i] || 0);
    }
    return 0;
  });
});

const boardStatuses = ["To Do", "In Progress", "In Review", "Completed"];
const getTasksByStatus = (status) => projectTasks.value.filter((t) => !t.isParent && t.status === status);

const onDragChange = (evt, newStatus) => {
  if (evt.added) {
    const task = appState.tasks.find(t => t.projectId === evt.added.element.projectId && t.wbsId === evt.added.element.wbsId);
    if (task) {
      task.status = newStatus;
      if (newStatus === "Completed") task.progress = 100;
      calculateSchedule();
    }
  }
};

const getOperativeName = (id) => appState.operatives.find((o) => o.id === id)?.name || "Unknown";
const onUpdateTasks = () => calculateSchedule();
const updatePredecessors = (task, val) => {
  task.predecessorIds = val.split(",").map(s => s.trim()).filter(s => s);
  calculateSchedule();
};

const toggleAssignee = (task, opId) => {
  task.assignees = task.assignees.includes(opId) ? task.assignees.filter(id => id !== opId) : [...task.assignees, opId];
  calculateSchedule();
};

const addParentTask = () => {
  const parents = projectTasks.value.filter(t => !t.wbsId.includes("."));
  const newId = parents.length ? (Math.max(...parents.map(p => parseInt(p.wbsId) || 0)) + 1).toString() : "1";
  appState.tasks.push({ wbsId: newId, projectId: appState.activeProjectId, title: "New Parent", status: "To Do", assignees: [], duration: 1, predecessorIds: [], dependencyType: "FS", lag: 0, startDay: 1, endDay: 1, isParent: true, progress: 0 });
  calculateSchedule();
};

const addSubtask = () => {
  const parents = projectTasks.value.filter(t => !t.wbsId.includes("."));
  if (!parents.length) return;
  const lastParent = parents[parents.length - 1];
  const children = projectTasks.value.filter(t => t.wbsId.startsWith(lastParent.wbsId + ".") && t.wbsId !== lastParent.wbsId);
  const newWbsId = `${lastParent.wbsId}.${children.length + 1}`;
  appState.tasks.push({ wbsId: newWbsId, projectId: appState.activeProjectId, title: "New Subtask", status: "To Do", assignees: [], duration: 1, predecessorIds: [], dependencyType: "FS", lag: 0, startDay: 1, endDay: 1, isParent: false, progress: 0 });
  calculateSchedule();
};

const deleteTask = (wbsId) => {
  if (confirm(`Delete ${wbsId}?`)) {
    appState.tasks = appState.tasks.filter(t => !(t.projectId === appState.activeProjectId && (t.wbsId === wbsId || t.wbsId.startsWith(wbsId + "."))));
    calculateSchedule();
  }
};

const addIssue = () => {
  if (!newIssue.title || !activeProject.value) return;
  activeProject.value.issues.push({ id: 'ISS-' + Date.now().toString().slice(-4), title: newIssue.title, priority: newIssue.priority, status: "Open", type: "Bug" });
  newIssue.title = "";
};

const deleteIssue = (id) => {
  if (activeProject.value) activeProject.value.issues = activeProject.value.issues.filter(i => i.id !== id);
};

const getPriorityClass = (p) => ({ 'bg-redAccent': p === 'Critical', 'bg-orange-500': p === 'High', 'bg-blue-500': p === 'Medium', 'bg-gray-500': p === 'Low' });
const formatShortDateFromDay = (d) => activeProject.value ? format(addDays(parseISO(activeProject.value.startDate), d - 1), "MMM d") : "";
const getGanttBarColor = (t) => t.isParent ? 'bg-black border border-white/20' : (t.isCritical ? 'bg-redAccent' : 'bg-teal-500');

const exportPdf = async () => {
  const canvas = await html2canvas(document.getElementById("gantt-export-container"), { scale: 2, backgroundColor: "#0B0B0D" });
  const pdf = new jsPDF("l", "pt", [canvas.width, canvas.height]);
  pdf.addImage(canvas.toDataURL("image/jpeg", 1.0), "JPEG", 0, 0, canvas.width, canvas.height);
  pdf.save("Timeline.pdf");
};

const assignedOperatives = computed(() => {
  const ids = new Set();
  projectTasks.value.forEach(t => t.assignees?.forEach(id => ids.add(id)));
  return appState.operatives.filter(o => ids.has(o.id));
});

const heatmapData = computed(() => getResourceHeatmap(activeProject.value?.startDate || new Date().toISOString(), heatmapDays.value));
const formatShortDate = (d) => format(parseISO(d), "MMM d");
const getHeatmapColor = (s) => s === 0 ? 'transparent' : (s < 0.5 ? '#EAB308' : (s <= 1.0 ? '#0D9488' : '#E01E2E'));
const getSaturationTextColor = (s) => s === 0 ? 'text-transparent' : (s < 0.5 ? 'text-black' : 'text-white');
</script>
