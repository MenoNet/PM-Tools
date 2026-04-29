<template lang="pug">
.h-full.flex.flex-col.gap-6.overflow-hidden
  .glass-card.rounded-2xl.p-6.flex.justify-between.items-start.flex-shrink-0
    .flex.flex-col.gap-2
      h2.text-3xl.text-header TEAM OPERATIVES
      p.text-metadata GLOBAL RESOURCE MATRIX
    
    //- Add Operative Form
    .flex.gap-3.items-end
      .flex.flex-col.gap-1
        label.text-metadata NAME
        input.bg-white_5.border.border-white_10.rounded.px-3.py-2.text-sm.outline-none(v-model="newOpName" placeholder="Name" class="bg-white/5 border-white/10 focus:border-redAccent")
      .flex.flex-col.gap-1
        label.text-metadata AVAILABILITY %
        input.bg-white_5.border.border-white_10.rounded.px-3.py-2.text-sm.outline-none(v-model.number="newOpAvail" type="number" class="bg-white/5 border-white/10 focus:border-redAccent")
      button.bg-redAccent.text-white.px-4.py-2.rounded.font-bold.text-sm(@click="addOperative") ENLIST

  //- Resource Matrix
  .flex-1.glass-card.rounded-2xl.overflow-hidden.flex.flex-col
    .p-6.border-b.border-white_5.flex.justify-between.items-center(class="border-white/5")
      .flex.items-center.gap-4
        h3.text-xl.text-header CAPACITY HEATMAP
        select.bg-white_5.border.border-white_10.rounded.px-3.py-1.text-sm.outline-none(v-model="selectedProjectId" class="bg-white/5 border-white/10")
          option(value="GLOBAL") Global Overview
          option(v-for="proj in appState.projects" :key="proj.id" :value="proj.id") {{ proj.name }}
      
      .flex.gap-4.items-center
        .flex.items-center.gap-2
          .w-3.h-3.bg-yellow-500.rounded-sm
          span.text-metadata LOW UTIL
        .flex.items-center.gap-2
          .w-3.h-3.bg-teal-600.rounded-sm
          span.text-metadata NOMINAL
        .flex.items-center.gap-2
          .w-3.h-3.bg-redAccent.rounded-sm
          span.text-metadata OVERLOAD

    .flex-1.overflow-auto.p-6
      table.w-full.border-collapse.text-left
        thead
          tr
            th.p-3.border-b.border-white_10.text-metadata(class="border-white/10") OPERATIVE
            th.p-3.border-b.border-white_10.text-metadata(class="border-white/10") AVAIL %
            th.p-3.border-b.border-white_10.text-metadata.text-center(v-for="d in heatmapData.dates" :key="d" class="border-white/10") {{ formatShortDate(d) }}
        tbody
          tr.border-b.border-white_5(v-for="op in appState.operatives" :key="op.id" class="border-white/5 hover:bg-white/[0.02]")
            td.p-3.font-bold {{ op.name }}
            td.p-3
              input.bg-transparent.outline-none.w-12.text-sm(v-model.number="op.availability" type="number")
            td.p-0.relative(v-for="d in heatmapData.dates" :key="d" class="border-l border-white/5")
              .absolute.inset-0.opacity-70(:style="{ backgroundColor: getHeatmapColor(heatmapData.heatmap[op.id][d]?.saturation || 0) }")
              .flex.items-center.justify-center.h-full.relative.z-10.py-3
                span.text-xs.font-bold(:class="getSaturationTextColor(heatmapData.heatmap[op.id][d]?.saturation || 0)")
                  | {{ Math.round((heatmapData.heatmap[op.id][d]?.saturation || 0) * 100) }}%

</template>

<script setup>
import { ref, computed } from 'vue';
import { appState, getResourceHeatmap } from '../store/appState';
import { format, parseISO, addDays } from 'date-fns';

const newOpName = ref('');
const newOpAvail = ref(100);
const selectedProjectId = ref('GLOBAL');

const addOperative = () => {
  if (!newOpName.value) return;
  appState.operatives.push({
    id: 'o' + Date.now(),
    name: newOpName.value,
    role: 'Agent',
    dailyCapacity: 8,
    availability: newOpAvail.value || 100
  });
  newOpName.value = '';
};

const heatmapData = computed(() => {
  let startDateStr = new Date().toISOString();
  if (selectedProjectId.value !== 'GLOBAL') {
    const proj = appState.projects.find(p => p.id === selectedProjectId.value);
    if (proj) startDateStr = proj.startDate;
  }
  return getResourceHeatmap(startDateStr, 14);
});

const formatShortDate = (dateStr) => format(parseISO(dateStr), 'MMM d');

const getHeatmapColor = (saturation) => {
  if (saturation === 0) return 'transparent';
  if (saturation < 0.5) return '#EAB308'; // Yellow-500
  if (saturation <= 1.0) return '#0D9488'; // Teal-600
  return '#E01E2E'; // redAccent
};

const getSaturationTextColor = (saturation) => {
  if (saturation === 0) return 'text-transparent';
  if (saturation < 0.5) return 'text-black';
  return 'text-white';
};
</script>
