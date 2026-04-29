<template lang="pug">
.h-full.flex.flex-col.gap-6.overflow-y-auto.pr-2
  .glass-card.rounded-2xl.p-8.flex.flex-col.gap-8
    .flex.flex-col.gap-2
      h2.text-4xl.text-header ADVANCED OPERATIONAL MANUAL
      p.text-metadata(class="text-opacity-60") PROJECT SCHEDULING, RESOURCE ALLOCATION & SYSTEM LOGIC

    .grid.grid-cols-1.gap-10
      //- Section 01: Dependency Types
      section.flex.flex-col.gap-4
        h3.text-2xl.text-redAccent 01. DEPENDENCY RELATIONSHIPS
        .glass-panel.rounded-xl.p-6.flex.flex-col.gap-6
          p.text-sm.leading-relaxed
            | The scheduling engine automates start and end dates based on logical relationships between tasks.
          .grid.grid-cols-2.gap-4
            .p-4.bg-white_5.rounded-lg(class="bg-white/5")
              h4.font-bold.text-redAccent FS: FINISH-TO-START
              p.text-xs.mt-1 Standard sequential logic. Successor can only start after the Predecessor is finished.
              p.text-metadata.mt-2(class="text-[10px]") Formula: Start(B) = End(A) + 1 + Lag
            .p-4.bg-white_5.rounded-lg(class="bg-white/5")
              h4.font-bold.text-redAccent SS: START-TO-START
              p.text-xs.mt-1 Parallel execution. Successor starts when the Predecessor starts.
              p.text-metadata.mt-2(class="text-[10px]") Formula: Start(B) = Start(A) + Lag
            .p-4.bg-white_5.rounded-lg(class="bg-white/5")
              h4.font-bold.text-redAccent FF: FINISH-TO-FINISH
              p.text-xs.mt-1 Joint completion. Successor finishes exactly when the Predecessor finishes.
              p.text-metadata.mt-2(class="text-[10px]") Formula: End(B) = End(A) + Lag
            .p-4.bg-white_5.rounded-lg(class="bg-white/5")
              h4.font-bold.text-redAccent SF: START-TO-FINISH
              p.text-xs.mt-1 Reverse logic. Successor cannot finish until the Predecessor has started.
              p.text-metadata.mt-2(class="text-[10px]") Formula: End(B) = Start(A) + Lag

      //- Section 02: Heatmap & Availability
      section.flex.flex-col.gap-4
        h3.text-2xl.text-redAccent 02. RESOURCE SATURATION LOGIC
        .glass-panel.rounded-xl.p-6.flex.flex-col.gap-4
          p.text-sm.leading-relaxed
            | The Resource Heatmap calculates load based on individual **Availability Percentages** where 100% = 8 Hours/Day.
          .grid.grid-cols-3.gap-4
            .p-4.bg-redAccent.text-white.rounded-lg
              h4.font-bold.text-xs RED: OVER-CAPACITY
              p(class="text-[10px]") Utilization > Availability. 
              p.mt-1(class="text-[10px]") e.g. Assigned 8hrs to a 50% available person.
            .p-4.bg-yellow-500.text-black.rounded-lg
              h4.font-bold.text-xs YELLOW: UNDER-UTILIZED
              p(class="text-[10px]") Utilization < 50% of available capacity.
            .p-4.bg-teal-600.text-white.rounded-lg
              h4.font-bold.text-xs GREEN: NOMINAL
              p(class="text-[10px]") Healthy workload between 50% and 100% capacity.

      //- Section 03: WBS & Parent Rollups
      section.flex.flex-col.gap-4
        h3.text-2xl.text-redAccent 03. WBS & AUTOMATED ROLLUPS
        .glass-panel.rounded-xl.p-6.flex.flex-col.gap-4
          p.text-sm.leading-relaxed
            | **Parent Tasks** (Summary Tasks) are read-only containers that aggregate subtask data:
          ul.list-disc.list-inside.text-xs.flex.flex-col.gap-2.text-metadata
            li **Start Day**: The earliest start day among all children.
            li **End Day**: The latest end day among all children.
            li **Progress**: The simple average progress of all associated subtasks.
            li **Duration**: The total span from the first child start to the last child finish.

    .mt-8.pt-8.border-t.border-white_10.flex.justify-between.items-center(class="border-white/10")
      span.text-metadata PANOPTICON OS v3.2.0
      .flex.gap-6
        button.text-xs.text-redAccent.font-bold DRAG & DROP ENABLED
        button.text-xs.text-metadata THEME-AWARE UI
</template>

<script setup>
</script>
