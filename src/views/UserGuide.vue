<template lang="pug">
.h-full.flex.gap-8.overflow-hidden.p-2
  //- Sticky Side Navigation for quick jump
  aside.w-64.flex-shrink-0.flex.flex-col.gap-4.sticky.top-0
    .glass-card.rounded-2xl.p-6.flex.flex-col.gap-6
      h4.text-header.text-xs.contents-label(class="tracking-[0.2em]") CONTENTS
      nav.flex.flex-col.gap-2
        a.text-sm.text-metadata.hover_text-white.transition-all(
          v-for="section in guideSections" 
          :key="section.id"
          :href="'#' + section.id"
          class="hover:translate-x-1"
        ) {{ section.title }}
    
    .glass-panel.rounded-2xl.p-6.flex.flex-col.gap-3
      span.text-metadata(class="text-[10px]") SYSTEM STATUS
      .flex.items-center.gap-2
        .w-2.h-2.rounded-full.bg-green-500.animate-pulse
        span.text-xs.font-bold DEPLOYED & STABLE
      p.text-metadata.mt-2(class="text-[10px]") VERSION 4.0.0 (MYT)

  //- Main Scrollable Content
  .flex-1.overflow-y-auto.pr-4.scroll-smooth
    .flex.flex-col.gap-12.pb-20
      //- Header Section
      header.flex.flex-col.gap-4
        .flex.items-center.gap-4
          .w-12.h-12.rounded-xl.bg-redAccent.flex.items-center.justify-center.shadow-lg
            BookOpenIcon.text-white(:size="24")
          .flex.flex-col
            h1.text-4xl.text-header DEKODE PM TOOLS
            p.text-metadata.tracking-widest OPERATIONAL PROTOCOLS & MANUAL
        
        .glass-panel.rounded-2xl.p-6(class="bg-redAccent/5 border-redAccent/20")
          p.text-sm.leading-relaxed.text-white_80(class="text-white/80")
            | Welcome to the Dekode command deck. This manual provides the strategic and tactical logic required to operate the multi-project control suite. 
            | The system is designed to separate high-level scheduling from granular daily execution.

      //- Section 01: Navigation
      section#navigation.flex.flex-col.gap-6
        .flex.items-center.gap-3
          span.text-3xl.font-black.text-redAccent 01
          h2.text-2xl.text-header NAVIGATION ARCHITECTURE
        
        .grid.grid-cols-2.gap-6
          .glass-card.p-6.rounded-2xl.flex.flex-col.gap-4.border-white_5(class="border-white/5")
            .flex.items-center.gap-3
              LayoutDashboardIcon.text-redAccent(:size="20")
              h3.font-bold DASHBOARD CONTROL
            p.text-sm.text-metadata.leading-relaxed
              | The primary intelligence hub. View global portfolio health, active blockers, and upcoming deadlines. 
              | Use the **Context Selector** to filter between the entire organization or a specific initiative.
          
          .glass-card.p-6.rounded-2xl.flex.flex-col.gap-4.border-white_5(class="border-white/5")
            .flex.items-center.gap-3
              BriefcaseIcon.text-redAccent(:size="20")
              h3.font-bold PROJECT PORTFOLIO
            p.text-sm.text-metadata.leading-relaxed
              | The registry for all active initiatives. From here, you can dive into deep project controls including WBS, 
              | Gantt timelines, and tactical task management.

      //- Section 02: Strategic vs Tactical
      section#execution.flex.flex-col.gap-6
        .flex.items-center.gap-3
          span.text-3xl.font-black.text-redAccent 02
          h2.text-2xl.text-header STRATEGIC vs TACTICAL EXECUTION
        
        .glass-panel.p-8.rounded-3xl.flex.flex-col.gap-8
          .flex.flex-col.gap-4
            h3.text-lg.font-bold.text-white THE SCHEDULING ENGINE (WBS)
            p.text-sm.text-metadata.leading-relaxed
              | The **Work Breakdown Structure (WBS)** is the project's skeleton. It defines the "When" and "How Long." 
              | It supports complex dependency logic (FS, SS, FF, SF) and automatically calculates the **Critical Path**.
            .bg-white_5.p-4.rounded-xl.border(class="bg-white/5 border-white/10")
              p.text-xs.italic.text-white_60
                | "Strategic tasks represent project milestones and phases. They should be high-level and duration-based."

          .flex.flex-col.gap-4
            h3.text-lg.font-bold.text-white THE CONDUCT ENGINE (TASKS)
            p.text-sm.text-metadata.leading-relaxed
              | **Task Management** handles the "What." These are granular, daily action items that do not necessarily 
              | impact the critical path but are vital for completion. 
            .flex.flex-col.gap-2.bg-redAccent_5.p-4.rounded-xl.border(class="bg-redAccent/5 border-redAccent/10")
              p.text-xs.font-bold.text-redAccent TACTICAL FEATURES:
              ul.list-disc.list-inside.text-metadata.flex.flex-col.gap-1(class="text-[11px]")
                li Nested Checklists / Action Items
                li Specific Calendar Deadlines
                li Individual Assignee Assignments
                li Rich Text Descriptions

      //- Section 03: Resource Health
      section#resources.flex.flex-col.gap-6
        .flex.items-center.gap-3
          span.text-3xl.font-black.text-redAccent 03
          h2.text-2xl.text-header RESOURCE HEALTH & SATURATION
        
        .grid.grid-cols-2.gap-6
          .flex.flex-col.gap-4
            p.text-sm.text-metadata.leading-relaxed
              | A project's success depends on operative availability. The **Heatmap** provides a 
              | saturation-aware view of team load.
            .glass-panel.p-4.rounded-xl.flex.flex-col.gap-4
              h4.text-xs.font-bold INDICATOR LOGIC
              .flex.flex-col.gap-3
                .flex.items-center.gap-3
                  .w-3.h-3.rounded-full.bg-green-500
                  span.text-xs.text-metadata < 70% Saturation (Nominal)
                .flex.items-center.gap-3
                  .w-3.h-3.rounded-full.bg-yellow-500
                  span.text-xs.text-metadata 70% - 90% Saturation (Warning)
                .flex.items-center.gap-3
                  .w-3.h-3.rounded-full.bg-redAccent
                  span.text-xs.text-metadata > 90% Saturation (Overload)

          .glass-card.p-6.rounded-2xl.border-white_5(class="border-white/5")
            h4.font-bold.mb-4.text-sm DYNAMIC ASSIGNMENT
            p.text-sm.text-metadata.leading-relaxed
              | When assigning tasks or issues, the system displays a real-time capacity pulse next to each operative. 
              | Avoid assigning "Red" operatives to maintain team health.

      //- Section 04: Risk Mitigation
      section#risks.flex.flex-col.gap-6
        .flex.items-center.gap-3
          span.text-3xl.font-black.text-redAccent 04
          h2.text-header.text-2xl RISK MITIGATION (ISSUES)
        
        .glass-panel.p-6.rounded-2xl.flex.flex-col.gap-4
          p.text-sm.text-metadata.leading-relaxed
            | The **Issues** module is for tracking impediments that stop work. Issues are distinct from tasks 
            | as they represent risks that require resolution plans.
          .grid.grid-cols-3.gap-4.mt-2
            .p-4.bg-white_5.rounded-xl(class="bg-white/5")
              h5.font-bold.text-xs IDENTIFY
              p.text-metadata(class="text-[10px]") Log the root cause and priority level.
            .p-4.bg-white_5.rounded-xl(class="bg-white/5")
              h5.font-bold.text-xs ESCALATE
              p.text-metadata(class="text-[10px]") Critical issues appear on the global dashboard.
            .p-4.bg-white_5.rounded-xl(class="bg-white/5")
              h5.font-bold.text-xs RESOLVE
              p.text-metadata(class="text-[10px]") Track action items until the impediment is cleared.

      footer.mt-12.pt-8.border-t.border-white_10.flex.justify-between.items-center(class="border-white/10")
        p.text-metadata(class="text-[10px]") © 2026 DEKODE PM TOOLS // ALL RIGHTS RESERVED
        p.text-metadata(class="text-[10px]") ENCRYPTED PROTOCOL 0x77-A
</template>

<script setup>
import { 
  BookOpen as BookOpenIcon,
  LayoutDashboard as LayoutDashboardIcon,
  Briefcase as BriefcaseIcon,
  Users as UsersIcon,
  Zap as ZapIcon,
  Activity as ActivityIcon,
  ShieldAlert as ShieldAlertIcon
} from "lucide-vue-next";

const guideSections = [
  { id: 'navigation', title: '01 Navigation Architecture' },
  { id: 'execution', title: '02 Strategic vs Tactical' },
  { id: 'resources', title: '03 Resource Health' },
  { id: 'risks', title: '04 Risk Mitigation' },
];
</script>

<style scoped>
/* Ensure high readability for guide text */
p {
  font-family: 'Inter', sans-serif;
  letter-spacing: 0.01em;
}

h1, h2, h3, h4 {
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
}

.text-header {
  letter-spacing: 0.05em;
}

/* Smooth scrolling for anchor links */
.scroll-smooth {
  scroll-behavior: smooth;
}

/* Scrollbar styling for the guide */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(224, 30, 46, 0.2);
  border-radius: 10px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(224, 30, 46, 0.4);
}
</style>
