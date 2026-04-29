<template lang="pug">
.h-full.flex.flex-col.gap-6.overflow-hidden
  .glass-card.rounded-2xl.p-6.flex.justify-between.items-start.flex-shrink-0
    .flex.flex-col.gap-2
      h2.text-3xl.text-header ISSUES & BUG TRACKER
      p.text-white_60(class="text-white/60") System Impediments & Operational Risks
    
    //- Add Issue Form
    .flex.gap-3.items-end
      .flex.flex-col.gap-1
        label.text-metadata TITLE
        input.bg-white_5.border.border-white_10.rounded.px-3.py-2.text-sm.outline-none(v-model="newIssue.title" placeholder="Issue Description" class="bg-white/5 border-white/10 focus:border-redAccent")
      .flex.flex-col.gap-1
        label.text-metadata PRIORITY
        select.bg-white_5.border.border-white_10.rounded.px-3.py-2.text-sm.outline-none(v-model="newIssue.priority" class="bg-white/5 border-white/10 focus:border-redAccent")
          option(value="Low") Low
          option(value="Medium") Medium
          option(value="High") High
          option(value="Critical") Critical
      button.bg-redAccent.text-white.px-4.py-2.rounded.font-bold.text-sm.hover_bg-red-700.transition-colors(@click="addIssue") LOG ISSUE

  //- Issues Grid
  .flex-1.glass-card.rounded-2xl.overflow-hidden.flex.flex-col
    .p-6.border-b.border-white_5.flex.justify-between.items-center(class="border-white/5")
      h3.text-xl.text-header ACTIVE IMPEDIMENTS
      .flex.gap-4
        span.text-metadata TOTAL: {{ appState.issues.length }}
        span.text-metadata OPEN: {{ appState.issues.filter(i => i.status === 'Open').length }}

    .flex-1.overflow-auto.p-6
      table.w-full.border-collapse.text-left
        thead
          tr
            th.p-3.border-b.border-white_10.text-metadata(class="border-white/10") ID
            th.p-3.border-b.border-white_10.text-metadata(class="border-white/10") TITLE
            th.p-3.border-b.border-white_10.text-metadata(class="border-white/10") PRIORITY
            th.p-3.border-b.border-white_10.text-metadata(class="border-white/10") STATUS
            th.p-3.border-b.border-white_10.text-metadata(class="border-white/10") ACTIONS
        tbody
          tr.border-b.border-white_5(v-for="issue in appState.issues" :key="issue.id" class="border-white/5 hover:bg-white/[0.02]")
            td.p-3.text-xs.font-mono {{ issue.id }}
            td.p-3.font-bold {{ issue.title }}
            td.p-3
              span.px-2.py-1.rounded.font-bold(class="text-[10px]" :class="getPriorityClass(issue.priority)") {{ issue.priority }}
            td.p-3
              select.bg-transparent.outline-none.text-sm(v-model="issue.status")
                option(value="Open") Open
                option(value="In Progress") In Progress
                option(value="Resolved") Resolved
                option(value="Blocked") Blocked
            td.p-3
              button.text-redAccent.opacity-50.hover_opacity-100(@click="deleteIssue(issue.id)") ✕

</template>

<script setup>
import { reactive } from 'vue';
import { appState } from '../store/appState';

const newIssue = reactive({
  title: '',
  priority: 'Medium'
});

const addIssue = () => {
  if (!newIssue.title) return;
  appState.issues.push({
    id: 'ISS-' + Date.now().toString().slice(-4),
    projectId: appState.activeProjectId,
    title: newIssue.title,
    priority: newIssue.priority,
    status: 'Open',
    type: 'Bug'
  });
  newIssue.title = '';
};

const deleteIssue = (id) => {
  appState.issues = appState.issues.filter(i => i.id !== id);
};

const getPriorityClass = (priority) => {
  if (priority === 'Critical') return 'bg-redAccent text-white';
  if (priority === 'High') return 'bg-orange-500 text-white';
  if (priority === 'Medium') return 'bg-blue-500 text-white';
  return 'bg-gray-500 text-white';
};
</script>
