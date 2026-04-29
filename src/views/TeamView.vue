<template lang="pug">
.h-full.flex.flex-col.gap-6
  .glass-card.rounded-2xl.p-6.flex.justify-between.items-start.flex-shrink-0
    .flex.flex-col.gap-2
      h2.text-3xl.text-header TEAM OPERATIVES
      p.text-white_60(class="text-white/60") Global Resource Matrix
    
    //- Add Operative Form
    .flex.gap-3.items-end
      .flex.flex-col.gap-1
        label.text-metadata NEW OPERATIVE
        input.bg-white_5.border.border-white_10.rounded.px-3.py-2.text-sm.outline-none.text-white(v-model="newOpName" placeholder="Name" class="bg-white/5 border-white/10")
      .flex.flex-col.gap-1
        label.text-metadata ROLE
        input.bg-white_5.border.border-white_10.rounded.px-3.py-2.text-sm.outline-none.text-white(v-model="newOpRole" placeholder="Role" class="bg-white/5 border-white/10")
      button.bg-redAccent.text-white.px-4.py-2.rounded.font-bold.text-sm.hover_bg-red-700.transition-colors(@click="addOperative" class="hover:bg-red-700") ENLIST

  //- Resource Matrix
  .flex-1.glass-card.rounded-2xl.overflow-hidden.flex.flex-col
    .p-6.border-b.border-white_5.flex.justify-between.items-center(class="border-white/5")
      h3.text-xl.text-header CAPACITY HEATMAP
      .flex.gap-4.items-center
        .flex.items-center.gap-2
          .w-3.h-3.bg-white_10.rounded-sm(class="bg-white/10")
          span.text-metadata NOMINAL
        .flex.items-center.gap-2
          .w-3.h-3.bg-redAccent.rounded-sm
          span.text-metadata OVER CAPACITY

    .flex-1.overflow-auto.p-6
      table.w-full.border-collapse.text-left
        thead
          tr
            th.p-3.border-b.border-white_10.text-metadata OPERATIVE(class="border-white/10")
            th.p-3.border-b.border-white_10.text-metadata ROLE(class="border-white/10")
            th.p-3.border-b.border-white_10.text-metadata.text-center(v-for="d in heatmapData.dates" :key="d" class="border-white/10") {{ formatShortDate(d) }}
        tbody
          tr.border-b.border-white_5(v-for="op in appState.operatives" :key="op.id" class="border-white/5 hover:bg-white/[0.02]")
            td.p-3.font-bold {{ op.name }}
            td.p-3.text-white_60.text-sm(class="text-white/60") {{ op.role }}
            td.p-0.relative(v-for="d in heatmapData.dates" :key="d" class="border-l border-white/5")
              .absolute.inset-0.opacity-50.transition-colors(:style="{ backgroundColor: getHeatmapColor(heatmapData.heatmap[op.id][d]?.saturation || 0) }")
              .flex.items-center.justify-center.h-full.relative.z-10
                span.text-xs.font-bold(:class="{'text-white': (heatmapData.heatmap[op.id][d]?.saturation || 0) > 0, 'text-transparent': (heatmapData.heatmap[op.id][d]?.saturation || 0) === 0}")
                  | {{ Math.round((heatmapData.heatmap[op.id][d]?.saturation || 0) * 100) }}%

</template>

<script setup>
import { ref, computed } from 'vue';
import { appState, getResourceHeatmap } from '../store/appState';
import { format, parseISO } from 'date-fns';

const newOpName = ref('');
const newOpRole = ref('');

const addOperative = () => {
  if (!newOpName.value) return;
  appState.operatives.push({
    id: 'o' + Date.now(),
    name: newOpName.value,
    role: newOpRole.value || 'Agent',
    dailyCapacity: 8
  });
  newOpName.value = '';
  newOpRole.value = '';
};

// Generate a 14 day heatmap starting from the active project start date or today
const heatmapData = computed(() => {
  const startDate = appState.projects.length > 0 ? appState.projects[0].startDate : new Date();
  return getResourceHeatmap(startDate, 14);
});

const formatShortDate = (dateStr) => {
  return format(parseISO(dateStr), 'MMM d');
};

const getHeatmapColor = (saturation) => {
  if (saturation === 0) return 'transparent';
  if (saturation <= 0.5) return 'rgba(255,255,255,0.1)';
  if (saturation <= 1) return 'rgba(255,255,255,0.3)';
  return 'rgba(224,30,46,0.8)'; // Solid Red for Over Capacity
};
</script>
