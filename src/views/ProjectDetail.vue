<template lang="pug">
.h-full.flex.flex-col.gap-6
  //- Project Header & Tabs
  .flex.flex-col.gap-6.flex-shrink-0(v-if="activeProject")
    .flex.justify-between.items-start
      .flex.items-center.gap-6
        .flex.flex-col.gap-1
          label(class="text-[10px]").font-bold.text-appTextMuted.uppercase.tracking-widest Project
          select.bg-appBgSoft.text-appText.text-xl.font-bold.rounded-xl.px-3.py-1.outline-none.border.border-appBorder.cursor-pointer.hover_border-purple-brand.transition-all(
            v-model="appState.activeProjectId"
          )
            option(v-for="p in appState.projects" :key="p.id" :value="p.id") {{ p.name }}
        
        .h-10.w-px.bg-appBorder
        
        .flex.flex-col.gap-1
          span(class="text-[10px]").font-bold.text-appTextMuted.uppercase.tracking-widest Status
          span(class="text-[10px] px-3 py-0.5").rounded-lg.font-bold.bg-purple-brand/10.text-purple-brand.w-fit {{ activeProject.status }}
      
      //- Tab Navigation
      draggable.flex.bg-appBgSoft.p-1.rounded-xl.border.border-appBorder(
        v-if="localModes.length"
        v-model="localModes"
        :key="appState.activeProjectId"
        item-key="id"
        tag="nav"
        :animation="200"
        ghost-class="opacity-50"
      )
        template(#item="{ element }")
          button.px-4.py-1.rounded-lg.text-xs.font-semibold.transition-all.cursor-move.select-none(
            @click="currentMode = element.id"
            :class="currentMode === element.id ? 'bg-appBg text-appText shadow-sm' : 'text-appTextMuted hover:text-appText'"
          ) {{ element.label }}

  //- Dynamic Sub-mode Content
  .flex-1.min-h-0(v-if="activeProject")
    
    //- Overview Mode
    .h-full.flex.flex-col.gap-6.overflow-y-auto(v-if="currentMode === 'overview'")
      .grid.grid-cols-2.gap-6
        .bg-appBgSoft.rounded-3xl.p-6.flex.flex-col.gap-4.border.border-appBorder
          h3.text-lg.font-bold STRATEGIC OBJECTIVES
          p.text-appTextMuted.text-sm {{ activeProject.description }}
          .mt-2
            span(class="text-[10px]").font-bold.text-appTextMuted PROGRESS
            .w-full.bg-appBg.h-2.rounded-full.mt-2
              .bg-purple-brand.h-full.rounded-full.transition-all.duration-1000(:style="{ width: progress + '%' }")
          
          .mt-6.grid.grid-cols-2.gap-4
            .p-3.bg-appBg.rounded-2xl.border.border-appBorder
              span(class="text-[10px]").font-bold.text-appTextMuted START DATE
              p.text-sm.font-bold {{ activeProject.startDate }}
            .p-3.bg-appBg.rounded-2xl.border.border-appBorder
              span(class="text-[10px]").font-bold.text-appTextMuted TARGET END
              p.text-sm.font-bold {{ activeProject.endDate }}
      
      .bg-appBgSoft.rounded-3xl.p-6.border.border-appBorder
        h3.text-lg.font-bold SYSTEM LOGS
        .mt-4.flex.flex-col.gap-3
          .flex.gap-3(v-for="log in activeProject.logs" :key="log.time")
            span.text-xs.font-bold.text-purple-brand {{ log.time }}
            span.text-xs.text-appTextMuted {{ log.msg }}

    //- Kanban Board Mode
    .h-full.flex.gap-6.overflow-x-auto.pb-4(v-else-if="currentMode === 'board'")
      .flex-1.flex.flex-col.gap-6(v-for="status in boardStatuses" :key="status" class="min-w-[320px]")
        .flex.items-center.gap-2
          span.w-2.h-2.rounded-full(:class="getStatusColorClass(status)")
          span.text-sm.font-bold.text-appText {{ status }}
          span(class="text-[10px]").font-bold.text-appTextMuted ({{ getConductTasksByStatus(status).length + getIssuesByStatus(status).length }})
        
        .flex-1.flex.flex-col.gap-4.overflow-y-auto.pr-2
          draggable.flex.flex-col.gap-4(
            :list="getConductTasksByStatus(status)"
            group="tasks"
            item-key="id"
            @change="(evt) => onConductDragChange(evt, status)"
            class="min-h-[100px]"
          )
            template(#item="{element}")
              .bg-appBgSoft.rounded-2xl.p-4.border.border-appBorder.shadow-sm.hover_border-purple-brand.transition-all.cursor-grab.active_cursor-grabbing.group
                //- Card Image/Gradient Placeholder
                .w-full.h-24.rounded-xl.mb-3.brand-gradient.opacity-20.group-hover_opacity-40.transition-all(v-if="element.id === 'ct1' || Math.random() > 0.7")
                
                .flex.justify-between.items-start.mb-2
                  span(class="text-[9px]").font-bold.text-appTextMuted {{ element.id }}
                  span(class="text-[9px] px-2 py-0.5").rounded-lg.font-bold.text-white(:class="getPriorityClass(element.priority)") {{ element.priority }}
                
                h4.text-sm.font-bold.text-appText.mb-3 {{ element.title }}
                
                //- Tags
                .flex.flex-wrap.gap-1.mb-4
                  span(class="text-[9px] px-2 py-0.5").rounded-lg.font-bold.bg-purple-brand/10.text-purple-brand Brand
                  span(class="text-[9px] px-2 py-0.5").rounded-lg.font-bold.bg-tuscany/10.text-tuscany Marketing
                
                //- Footer
                .flex.justify-between.items-center
                  .flex.items-center.gap-1
                    ClockIcon.text-appTextMuted(:size="10")
                    span(class="text-[9px]").font-bold.text-appTextMuted {{ element.dueDate }}
                  
                  .flex.-space-x-2
                    .w-5.h-5.rounded-full.bg-purple-brand.border-2.border-bg-secondary.flex.items-center.justify-center(class="text-[8px]").text-white.font-bold(v-for="opId in element.assignees" :key="opId") {{ getOperativeName(opId)[0] }}
                
                button.w-full.mt-3.py-1.rounded-lg(class="text-[9px]").font-bold.text-appTextMuted.bg-appBg.hover_text-purple-brand.transition-all(@click="editingTask = element") VIEW DETAILS

          //- Issues in Kanban (as separate styling)
          draggable.flex.flex-col.gap-4(
            :list="getIssuesByStatus(status)"
            group="tasks"
            item-key="id"
            @change="(evt) => onIssueDragChange(evt, status)"
          )
            template(#item="{element}")
              .bg-appBgSoft.rounded-2xl.p-4.shadow-sm.hover_border-raspberry.transition-all.cursor-grab.active_cursor-grabbing(class="border border-raspberry/20")
                .flex.justify-between.items-start.mb-2
                  span(class="text-[9px] text-raspberry/60").font-bold {{ element.id }}
                  span(class="text-[9px] px-2 py-0.5").rounded-lg.font-bold.text-white.bg-raspberry {{ element.priority }}
                
                h4.text-sm.font-bold.text-raspberry.mb-2 {{ element.title }}
                .flex.items-center.gap-1
                  AlertTriangleIcon.text-raspberry(:size="12")
                  span(class="text-[9px]").font-bold.text-appTextMuted ISSUE RECORDED
                
                button.w-full.mt-3.py-1.rounded-lg(class="text-[9px]").font-bold.text-appTextMuted.bg-appBg.hover_text-raspberry.transition-all(@click="editingIssue = element") RESOLVE

    //- Work Breakdown Structure (Grid Mode)
    .h-full.bg-appBgSoft.rounded-3xl.border.border-appBorder.overflow-hidden.flex.flex-col(v-else-if="currentMode === 'list'")
      .flex.justify-between.items-center.p-4.border-b.border-appBorder
        .flex.items-center.gap-4
          h3.text-sm.font-bold.text-appText PROJECT TASKS GRID
          .flex.gap-2
            button.px-3.py-1.rounded-lg(class="text-[10px]").font-bold.bg-appBg.text-appTextMuted.hover_text-purple-brand.border.border-appBorder(@click="addParentTask") + Parent
            button.px-3.py-1.rounded-lg(class="text-[10px]").font-bold.bg-purple-brand.text-white(@click="addSubtask") + Subtask
      
      .flex-1.overflow-auto
        table.w-full.text-left.border-collapse.whitespace-nowrap.table-fixed
          thead.bg-appBg.text-appTextMuted.sticky.top-0.z-20
            tr
              th.p-3(class="text-[10px]").font-bold.uppercase.tracking-widest(v-for="col in wbsColumns" :key="col.id" :style="{ width: col.width + 'px' }")
                .flex.items-center.justify-between
                  span {{ col.label }}
                  .w-px.h-4.bg-appBorder.cursor-col-resize(@mousedown="startResize(col, $event)")
          tbody
            tr(v-for="task in projectTasksSorted" :key="task.wbsId" :class="task.isParent ? 'bg-appBg font-bold' : 'hover:bg-purple-brand/5'" class="border-b border-appBorder")
              td.p-3(class="text-[10px]").text-appTextMuted {{ task.wbsId }}
              td.p-3.overflow-hidden
                .flex.items-center(:style="{ paddingLeft: (task.wbsId.split('.').length - 1) * 20 + 'px' }")
                  span.mr-2.text-appTextMuted(v-if="!task.isParent") ↳
                  input.bg-transparent.outline-none.w-full.text-xs.font-semibold.text-appText(v-model="task.title" @change="onUpdateTasks")
              td.p-3
                input.bg-transparent.outline-none.w-full(class="text-[10px]")(v-if="!task.isParent" v-model.number="task.duration" type="number" @change="onUpdateTasks")
                span(class="text-[10px]")(v-else) {{ task.duration }}
              td.p-3
                input.bg-transparent.outline-none.w-full(class="text-[10px]")(v-if="!task.isParent" :value="task.predecessorIds.join(', ')" @input="e => updatePredecessors(task, e.target.value)")
              td.p-3
                select.bg-transparent.outline-none.w-full(class="text-[10px]")(v-if="!task.isParent" v-model="task.dependencyType" @change="onUpdateTasks")
                  option FS
                  option SS
                  option FF
                  option SF
              td.p-3
                input.bg-transparent.outline-none.w-full(class="text-[10px]")(v-if="!task.isParent" v-model.number="task.lag" type="number" @change="onUpdateTasks")
              td.p-3(class="text-[10px]") {{ task.startDay }}
              td.p-3(class="text-[10px]") {{ task.endDay }}
              td.p-3(class="text-[10px]")(v-if="!task.isParent" :class="task.isCritical ? 'text-raspberry font-bold' : ''") {{ task.isCritical ? 'Y' : 'N' }}
              td.p-3(v-else)
              td.p-3
                input.bg-transparent.outline-none.w-full(class="text-[10px]")(v-if="!task.isParent" v-model.number="task.progress" type="number" @change="onUpdateTasks")
                span(class="text-[10px]")(v-else) {{ task.progress }}%
              
              td.p-3.relative
                .relative.w-full(v-if="!task.isParent")
                  .bg-appBg.rounded-lg.px-2.py-1.flex.flex-wrap.gap-1.cursor-pointer.border.border-appBorder(class="min-h-[28px]" @click="toggleDropdown(task.wbsId)")
                    template(v-if="task.assignees.length")
                      span.bg-purple-brand.text-white.rounded-lg.px-1.flex.items-center.gap-1(class="text-[8px]")(v-for="opId in task.assignees" :key="opId") 
                        | {{ getOperativeName(opId).split(' ')[0] }}
                        span(class="text-white/60").hover_text-white(@click.stop="toggleAssignee(task, opId)") ✕
                    span.text-appTextMuted(class="text-[8px]")(v-else) Select...
                  
                  .absolute.z-50.top-full.left-0.w-48.bg-appBgSoft.border.border-appBorder.rounded-xl.mt-1.shadow-2xl(v-if="activeDropdown === task.wbsId")
                    .p-2.flex.flex-col.max-h-48.overflow-y-auto.gap-1
                      .flex.items-center.gap-2.px-2.py-1.hover_bg-appBg.cursor-pointer.rounded-lg(
                        v-for="op in appState.operatives" 
                        :key="op.id"
                        @click="toggleAssignee(task, op.id)"
                      )
                        input(type="checkbox" :checked="task.assignees.includes(op.id)")
                        .flex.flex-col
                          span(class="text-[10px]").font-bold {{ op.name }}
                          span(class="text-[8px]").text-appTextMuted {{ op.role }}
              
              td.p-3
                button(class="text-raspberry/50").hover_text-raspberry(@click="deleteTask(task.wbsId)") ✕

    //- Task Management (Conduct)
    .h-full.bg-appBgSoft.rounded-3xl.border.border-appBorder.overflow-hidden.flex.flex-col(v-else-if="currentMode === 'tasks'")
      .p-6.border-b.border-appBorder.flex.justify-between.items-end
        .flex.flex-col.gap-1
          h3.text-lg.font-bold TASK MANAGEMENT
          p.text-xs.text-appTextMuted Action items for {{ activeProject.name }}
        .flex.gap-3.items-end
          .flex.flex-col.gap-1
            label(class="text-[10px]").font-bold.text-appTextMuted TITLE
            input.bg-appBg.border.border-appBorder.rounded-lg.px-3.py-1.text-xs.outline-none.w-64.focus_border-purple-brand(v-model="newConductTask.title" placeholder="What to conduct?")
          button.btn-primary.text-xs(@click="addConductTask") ADD TASK

      .flex-1.overflow-auto.p-6
        table.w-full.border-collapse.text-left
          thead: tr
            th.p-3.border-b.border-appBorder(class="text-[10px]").font-bold.text-appTextMuted ID
            th.p-3.border-b.border-appBorder(class="text-[10px]").font-bold.text-appTextMuted TITLE
            th.p-3.border-b.border-appBorder(class="text-[10px]").font-bold.text-appTextMuted PRIORITY
            th.p-3.border-b.border-appBorder(class="text-[10px]").font-bold.text-appTextMuted STATUS
            th.p-3.border-b.border-appBorder(class="text-[10px]").font-bold.text-appTextMuted DEADLINE
            th.p-3.border-b.border-appBorder(class="text-[10px]").font-bold.text-appTextMuted ACTIONS
          tbody
            tr.border-b.border-appBorder(v-for="task in conductTasks" :key="task.id" class="hover:bg-purple-brand/5")
              td.p-3(class="text-[10px]").font-mono.text-appTextMuted {{ task.id }}
              td.p-3
                .flex.items-center.gap-2
                  span.font-bold.text-xs {{ task.title }}
                  InfoIcon(class="text-purple-brand/40" v-if="task.description" :size="12")
              td.p-3: span(class="text-[9px] px-2 py-0.5").rounded-lg.font-bold.text-white(:class="getPriorityClass(task.priority)") {{ task.priority }}
              td.p-3
                select.bg-transparent.outline-none(class="text-[10px]").font-bold(v-model="task.status")
                  option(v-for="status in boardStatuses" :key="status" :value="status") {{ status }}
              td.p-3
                input.bg-transparent.outline-none(class="text-[10px]")(type="date" v-model="task.dueDate" class="[color-scheme:light]")
              td.p-3.flex.gap-4
                button(class="text-[10px]").font-bold.text-purple-brand(@click="editingTask = task") DETAILS
                button(class="text-[10px] text-raspberry/50").font-bold.hover_text-raspberry(@click="deleteConductTask(task.id)") ✕

    //- Timeline Mode
    .h-full.bg-appBgSoft.rounded-3xl.border.border-appBorder.p-6.overflow-hidden.flex.flex-col(v-else-if="currentMode === 'timeline'")
      .flex.justify-between.items-center.mb-6
        h3.text-lg.font-bold PROJECT TIMELINE
        .flex.gap-3
          button.px-3.py-1.rounded-lg.text-xs.font-bold.bg-appBg.border.border-appBorder(@click="exportPdf") Export
      .flex-1.overflow-auto.relative.rounded-2xl.border.border-appBorder#gantt-export-container
        table.w-full.border-collapse.table-fixed.bg-appBgSoft(class="min-w-[1200px]")
          thead: tr
            th.w-64.p-3.text-left(class="text-[10px]").font-bold.text-appTextMuted TASK
            th.p-3.text-center(class="text-[10px]").font-bold.text-appTextMuted.border-l.border-appBorder(v-for="d in timelineDays" :key="d")
              | {{ ganttScale === 'day' ? 'D' + d : formatShortDateFromDay(d) }}
          tbody
            tr(v-for="task in projectTasksSorted" :key="'gantt-'+task.wbsId" class="border-t border-appBorder")
              td.p-3.truncate.text-xs(:class="task.isParent ? 'bg-appBg font-bold' : ''")
                span(v-if="!task.isParent").mr-2.text-appTextMuted ↳
                | {{ task.wbsId }} - {{ task.title }}
              td.p-0.relative.border-l.border-appBorder(v-for="d in timelineDays" :key="d")
                .absolute.inset-y-2.inset-x-0.rounded-full(v-if="d >= task.startDay && d <= task.endDay" :class="getGanttBarColor(task)")

  //- Modal for Task Detail
  .fixed.inset-0.z-50.flex.items-center.justify-center.backdrop-blur-md(class="bg-midnight/80" v-if="editingTask")
    .bg-appBgSoft.rounded-4xl.p-10.w-full.max-w-4xl.flex.flex-col.gap-8.border.border-appBorder.shadow-2xl
      .flex.justify-between.items-start
        .flex.flex-col
          h2.text-2xl.font-bold EDIT TASK
          p(class="text-[10px]").font-bold.text-appTextMuted ID: {{ editingTask.id }}
        button.text-appTextMuted.hover_text-appText(@click="editingTask = null") ✕
      
      .grid.grid-cols-2.gap-8
        .flex.flex-col.gap-4
          .flex.flex-col.gap-1
            label(class="text-[10px]").font-bold.text-appTextMuted TITLE
            input.bg-appBg.border.border-appBorder.rounded-xl.px-3.py-2.text-sm.outline-none.focus_border-purple-brand(v-model="editingTask.title")
          .flex.flex-col.gap-1
            label(class="text-[10px]").font-bold.text-appTextMuted DESCRIPTION
            textarea.bg-appBg.border.border-appBorder.rounded-xl.px-3.py-2.text-sm.outline-none.h-32.focus_border-purple-brand(v-model="editingTask.description" placeholder="Task details...")
          .flex.flex-col.gap-1
            label(class="text-[10px]").font-bold.text-appTextMuted DEADLINE
            input.bg-appBg.border.border-appBorder.rounded-xl.px-3.py-2.text-sm.outline-none.focus_border-purple-brand(type="date" v-model="editingTask.dueDate")
          .flex.flex-col.gap-1
            label(class="text-[10px]").font-bold.text-appTextMuted ASSIGNEES
            .flex.flex-wrap.gap-2
              .flex.items-center.gap-2.bg-appBg.px-3.py-1.rounded-xl.cursor-pointer.border(
                v-for="op in appState.operatives" 
                :key="op.id"
                @click="toggleConductAssignee(editingTask, op.id)"
                :class="editingTask.assignees.includes(op.id) ? 'border-purple-brand' : 'border-appBorder'"
              )
                span.text-xs.font-bold {{ op.name }}
                .w-2.h-2.rounded-full(:class="getResourceLoad(op.id) > 90 ? 'bg-raspberry' : 'bg-green-500'")

        .flex.flex-col.gap-4
          label(class="text-[10px]").font-bold.text-appTextMuted ACTION ITEMS
          .flex.flex-col.gap-2.max-h-96.overflow-y-auto.pr-2
            .flex.items-center.gap-3(v-for="(st, idx) in editingTask.subtasks" :key="idx" :style="{ paddingLeft: (st.level || 0) * 24 + 'px' }")
              ChevronRightIcon(class="text-purple-brand/20" v-if="st.level > 0" :size="12")
              input(type="checkbox" v-model="st.done" class="rounded border-appBorder text-purple-brand focus_ring-purple-brand")
              input.bg-transparent.outline-none.text-sm.flex-1.border-b.border-appBorder(v-model="st.text" placeholder="Subtask...")
              .flex.gap-1
                button.p-1.hover_bg-appBg.rounded(@click="st.level = Math.max(0, (st.level || 0) - 1)") ←
                button.p-1.hover_bg-appBg.rounded(@click="st.level = (st.level || 0) + 1") →
                button(class="text-raspberry/50" @click="editingTask.subtasks.splice(idx, 1)") ✕
          button.w-full.py-2.bg-appBg.rounded-xl.text-xs.font-bold.text-appTextMuted.hover_text-appText(@click="editingTask.subtasks.push({ text: '', done: false, level: 0 })") + Add Action Item

</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted, watch } from "vue";
import draggable from "vuedraggable";
import { appState, getProjectProgress, calculateSchedule, getResourceHeatmap } from "../store/appState";
import { format, addDays, parseISO, differenceInDays } from "date-fns";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Clock as ClockIcon, AlertTriangle as AlertTriangleIcon, Info as InfoIcon, ChevronRight as ChevronRightIcon } from "lucide-vue-next";

const wbsColumns = reactive([
  { id: 'id', label: 'WBS ID', width: 80 },
  { id: 'name', label: 'Task Name', width: 250 },
  { id: 'duration', label: 'Dur', width: 60 },
  { id: 'predecessors', label: 'Pred', width: 80 },
  { id: 'type', label: 'Type', width: 60 },
  { id: 'lag', label: 'Lag', width: 60 },
  { id: 'start', label: 'Start', width: 60 },
  { id: 'end', label: 'End', width: 60 },
  { id: 'critical', label: 'Crit', width: 60 },
  { id: 'progress', label: '%', width: 60 },
  { id: 'resources', label: 'Resources', width: 200 },
  { id: 'delete', label: 'Del', width: 60 },
]);

let resizingCol = null;
let startX = 0;
let startWidth = 0;

const startResize = (col, e) => {
  resizingCol = col;
  startX = e.pageX;
  startWidth = col.width;
  window.addEventListener('mousemove', handleResize);
  window.addEventListener('mouseup', stopResize);
  document.body.style.cursor = 'col-resize';
};

const handleResize = (e) => {
  if (resizingCol) {
    const diff = e.pageX - startX;
    resizingCol.width = Math.max(30, startWidth + diff);
  }
};

const stopResize = () => {
  resizingCol = null;
  window.removeEventListener('mousemove', handleResize);
  window.removeEventListener('mouseup', stopResize);
  document.body.style.cursor = '';
};

const currentMode = ref("board");
const ganttScale = ref("day");
const timelineRange = reactive({ start: "", end: "" });

const activeProject = computed(() => appState.projects.find((p) => p.id === appState.activeProjectId));

const localModes = ref([]);

const initRanges = () => {
  if (activeProject.value) {
    timelineRange.start = activeProject.value.startDate;
    timelineRange.end = format(addDays(parseISO(activeProject.value.startDate), 30), "yyyy-MM-dd");
    
    if (!activeProject.value.modes || activeProject.value.modes.length === 0) {
      activeProject.value.modes = [
        { id: "overview", label: "Overview" },
        { id: "board", label: "Board" },
        { id: "list", label: "Grid" },
        { id: "tasks", label: "Tasks" },
        { id: "timeline", label: "Timeline" },
      ];
    }
    localModes.value = [...activeProject.value.modes];
  }
};

watch(localModes, (newVal) => {
  if (activeProject.value) activeProject.value.modes = [...newVal];
}, { deep: true });

onMounted(initRanges);
watch(() => appState.activeProjectId, initRanges);

const newConductTask = reactive({ title: "", priority: "Medium" });
const activeDropdown = ref(null);
const editingTask = ref(null);
const editingIssue = ref(null);

const projectTasks = computed(() => appState.tasks.filter((t) => t.projectId === appState.activeProjectId));
const conductTasks = computed(() => appState.conductTasks.filter((t) => t.projectId === appState.activeProjectId));
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
const getConductTasksByStatus = (status) => conductTasks.value.filter((t) => t.status === status);
const getIssuesByStatus = (status) => {
  if (!activeProject.value) return [];
  const map = { 'Open': 'To Do', 'In Progress': 'In Progress', 'Resolved': 'Completed', 'Blocked': 'In Review' };
  return activeProject.value.issues.filter(i => map[i.status] === status);
};

const getStatusColorClass = (status) => {
  const map = { 'To Do': 'bg-text-secondary', 'In Progress': 'bg-purple-brand', 'In Review': 'bg-tuscany', 'Completed': 'bg-green-500' };
  return map[status];
};

const onConductDragChange = (evt, newStatus) => {
  if (evt.added) {
    const task = appState.conductTasks.find(t => t.id === evt.added.element.id);
    if (task) task.status = newStatus;
  }
};

const onIssueDragChange = (evt, newStatus) => {
  if (evt.added && activeProject.value) {
    const issue = activeProject.value.issues.find(i => i.id === evt.added.element.id);
    if (issue) {
      const map = { 'To Do': 'Open', 'In Progress': 'In Progress', 'Completed': 'Resolved', 'In Review': 'Blocked' };
      issue.status = map[newStatus];
    }
  }
};

const getOperativeName = (id) => appState.operatives.find((o) => o.id === id)?.name || "Unknown";
const onUpdateTasks = () => calculateSchedule();

const toggleDropdown = (id) => { activeDropdown.value = activeDropdown.value === id ? null : id; };

const updatePredecessors = (task, val) => {
  task.predecessorIds = val.split(",").map(s => s.trim()).filter(s => s);
  calculateSchedule();
};

const toggleAssignee = (task, opId) => {
  task.assignees = task.assignees.includes(opId) ? task.assignees.filter(id => id !== opId) : [...task.assignees, opId];
  calculateSchedule();
};

const toggleConductAssignee = (task, opId) => {
  if (!task.assignees) task.assignees = [];
  task.assignees = task.assignees.includes(opId) ? task.assignees.filter(id => id !== opId) : [...task.assignees, opId];
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

const addConductTask = () => {
  if (!newConductTask.title) return;
  appState.conductTasks.push({
    id: 'CT-' + Date.now().toString().slice(-4),
    projectId: appState.activeProjectId,
    title: newConductTask.title,
    description: "",
    status: "To Do",
    assignees: [],
    priority: newConductTask.priority,
    dueDate: format(new Date(), "yyyy-MM-dd"),
    subtasks: []
  });
  newConductTask.title = "";
};

const deleteTask = (wbsId) => {
  if (confirm(`Delete ${wbsId}?`)) {
    appState.tasks = appState.tasks.filter(t => !(t.projectId === appState.activeProjectId && (t.wbsId === wbsId || t.wbsId.startsWith(wbsId + "."))));
    calculateSchedule();
  }
};

const deleteConductTask = (id) => {
  appState.conductTasks = appState.conductTasks.filter(t => t.id !== id);
};

const getPriorityClass = (p) => ({ 'bg-raspberry': p === 'Critical' || p === 'High', 'bg-purple-brand': p === 'Medium', 'bg-text-secondary': p === 'Low' });

const getResourceLoad = (opId) => {
  const opTasks = appState.tasks.filter(t => !t.isParent && t.status !== 'Completed' && t.assignees.includes(opId));
  return Math.round((opTasks.reduce((sum, t) => sum + t.duration, 0) / 20) * 100);
};

const timelineDays = computed(() => {
  if (!activeProject.value || !timelineRange.start || !timelineRange.end) return [];
  const startOffset = differenceInDays(parseISO(timelineRange.start), parseISO(activeProject.value.startDate)) + 1;
  const range = differenceInDays(parseISO(timelineRange.end), parseISO(timelineRange.start)) + 1;
  const days = [];
  for (let i = 0; i < range; i++) days.push(startOffset + i);
  return days;
});

const getGanttBarColor = (t) => t.isParent ? 'bg-purple-brand/20' : (t.isCritical ? 'bg-raspberry' : 'bg-purple-brand');
const formatShortDateFromDay = (d) => activeProject.value ? format(addDays(parseISO(activeProject.value.startDate), d - 1), "MMM d") : "";

const exportPdf = async () => {
  const canvas = await html2canvas(document.getElementById("gantt-export-container"), { scale: 2 });
  const pdf = new jsPDF("l", "pt", [canvas.width, canvas.height]);
  pdf.addImage(canvas.toDataURL("image/jpeg", 1.0), "JPEG", 0, 0, canvas.width, canvas.height);
  pdf.save("Timeline.pdf");
};
</script>

