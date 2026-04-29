<template lang="pug">
.h-full.flex.flex-col.gap-6.overflow-hidden
  .glass-card.rounded-2xl.p-6.flex.justify-between.items-start.flex-shrink-0
    .flex.flex-col.gap-2
      h2.text-3xl.text-header TEAM OPERATIVES
      p.text-white_60(class="text-white/60") GLOBAL RESOURCE MATRIX
    
    //- Add Operative Form
    .flex.gap-3.items-end
      .flex.flex-col.gap-1
        label.text-metadata NAME
        input.bg-white_5.border.border-white_10.rounded.px-3.py-2.text-sm.outline-none(v-model="newOpName" placeholder="Name" class="bg-white/5 border-white/10 focus:border-redAccent")
      .flex.flex-col.gap-1
        label.text-metadata ROLE
        input.bg-white_5.border.border-white_10.rounded.px-3.py-2.text-sm.outline-none(v-model="newOpRole" placeholder="Role" class="bg-white/5 border-white/10 focus:border-redAccent")
      .flex.flex-col.gap-1
        label.text-metadata AVAIL %
        input.bg-white_5.border.border-white_10.rounded.px-3.py-2.text-sm.outline-none(v-model.number="newOpAvail" type="number" class="bg-white/5 border-white/10 focus:border-redAccent w-20")
      button.bg-redAccent.text-white.px-4.py-2.rounded.font-bold.text-sm(@click="addOperative") ENLIST

  //- Resource Matrix
  .flex-1.glass-card.rounded-2xl.overflow-hidden.flex.flex-col
    .p-6.border-b.border-white_5.flex.justify-between.items-center(class="border-white/5")
      .flex.items-center.gap-6
        .flex.items-center.gap-4
          h3.text-xl.text-header CAPACITY HEATMAP
          select.bg-white_5.border.border-white_10.rounded.px-3.py-1.text-sm.outline-none(v-model="selectedProjectId" class="bg-white/5 border-white/10")
            option(value="GLOBAL") Global Overview
            option(v-for="proj in appState.projects" :key="proj.id" :value="proj.id") {{ proj.name }}
          .flex.items-center.gap-2
            span.text-metadata RANGE:
            input.bg-white_5.border.border-white_10.rounded.px-2.py-0_5.text-xs.w-16(type="number" v-model.number="rangeDays" class="bg-white/5 border-white/10")
        .flex.bg-white_5.p-1.rounded-lg(class="bg-white/5")
          button.px-3.py-1.rounded.text-xs.font-bold.transition-colors(
            :class="viewMode === 'hours' ? 'bg-redAccent text-white' : 'text-metadata hover:text-white'"
            @click="viewMode = 'hours'"
          ) HOURS
          button.px-3.py-1.rounded.text-xs.font-bold.transition-colors(
            :class="viewMode === 'percent' ? 'bg-redAccent text-white' : 'text-metadata hover:text-white'"
            @click="viewMode = 'percent'"
          ) PERCENT
      .flex.gap-4.items-center
        .flex.items-center.gap-2
          .w-3.h-3.bg-yellow-500.rounded-sm
          span.text-metadata <50%
        .flex.items-center.gap-2
          .w-3.h-3.bg-teal-600.rounded-sm
          span.text-metadata 50-100%
        .flex.items-center.gap-2
          .w-3.h-3.bg-redAccent.rounded-sm
          span.text-metadata >100%

    .flex-1.overflow-auto.p-6
      table.w-full.border-collapse.text-left.whitespace-nowrap
        thead
          tr
            th.p-3.border-b.border-white_10.text-metadata OPERATIVE
            th.p-3.border-b.border-white_10.text-metadata ROLE
            th.p-3.border-b.border-white_10.text-metadata AVAIL %
            th.p-3.border-b.border-white_10.text-metadata CAP/DAY
            th.p-3.border-b.border-white_10.text-metadata.text-center(v-for="d in heatmapData.dates" :key="d") {{ formatShortDate(d) }}
            th.p-3.border-b.border-white_10.text-metadata ACTIONS
        tbody
          tr.border-b.border-white_5(v-for="op in appState.operatives" :key="op.id" class="border-white/5 hover:bg-white/[0.02]")
            td.p-3.font-bold.text-sm {{ op.name }}
            td.p-3: input.bg-transparent.outline-none.text-sm.w-32(v-model="op.role")
            td.p-3: input.bg-transparent.outline-none.w-12.text-sm(v-model.number="op.availability" type="number")
            td.p-3.text-metadata {{ (op.dailyCapacity * op.availability / 100).toFixed(1) }}h
            td.p-0.relative(v-for="d in heatmapData.dates" :key="d" class="border-l border-white/5")
              .absolute.inset-0.opacity-70(:style="{ backgroundColor: getHeatmapColor(heatmapData.heatmap[op.id][d]?.saturation || 0) }")
              .flex.items-center.justify-center.h-full.relative.z-10.py-3
                span.text-xs.font-bold(:class="getSaturationTextColor(heatmapData.heatmap[op.id][d]?.saturation || 0)")
                  | {{ viewMode === 'hours' ? Math.round(heatmapData.heatmap[op.id][d]?.hoursAssigned || 0) + 'h' : Math.round((heatmapData.heatmap[op.id][d]?.saturation || 0) * 100) + '%' }}
            td.p-3: button.text-redAccent.opacity-50.hover_opacity-100(@click="deleteOperative(op.id)") ✕
</template>

<script setup>
import { ref, computed } from "vue";
import { appState, getResourceHeatmap } from "../store/appState";
import { format, parseISO } from "date-fns";

const newOpName = ref("");
const newOpRole = ref("");
const newOpAvail = ref(100);
const selectedProjectId = ref("GLOBAL");
const viewMode = ref("hours");
const rangeDays = ref(14);

const addOperative = () => {
  if (!newOpName.value) return;
  appState.operatives.push({
    id: "o" + Date.now(),
    name: newOpName.value,
    role: newOpRole.value || "Specialist",
    dailyCapacity: 8,
    availability: newOpAvail.value || 100,
  });
  newOpName.value = "";
  newOpRole.value = "";
};

const deleteOperative = (id) => {
  if (confirm("Permanently remove this resource?")) appState.operatives = appState.operatives.filter((o) => o.id !== id);
};

const heatmapData = computed(() => {
  let start = new Date().toISOString();
  if (selectedProjectId.value !== "GLOBAL") {
    const proj = appState.projects.find((p) => p.id === selectedProjectId.value);
    if (proj) start = proj.startDate;
  }
  return getResourceHeatmap(start, rangeDays.value);
});

const formatShortDate = (d) => format(parseISO(d), "MMM d");
const getHeatmapColor = (s) => s === 0 ? "transparent" : (s < 0.5 ? "#EAB308" : (s <= 1.0 ? "#0D9488" : "#E01E2E"));
const getSaturationTextColor = (s) => s === 0 ? "text-transparent" : (s < 0.5 ? "text-black" : "text-white");
</script>
