<template lang="pug">
.h-full.flex.flex-col.gap-8.overflow-hidden
  //- Header Section
  .flex.justify-between.items-end.flex-shrink-0
    .flex.flex-col.gap-1
      label.label-muted Human Resources
      h2.text-3xl.font-bold.text-appText TEAM OPERATIVES

    .flex.gap-4.items-end
      .flex.flex-col.gap-1
        label.label-muted NAME
        input.input-field(v-model="newOpName" placeholder="Full name")
      .flex.flex-col.gap-1
        label.label-muted ROLE
        input.input-field(v-model="newOpRole" placeholder="Position")
      .flex.flex-col.gap-1
        label.label-muted AVAIL %
        input.input-field.w-24(v-model.number="newOpAvail" type="number" min="0" max="100")
      button.btn-primary.text-sm(@click="addOperative") ENLIST

  //- Resource Matrix
  .flex-1.bg-appBgSoft.rounded-3xl.border.border-appBorder.overflow-hidden.flex.flex-col
    .p-6.border-b.border-appBorder.flex.justify-between.items-center
      .flex.items-center.gap-8
        h3.text-sm.font-bold.text-appText CAPACITY HEATMAP

        .flex.items-center.gap-4
          select.bg-appBg.border.border-appBorder.rounded-xl.px-3.py-1.text-xs.font-bold.outline-none.cursor-pointer.hover_border-purple-brand.transition-all(v-model="selectedProjectId")
            option(value="GLOBAL") Global Overview
            option(v-for="proj in appState.projects" :key="proj.id" :value="proj.id") {{ proj.name }}

          .flex.items-center.gap-2
            span.label-muted RANGE:
            input.bg-appBg.border.border-appBorder.rounded-lg(class="px-2 py-0.5").text-xs.w-16.font-bold(type="number" v-model.number="rangeDays" min="1" max="90")

        .flex.bg-appBg.p-1.rounded-xl.border.border-appBorder
          button.px-3.py-1.rounded-lg.text-xs.font-bold.transition-all(
            v-for="mode in viewModes"
            :key="mode.value"
            :class="viewMode === mode.value ? 'bg-appBgSoft text-appText shadow-sm' : 'text-appTextMuted hover:text-appText'"
            @click="viewMode = mode.value"
          ) {{ mode.label }}

      .flex.gap-6.items-center
        .flex.items-center.gap-2(v-for="legend in legendItems" :key="legend.label")
          .w-2.h-2.rounded-full(:class="legend.colorClass")
          span.label-muted {{ legend.label }}

    .flex-1.overflow-auto.p-6
      table.w-full.border-collapse.text-left.whitespace-nowrap
        thead.bg-appBg.text-appTextMuted.sticky.top-0.z-20
          tr
            th.th-cell OPERATIVE
            th.th-cell ROLE
            th.th-cell AVAIL %
            th.th-cell CAP/DAY
            th.th-cell.text-center(v-for="d in heatmapData.dates" :key="d") {{ formatShortDate(d) }}
            th.th-cell ACTIONS
        tbody
          tr.border-b.border-appBorder(v-for="op in appState.operatives" :key="op.id" class="hover:bg-purple-brand/5")
            td.p-4
              .flex.items-center.gap-3
                .w-8.h-8.rounded-full.flex.items-center.justify-center.text-xs.font-bold(class="bg-purple-brand/10 text-purple-brand") {{ op.name[0] }}
                span.font-bold.text-sm {{ op.name }}
            td.p-4: input.bg-transparent.outline-none.text-xs.font-bold.text-appText.w-32(v-model="op.role")
            td.p-4: input.bg-transparent.outline-none.w-12.text-xs.font-bold.text-appText(v-model.number="op.availability" type="number" min="0" max="100")
            td.p-4.label-muted {{ effectiveCapacity(op) }}h
            td.p-0.relative(v-for="d in heatmapData.dates" :key="d" class="border-l border-appBorder")
              .absolute.inset-0.opacity-70(:style="{ backgroundColor: getHeatmapColor(getCellSaturation(op.id, d)) }")
              .flex.items-center.justify-center.h-full.relative.z-10.py-4
                span.text-xs.font-bold(:class="getSaturationTextColor(getCellSaturation(op.id, d))")
                  | {{ formatCellValue(op.id, d) }}
            td.p-4
              button.text-appTextMuted.hover_text-raspberry.transition-colors(@click="deleteOperative(op.id)")
                Trash2Icon(:size="16")
</template>

<script setup>
import { ref, computed } from "vue";
import { appState, getResourceHeatmap } from "../store/appState";
import { format, parseISO } from "date-fns";
import { Trash2 as Trash2Icon } from "lucide-vue-next";

// --- Form state ---
const newOpName = ref("");
const newOpRole = ref("");
const newOpAvail = ref(100);
const selectedProjectId = ref("GLOBAL");
const viewMode = ref("hours");
const rangeDays = ref(14);

// --- Static config (no reactivity needed) ---
const viewModes = [
  { value: "hours", label: "HOURS" },
  { value: "percent", label: "PERCENT" },
];

const legendItems = [
  { label: "UNDER", colorClass: "bg-tuscany" },
  { label: "OPTIMAL", colorClass: "bg-purple-brand" },
  { label: "OVER", colorClass: "bg-raspberry" },
];

// --- Actions ---
const addOperative = () => {
  const name = newOpName.value.trim();
  if (!name) return;
  const availability = Math.max(0, Math.min(100, newOpAvail.value || 100));
  appState.operatives.push({
    id: `o${Date.now()}`,
    name,
    role: newOpRole.value.trim() || "Specialist",
    dailyCapacity: 8,
    availability,
  });
  newOpName.value = "";
  newOpRole.value = "";
  newOpAvail.value = 100;
};

const deleteOperative = (id) => {
  if (confirm("Permanently remove this resource?")) {
    appState.operatives = appState.operatives.filter((o) => o.id !== id);
  }
};

// --- Computed data ---
const heatmapData = computed(() => {
  let start = new Date().toISOString();
  if (selectedProjectId.value !== "GLOBAL") {
    const proj = appState.projects.find((p) => p.id === selectedProjectId.value);
    if (proj) start = proj.startDate;
  }
  return getResourceHeatmap(start, rangeDays.value);
});

// --- Helpers (keep template clean) ---
const effectiveCapacity = (op) =>
  ((op.dailyCapacity * op.availability) / 100).toFixed(1);

const getCellData = (opId, date) =>
  heatmapData.value.heatmap[opId]?.[date] ?? null;

const getCellSaturation = (opId, date) =>
  getCellData(opId, date)?.saturation ?? 0;

const formatCellValue = (opId, date) => {
  const cell = getCellData(opId, date);
  if (viewMode.value === "hours") {
    return `${Math.round(cell?.hoursAssigned ?? 0)}h`;
  }
  return `${Math.round((cell?.saturation ?? 0) * 100)}%`;
};

const formatShortDate = (d) => format(parseISO(d), "MMM d");

const HEATMAP_COLORS = { under: "#FBC06D", optimal: "#7F24DD", over: "#FB006D" };

const getHeatmapColor = (s) => {
  if (s === 0) return "transparent";
  if (s < 0.5) return HEATMAP_COLORS.under;
  if (s <= 1.0) return HEATMAP_COLORS.optimal;
  return HEATMAP_COLORS.over;
};

const getSaturationTextColor = (s) =>
  s === 0 ? "text-transparent" : s < 0.5 ? "text-appBg" : "text-white";
</script>

<style scoped>
/* Extracted repeated class patterns to reduce template verbosity */
.label-muted {
  @apply text-[10px] font-bold text-appTextMuted uppercase tracking-widest;
}
.input-field {
  @apply bg-appBgSoft border border-appBorder rounded-xl px-4 py-2 text-sm
    outline-none text-appText transition-all;
}
.input-field:focus {
  @apply border-purple-brand;
}
.th-cell {
  @apply p-4 text-[10px] font-bold uppercase tracking-widest;
}
</style>
