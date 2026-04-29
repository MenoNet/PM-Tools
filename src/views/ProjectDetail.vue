<template lang="pug">
.h-full.flex.flex-col.gap-6
  //- Project Header & Tabs
  .glass-card.rounded-2xl.p-6.flex.flex-col.gap-6.flex-shrink-0(v-if="activeProject")
    .flex.justify-between.items-start
      .flex.flex-col.gap-4.w-full
        .flex.items-center.gap-6
          .flex.flex-col.gap-1
            label.text-metadata PROJECT SELECTOR
            select.bg-white_10.text-white.text-2xl.font-black.rounded-xl.px-4.py-2.outline-none.border.border-redAccent_20.cursor-pointer.hover_border-redAccent.transition-all(
              v-model="appState.activeProjectId"
              class="bg-white/10 border-redAccent/20"
            )
              option.text-obsidian(v-for="p in appState.projects" :key="p.id" :value="p.id") {{ p.name }}
          
          .h-12.w-px.bg-white_10(class="bg-white/10")
          
          .flex.flex-col.gap-1
            span.text-metadata STATUS
            span.px-3.py-1.rounded.text-metadata.bg-redAccent_20.text-redAccent.w-fit(class="bg-redAccent/20") {{ activeProject.status }}
            
        p.text-white_60(class="text-white/60") {{ activeProject.description }}
      
      //- Rearrangeable Project Menu (Tabs)
      draggable.flex.bg-white_5.p-1.rounded-xl(
        v-if="localModes.length"
        v-model="localModes"
        :key="appState.activeProjectId"
        item-key="id"
        tag="nav"
        :animation="200"
        ghost-class="opacity-50"
        class="bg-white/5"
      )
        template(#item="{ element }")
          button.px-6.py-2.rounded-lg.text-sm.font-bold.transition-all.cursor-move.select-none(
            @click="currentMode = element.id"
            :class="currentMode === element.id ? 'bg-redAccent text-white shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/5'"
          ) {{ element.label }}

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
      .glass-panel.rounded-xl.p-6
        h3.text-xl.text-header SYSTEM LOGS
        .mt-4.flex.flex-col.gap-3
          .flex.gap-3(v-for="log in activeProject.logs" :key="log.time")
            span.text-metadata.text-redAccent {{ log.time }}
            span.text-sm.text-white_80(class="text-white/80") {{ log.msg }}

    //- Kanban Board Mode (Integrated Tasks & Issues)
    .h-full.flex.gap-6.overflow-x-auto.pb-4(v-else-if="currentMode === 'board'")
      .flex-1.flex.flex-col.gap-6(v-for="status in boardStatuses" :key="status" class="min-w-[340px]")
        .flex.items-center.justify-between.px-2
          span.text-metadata.tracking-widest {{ status.toUpperCase() }}
          .flex.gap-2
            span.bg-white_10.px-2.rounded(class="text-[10px] bg-white/10 text-white/60") T:{{ getWbsTasksByStatus(status).length }}
            span.bg-redAccent_20.px-2.rounded(class="text-[10px] bg-redAccent/20 text-redAccent") I:{{ getIssuesByStatus(status).length }}
        
        .flex-1.flex.flex-col.gap-4.overflow-y-auto.pr-2
          //- WBS TASKS SECTION
          .flex.flex-col.gap-2
            .flex.items-center.gap-2
              span.text-white_40(class="text-[10px]") TASKS
              .flex-1.h-px.bg-white_10(class="bg-white/10")
            draggable.flex.flex-col.gap-3(
              :list="getWbsTasksByStatus(status)"
              group="tasks"
              item-key="wbsId"
              @change="(evt) => onWbsDragChange(evt, status)"
              class="min-h-[100px]"
            )
              template(#item="{element}")
                .glass-panel.rounded-xl.p-4.cursor-grab.active_cursor-grabbing.hover_border-redAccent.transition-colors(class="hover:border-redAccent")
                  .flex.justify-between.items-start.mb-2
                    span.text-metadata ID: {{ element.wbsId }}
                    span.bg-redAccent.text-white.px-2.rounded(v-if="element.isCritical" class="text-[9px] font-bold") CRITICAL
                  h4.font-bold.text-sm.mb-2 {{ element.title }}
                  .flex.justify-between.items-end
                    .flex.flex-wrap.gap-1
                      span.bg-white_10.px-1.rounded(v-for="opId in element.assignees" :key="opId" class="text-[9px] bg-white/10") {{ getOperativeName(opId).split(' ')[0] }}
                    span.text-metadata {{ element.duration }}d

          //- ISSUES SECTION
          .flex.flex-col.gap-2
            .flex.items-center.gap-2
              span.text-redAccent_60(class="text-[10px] text-redAccent/60") ISSUES
              .flex-1.h-px.bg-redAccent_20(class="bg-redAccent/20")
            draggable.flex.flex-col.gap-3(
              :list="getIssuesByStatus(status)"
              group="issues"
              item-key="id"
              @change="(evt) => onIssueDragChange(evt, status)"
              class="min-h-[100px]"
            )
              template(#item="{element}")
                .p-4.bg-redAccent_5.border.border-redAccent_10.rounded-xl.cursor-grab.active_cursor-grabbing.hover_border-redAccent.transition-colors(class="bg-redAccent/5 border-redAccent/10 hover:border-redAccent")
                  .flex.justify-between.items-start.mb-2
                    span.text-metadata(class="text-redAccent/60") {{ element.id }}
                    span.px-2.py-0_5.rounded.font-bold.text-white(class="text-[9px]" :class="getPriorityClass(element.priority)") {{ element.priority }}
                  h4.font-bold.text-sm.text-redAccent {{ element.title }}
                  .mt-2.flex.justify-between.items-end
                    span.text-metadata(class="text-[9px]") {{ element.assignees?.length ? getOperativeName(element.assignees[0]) : 'UNASSIGNED' }}
                    AlertTriangleIcon.text-redAccent(:size="14")

    //- Work Breakdown Structure (List/Gantt Core)
    .h-full.glass-panel.rounded-xl.overflow-hidden.flex.flex-col(v-else-if="currentMode === 'list'")
      .flex.justify-between.p-4.border-b.border-white_5(class="border-white/5")
        h3.text-xl.text-header WORK BREAKDOWN STRUCTURE
        .flex.gap-4
          button.bg-white_10.text-white.px-4.py-1.rounded.text-xs.font-bold(class="bg-white/10 hover:bg-white/20" @click="addParentTask") + ADD PARENT TASK
          button.bg-redAccent.text-white.px-4.py-1.rounded.text-xs.font-bold(@click="addSubtask") + ADD SUBTASK
      
      .flex-1.overflow-auto
        table.w-full.text-left.border-collapse.whitespace-nowrap(class="table-fixed")
          thead(class="bg-[#d9ead3] text-black sticky top-0 z-20")
            tr
              th.p-2.text-xs.font-bold(v-for="col in wbsColumns" :key="col.id" :style="{ width: col.width + 'px' }")
                .flex.items-center.justify-between
                  span {{ col.label }}
                  .w-1.h-4.cursor-col-resize.bg-black_10(@mousedown="startResize(col, $event)")
          tbody
            tr(v-for="task in projectTasksSorted" :key="task.wbsId" :class="task.isParent ? 'bg-white_5 font-bold' : 'hover:bg-white_2'" class="border-b border-white/5")
              td.p-2.overflow-hidden.text-xs {{ task.wbsId }}
              td.p-2.overflow-hidden
                .flex.items-center(:style="{ paddingLeft: (task.wbsId.split('.').length - 1) * 20 + 'px' }")
                  span.mr-2(v-if="!task.isParent") ↳
                  input.bg-transparent.outline-none.w-full.text-sm.hover_bg-white_5.rounded.px-1(v-model="task.title" @change="onUpdateTasks" class="hover:bg-white/5")
              td.p-2.overflow-hidden
                input.bg-transparent.outline-none.w-full.text-sm(v-if="!task.isParent" v-model.number="task.duration" type="number" @change="onUpdateTasks")
                span.px-1(v-else) {{ task.duration }}
              td.p-2.overflow-hidden
                input.bg-transparent.outline-none.w-full.text-sm(v-if="!task.isParent" :value="task.predecessorIds.join(', ')" @input="e => updatePredecessors(task, e.target.value)")
              td.p-2.overflow-hidden
                select.bg-transparent.outline-none.w-full.text-xs(v-if="!task.isParent" v-model="task.dependencyType" @change="onUpdateTasks")
                  option FS
                  option SS
                  option FF
                  option SF
              td.p-2.overflow-hidden
                input.bg-transparent.outline-none.w-full.text-xs(v-if="!task.isParent" v-model.number="task.lag" type="number" @change="onUpdateTasks")
              td.p-2.overflow-hidden.text-xs {{ task.startDay }}
              td.p-2.overflow-hidden.text-xs {{ task.endDay }}
              td.p-2.overflow-hidden.text-xs(v-if="!task.isParent" :class="task.isCritical ? 'text-redAccent font-bold' : ''") {{ task.isCritical ? 'Y' : 'N' }}
              td.p-2.overflow-hidden(v-else)
              td.p-2.overflow-hidden
                input.bg-transparent.outline-none.w-full.text-sm(v-if="!task.isParent" v-model.number="task.progress" type="number" @change="onUpdateTasks")
                span.px-1(v-else) {{ task.progress }}%
              
              //- Resources Dropdown
              td.p-2.relative
                .relative.w-full(v-if="!task.isParent")
                  .bg-white_5.rounded.px-2.py-1.flex.flex-wrap.gap-1.cursor-pointer.border.border-white_10(
                    class="bg-white/5 border-white/10 hover:border-redAccent min-h-[32px]"
                    @click="toggleDropdown(task.wbsId)"
                  )
                    template(v-if="task.assignees.length")
                      span.bg-redAccent.text-white.rounded.px-1.flex.items-center.gap-1(v-for="opId in task.assignees" :key="opId" class="text-[9px]") 
                        | {{ getOperativeName(opId).split(' ')[0] }}
                        span.text-white_40.hover_text-white(@click.stop="toggleAssignee(task, opId)") ✕
                    span.text-white_40(v-else class="text-[10px]") Select...
                  
                  .absolute.z-50.top-full.left-0.w-48.bg-obsidian.border.border-white_10.rounded.mt-1.shadow-2xl(
                    v-if="activeDropdown === task.wbsId"
                    class="border-white/10"
                  )
                    .p-1.flex.flex-col.max-h-48.overflow-y-auto
                      .flex.items-center.gap-2.px-2.py-1.hover_bg-white_5.cursor-pointer.rounded(
                        v-for="op in appState.operatives" 
                        :key="op.id"
                        @click="toggleAssignee(task, op.id)"
                        class="hover:bg-white/5"
                      )
                        input(type="checkbox" :checked="task.assignees.includes(op.id)" class="pointer-events-none")
                        .flex.flex-col
                          span.text-xs.font-bold {{ op.name }}
                          span.text-metadata(class="text-[8px]") {{ op.role }}
              
              td.p-2.overflow-hidden
                button.text-redAccent.opacity-50.hover_opacity-100(@click="deleteTask(task.wbsId)") ✕

    //- Task Management (Granular Conduct Items)
    .h-full.glass-panel.rounded-xl.overflow-hidden.flex.flex-col(v-else-if="currentMode === 'tasks'")
      .p-4.border-b.border-white_5.flex.justify-between.items-end(class="border-white/5")
        .flex.flex-col.gap-2
          h3.text-xl.text-header TASK MANAGEMENT (CONDUCT)
          p.text-metadata GRANULAR ACTION ITEMS FOR {{ activeProject.name.toUpperCase() }}
        .flex.gap-3.items-end
          .flex.flex-col.gap-1
            label.text-metadata TITLE
            input.bg-white_5.border.border-white_10.rounded.px-3.py-2.text-xs.outline-none(v-model="newConductTask.title" placeholder="What to conduct?" class="bg-white/5 border-white/10 focus:border-redAccent w-64")
          .flex.flex-col.gap-1
            label.text-metadata PRIORITY
            select.bg-white_5.border.border-white_10.rounded.px-3.py-2.text-xs.outline-none(v-model="newConductTask.priority" class="bg-white/5 border-white/10 focus:border-redAccent")
              option Low
              option Medium
              option High
          button.bg-redAccent.text-white.px-4.py-2.rounded.font-bold.text-xs(@click="addConductTask") ADD TASK

      .flex-1.overflow-auto.p-4
        .grid.grid-cols-4.gap-4
          .flex.flex-col.gap-3(v-for="status in boardStatuses" :key="status")
            .flex.items-center.justify-between.px-2
              span.text-metadata {{ status.toUpperCase() }}
              span.text-xs.text-white_40 {{ getConductTasksByStatus(status).length }}
            
            draggable.flex-1.flex.flex-col.gap-3(
              class="min-h-[300px]"
              :list="getConductTasksByStatus(status)"
              group="conduct"
              item-key="id"
              @change="(evt) => onConductDragChange(evt, status)"
            )
              template(#item="{element}")
                .glass-panel.rounded-xl.p-4.flex.flex-col.gap-3.group.hover_border-redAccent.transition-colors(class="hover:border-redAccent")
                  .flex.justify-between.items-start
                    span.text-metadata(class="text-[8px]") ID: {{ element.id }}
                    button.opacity-0.group-hover_opacity-100.text-redAccent(@click="deleteConductTask(element.id)") ✕
                  h4.font-bold.text-sm {{ element.title }}
                  
                  //- Deadlines & Assignees
                  .flex.flex-col.gap-2
                    .flex.items-center.gap-2
                      ClockIcon.text-white_40(:size="12")
                      input.bg-transparent.outline-none.text-metadata(type="date" v-model="element.dueDate" class="[color-scheme:dark] text-[10px]")
                    .flex.flex-wrap.gap-1
                      span.bg-redAccent.text-white.rounded.px-1.flex.items-center.gap-1(v-for="opId in element.assignees" :key="opId" class="text-[8px]") 
                        | {{ getOperativeName(opId).split(' ')[0] }}
                        span.text-white_40.hover_text-white(@click.stop="toggleConductAssignee(element, opId)") ✕
                  
                  //- Expanded Detail Button
                  button.w-full.py-1.bg-white_5.rounded.text-metadata.hover_text-white(class="bg-white/5 text-[9px]" @click="editingTask = element") DETAILS & SUBTASKS

    //- Integrated Issues Mode
    .h-full.glass-panel.rounded-xl.overflow-hidden.flex.flex-col(v-else-if="currentMode === 'issues'")
      .p-6.border-b.border-white_5.flex.justify-between.items-end(class="border-white/5")
        .flex.flex-col.gap-2
          h3.text-xl.text-header PROJECT ISSUES & RISKS
          p.text-metadata TRACKING IMPEDIMENTS FOR {{ activeProject.name.toUpperCase() }}
        .flex.gap-3.items-end
          .flex.flex-col.gap-1
            label.text-metadata TITLE
            input.bg-white_5.border.border-white_10.rounded.px-3.py-2.text-xs.outline-none(v-model="newIssue.title" placeholder="Description" class="bg-white/5 border-white/10 focus:border-redAccent w-48")
          .flex.flex-col.gap-1
            label.text-metadata PRIORITY
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
              td.p-3.flex.gap-4
                button.text-metadata.hover_text-white(@click="editingIssue = issue") DETAILS
                button.text-redAccent.opacity-50.hover_opacity-100(@click="deleteIssue(issue.id)") ✕

    //- Timeline Mode
    .h-full.glass-panel.rounded-xl.overflow-hidden.flex.flex-col.p-4(v-else-if="currentMode === 'timeline'")
      .flex.justify-between.mb-4
        .flex.items-center.gap-6
          button.px-4.py-1.rounded.text-xs.font-bold.bg-redAccent.text-white(@click="exportPdf") EXPORT PDF
          .flex.items-center.gap-3
            .flex.items-center.gap-2
              span.text-metadata VIEW FROM:
              input.bg-white_5.border.border-white_10.rounded.px-2.py-0_5.text-xs.w-32(type="date" v-model="timelineRange.start" class="bg-white/5 border-white/10 [color-scheme:dark]")
            .flex.items-center.gap-2
              span.text-metadata UNTIL:
              input.bg-white_5.border.border-white_10.rounded.px-2.py-0_5.text-xs.w-32(type="date" v-model="timelineRange.end" class="bg-white/5 border-white/10 [color-scheme:dark]")
        .flex.bg-white_5.p-1.rounded-lg(class="bg-white/5")
          button.px-3.py-1.rounded.text-xs.font-bold(:class="ganttScale === 'day' ? 'bg-redAccent text-white' : 'text-metadata'" @click="ganttScale = 'day'") Day
          button.px-3.py-1.rounded.text-xs.font-bold(:class="ganttScale === 'date' ? 'bg-redAccent text-white' : 'text-metadata'" @click="ganttScale = 'date'") Date

      .flex-1.overflow-auto.relative.bg-obsidian#gantt-export-container
        table.w-full.border-collapse.table-fixed.bg-obsidian(class="min-w-[1200px]")
          thead: tr
            th.w-64.p-2.text-left.text-metadata Task
            th.p-2.text-center.text-xs.font-bold.border-l.border-white_5(v-for="d in timelineDays" :key="d" class="border-white/5 w-12 bg-[#cfe2f3] text-black")
              | {{ ganttScale === 'day' ? 'D' + d : formatShortDateFromDay(d) }}
          tbody
            tr(v-for="task in projectTasksSorted" :key="'gantt-'+task.wbsId" class="border-t border-white/5")
              td.p-2.truncate.text-sm(:class="{'font-bold text-white': task.isParent}")
                span(v-if="!task.isParent").mr-2.text-white_40 ↳
                | {{ task.wbsId }} - {{ task.title }}
              td.p-0.relative.border-l.border-white_5(v-for="d in timelineDays" :key="d" class="border-white/5")
                .absolute.inset-y-2.inset-x-0.rounded-sm(v-if="d >= task.startDay && d <= task.endDay" :class="getGanttBarColor(task)")

    //- Heatmap Mode
    .h-full.glass-panel.rounded-xl.overflow-hidden.flex.flex-col(v-else-if="currentMode === 'heatmap'")
      .p-4.border-b.border-white_5.flex.justify-between.items-center(class="border-white/5")
        .flex.items-center.gap-6
          h3.text-xl.text-header PROJECT RESOURCE LOAD
          .flex.items-center.gap-3
            .flex.items-center.gap-2
              span.text-metadata VIEW FROM:
              input.bg-white_5.border.border-white_10.rounded.px-2.py-0_5.text-xs.w-32(type="date" v-model="heatmapRange.start" class="bg-white/5 border-white/10 [color-scheme:dark]")
            .flex.items-center.gap-2
              span.text-metadata UNTIL:
              input.bg-white_5.border.border-white_10.rounded.px-2.py-0_5.text-xs.w-32(type="date" v-model="heatmapRange.end" class="bg-white/5 border-white/10 [color-scheme:dark]")
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

  //- Modal for Task Detail (Edit description, subtasks, assignees)
  .fixed.inset-0.z-50.flex.items-center.justify-center.bg-black_80.backdrop-blur-md(v-if="editingTask" class="bg-black/80")
    .glass-card.rounded-2xl.p-8.w-full.max-w-2xl.flex.flex-col.gap-6.border.border-white_10(class="border-white/10")
      .flex.justify-between.items-start
        .flex.flex-col
          h2.text-2xl.text-header EDIT TASK
          p.text-metadata ID: {{ editingTask.id }}
        button.text-white_40.hover_text-white(@click="editingTask = null") ✕
      
      .grid.grid-cols-2.gap-8
        .flex.flex-col.gap-4
          .flex.flex-col.gap-1
            label.text-metadata TITLE
            input.bg-white_5.border.border-white_10.rounded.px-3.py-2.text-sm.outline-none(v-model="editingTask.title" class="bg-white/5 border-white/10 focus:border-redAccent")
          .flex.flex-col.gap-1
            label.text-metadata DESCRIPTION
            textarea.bg-white_5.border.border-white_10.rounded.px-3.py-2.text-sm.outline-none.h-32(v-model="editingTask.description" class="bg-white/5 border-white/10 focus:border-redAccent")
          .flex.flex-col.gap-1
            label.text-metadata ASSIGNEES
            .flex.flex-wrap.gap-2
              .flex.items-center.gap-2.bg-white_5.px-2.py-1.rounded.cursor-pointer(
                v-for="op in appState.operatives" 
                :key="op.id"
                @click="toggleConductAssignee(editingTask, op.id)"
                :class="editingTask.assignees.includes(op.id) ? 'border border-redAccent' : 'border border-transparent'"
              )
                span.text-xs {{ op.name }}
                //- Capacity Indicator
                .w-2.h-2.rounded-full(:class="getResourceLoad(op.id) > 90 ? 'bg-redAccent' : 'bg-green-500'")

        .flex.flex-col.gap-4
          label.text-metadata SUBTASKS / ACTION ITEMS
          .flex.flex-col.gap-2.max-h-64.overflow-y-auto.pr-2
            .flex.items-center.gap-3(v-for="(st, idx) in editingTask.subtasks" :key="idx")
              input(type="checkbox" v-model="st.done")
              input.bg-transparent.outline-none.text-sm.flex-1.border-b.border-white_10(v-model="st.text" placeholder="Subtask...")
              button.text-redAccent.opacity-50(@click="editingTask.subtasks.splice(idx, 1)") ✕
          button.w-full.py-2.bg-white_5.rounded.text-metadata.hover_text-white(class="bg-white/5" @click="editingTask.subtasks.push({ text: '', done: false })") + ADD SUBTASK

  //- Modal for Issue Detail
  .fixed.inset-0.z-50.flex.items-center.justify-center.bg-black_80.backdrop-blur-md(v-if="editingIssue" class="bg-black/80")
    .glass-card.rounded-2xl.p-8.w-full.max-w-2xl.flex.flex-col.gap-6.border.border-white_10(class="border-white/10")
      .flex.justify-between.items-start
        .flex.flex-col
          h2.text-2xl.text-header RESOLVE ISSUE
          p.text-metadata ID: {{ editingIssue.id }}
        button.text-white_40.hover_text-white(@click="editingIssue = null") ✕
      
      .grid.grid-cols-2.gap-8
        .flex.flex-col.gap-4
          .flex.flex-col.gap-1
            label.text-metadata DESCRIPTION / ROOT CAUSE
            textarea.bg-white_5.border.border-white_10.rounded.px-3.py-2.text-sm.outline-none.h-32(v-model="editingIssue.description" class="bg-white/5 border-white/10 focus:border-redAccent")
          .flex.flex-col.gap-1
            label.text-metadata TARGET RESOLUTION
            input.bg-white_5.border.border-white_10.rounded.px-3.py-2.text-sm.outline-none(type="date" v-model="editingIssue.dueDate" class="bg-white/5 border-white/10 focus:border-redAccent [color-scheme:dark]")
          .flex.flex-col.gap-1
            label.text-metadata ASSIGNEES
            .flex.flex-wrap.gap-2
              .flex.items-center.gap-2.bg-white_5.px-2.py-1.rounded.cursor-pointer(
                v-for="op in appState.operatives" 
                :key="op.id"
                @click="toggleIssueAssignee(editingIssue, op.id)"
                :class="editingIssue.assignees.includes(op.id) ? 'border border-redAccent' : 'border border-transparent'"
              )
                span.text-xs {{ op.name }}

        .flex.flex-col.gap-4
          label.text-metadata ACTION ITEMS FOR RESOLUTION
          .flex.flex-col.gap-2.max-h-64.overflow-y-auto.pr-2
            .flex.items-center.gap-3(v-for="(st, idx) in editingIssue.subtasks" :key="idx")
              input(type="checkbox" v-model="st.done")
              input.bg-transparent.outline-none.text-sm.flex-1.border-b.border-white_10(v-model="st.text" placeholder="Action...")
              button.text-redAccent.opacity-50(@click="editingIssue.subtasks.splice(idx, 1)") ✕
          button.w-full.py-2.bg-white_5.rounded.text-metadata.hover_text-white(class="bg-white/5" @click="editingIssue.subtasks.push({ text: '', done: false })") + ADD ACTION ITEM

</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted, watch } from "vue";
import draggable from "vuedraggable";
import { appState, getProjectProgress, calculateSchedule, getResourceHeatmap } from "../store/appState";
import { format, addDays, parseISO, differenceInDays } from "date-fns";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Clock as ClockIcon, AlertTriangle as AlertTriangleIcon } from "lucide-vue-next";

const wbsColumns = reactive([
  { id: 'id', label: 'WBS ID', width: 80 },
  { id: 'name', label: 'Task Name', width: 250 },
  { id: 'duration', label: 'Duration', width: 80 },
  { id: 'predecessors', label: 'Pred IDs', width: 100 },
  { id: 'type', label: 'Type', width: 60 },
  { id: 'lag', label: 'Lag', width: 60 },
  { id: 'start', label: 'Start', width: 60 },
  { id: 'end', label: 'End', width: 60 },
  { id: 'critical', label: 'Critical', width: 60 },
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

const currentMode = ref("overview");
const ganttScale = ref("day");

const activeProject = computed(() => appState.projects.find((p) => p.id === appState.activeProjectId));

const timelineRange = reactive({
  start: "",
  end: ""
});

const heatmapRange = reactive({
  start: "",
  end: ""
});

const localModes = ref([]);

const initRanges = () => {
  if (activeProject.value) {
    timelineRange.start = activeProject.value.startDate;
    timelineRange.end = format(addDays(parseISO(activeProject.value.startDate), 30), "yyyy-MM-dd");
    heatmapRange.start = activeProject.value.startDate;
    heatmapRange.end = format(addDays(parseISO(activeProject.value.startDate), 14), "yyyy-MM-dd");
    
    // Ensure project has modes for rearranging
    if (!activeProject.value.modes || activeProject.value.modes.length === 0) {
      activeProject.value.modes = [
        { id: "overview", label: "OVERVIEW" },
        { id: "board", label: "KANBAN" },
        { id: "list", label: "WBS" },
        { id: "tasks", label: "TASKS" },
        { id: "timeline", label: "TIMELINE" },
        { id: "heatmap", label: "HEATMAP" },
        { id: "issues", label: "ISSUES" },
      ];
    }
    localModes.value = [...activeProject.value.modes];
  }
};

// Sync local reordering back to the store
watch(localModes, (newVal) => {
  if (activeProject.value) {
    activeProject.value.modes = [...newVal];
  }
}, { deep: true });

onMounted(initRanges);
watch(() => appState.activeProjectId, initRanges);

const viewMode = ref("hours");
const newIssue = reactive({ title: "", priority: "Medium" });
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
const getWbsTasksByStatus = (status) => projectTasks.value.filter((t) => !t.isParent && t.status === status);
const getConductTasksByStatus = (status) => conductTasks.value.filter((t) => t.status === status);
const getIssuesByStatus = (status) => {
  if (!activeProject.value) return [];
  // Map internal issue status to kanban columns
  const map = {
    'Open': 'To Do',
    'In Progress': 'In Progress',
    'Resolved': 'Completed',
    'Blocked': 'In Review'
  };
  return activeProject.value.issues.filter(i => map[i.status] === status);
};

const onWbsDragChange = (evt, newStatus) => {
  if (evt.added) {
    const task = appState.tasks.find(t => t.projectId === evt.added.element.projectId && t.wbsId === evt.added.element.wbsId);
    if (task) {
      task.status = newStatus;
      if (newStatus === "Completed") task.progress = 100;
      calculateSchedule();
    }
  }
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
      const map = {
        'To Do': 'Open',
        'In Progress': 'In Progress',
        'Completed': 'Resolved',
        'In Review': 'Blocked'
      };
      issue.status = map[newStatus];
    }
  }
};

const getOperativeName = (id) => appState.operatives.find((o) => o.id === id)?.name || "Unknown";
const onUpdateTasks = () => calculateSchedule();

const toggleDropdown = (id) => {
  activeDropdown.value = activeDropdown.value === id ? null : id;
};

const closeDropdowns = (e) => {
  if (!e.target.closest('.relative')) activeDropdown.value = null;
};

onMounted(() => window.addEventListener('click', closeDropdowns));
onUnmounted(() => window.removeEventListener('click', closeDropdowns));

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

const toggleIssueAssignee = (issue, opId) => {
  if (!issue.assignees) issue.assignees = [];
  issue.assignees = issue.assignees.includes(opId) ? issue.assignees.filter(id => id !== opId) : [...issue.assignees, opId];
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

const addIssue = () => {
  if (!newIssue.title || !activeProject.value) return;
  activeProject.value.issues.push({ 
    id: 'ISS-' + Date.now().toString().slice(-4), 
    title: newIssue.title, 
    description: "",
    priority: newIssue.priority, 
    status: "Open", 
    type: "Bug",
    dueDate: format(addDays(new Date(), 3), "yyyy-MM-dd"),
    assignees: [],
    subtasks: []
  });
  newIssue.title = "";
};

const deleteIssue = (id) => {
  if (activeProject.value) activeProject.value.issues = activeProject.value.issues.filter(i => i.id !== id);
};

const getPriorityClass = (p) => ({ 'bg-redAccent': p === 'Critical' || p === 'High', 'bg-blue-500': p === 'Medium', 'bg-gray-500': p === 'Low' });
const formatShortDateFromDay = (d) => activeProject.value ? format(addDays(parseISO(activeProject.value.startDate), d - 1), "MMM d") : "";
const getGanttBarColor = (t) => t.isParent ? 'bg-[#EADDCA]' : (t.isCritical ? 'bg-redAccent' : 'bg-teal-500');

const timelineDays = computed(() => {
  if (!activeProject.value || !timelineRange.start || !timelineRange.end) return [];
  const startOffset = differenceInDays(parseISO(timelineRange.start), parseISO(activeProject.value.startDate)) + 1;
  const range = differenceInDays(parseISO(timelineRange.end), parseISO(timelineRange.start)) + 1;
  const days = [];
  for (let i = 0; i < range; i++) {
    days.push(startOffset + i);
  }
  return days;
});

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

const heatmapData = computed(() => {
  if (!activeProject.value || !heatmapRange.start || !heatmapRange.end) return { dates: [], heatmap: {} };
  const range = differenceInDays(parseISO(heatmapRange.end), parseISO(heatmapRange.start)) + 1;
  return getResourceHeatmap(heatmapRange.start, range);
});

const getResourceLoad = (opId) => {
  const opTasks = appState.tasks.filter(t => !t.isParent && t.status !== 'Completed' && t.assignees.includes(opId));
  const totalLoad = opTasks.reduce((sum, t) => sum + t.duration, 0);
  return Math.round((totalLoad / 20) * 100);
};

const formatShortDate = (d) => format(parseISO(d), "MMM d");
const getHeatmapColor = (s) => s === 0 ? 'transparent' : (s < 0.5 ? '#EAB308' : (s <= 1.0 ? '#0D9488' : '#E01E2E'));
const getSaturationTextColor = (s) => s === 0 ? 'text-transparent' : (s < 0.5 ? 'text-black' : 'text-white');
</script>
