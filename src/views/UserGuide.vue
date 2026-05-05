<template lang="pug">
.h-full.flex.gap-10.overflow-hidden
  //- Sticky Side Navigation
  aside.w-64.flex-shrink-0.flex.flex-col.gap-6.sticky.top-0
    .bg-appBgSoft.rounded-3xl.p-8.flex.flex-col.gap-8.border.border-appBorder
      h4(class="text-[10px]").font-bold.text-appTextMuted.uppercase.tracking-widest CONTENTS
      nav.flex.flex-col.gap-3
        a.text-xs.font-bold.text-appTextMuted.hover_text-purple-brand.transition-all(
          v-for="section in guideSections" 
          :key="section.id"
          :href="'#' + section.id"
          class="hover:translate-x-1"
        ) {{ section.title }}
    
    .bg-appBgSoft.rounded-3xl.p-8.flex.flex-col.gap-3.border.border-appBorder
      span(class="text-[10px]").font-bold.text-appTextMuted SYSTEM STATUS
      .flex.items-center.gap-2
        .w-2.h-2.rounded-full.bg-green-500.animate-pulse
        span.text-xs.font-bold.text-appText OPERATIONAL
      p(class="text-[10px]").font-bold.text-appTextMuted.mt-2 VERSION 5.0.0 (MYT)

  //- Main Scrollable Content
  .flex-1.overflow-y-auto.pr-4.scroll-smooth
    .flex.flex-col.gap-20.pb-32
      //- Header Section
      header.flex.flex-col.gap-6
        .flex.items-center.gap-6
          .w-16.h-16.rounded-2xl.bg-purple-brand.flex.items-center.justify-center.shadow-premium
            BookOpenIcon.text-white(:size="32")
          .flex.flex-col
            h1.text-4xl.font-black.text-appText COMMAND MANUAL
            p(class="text-[10px]").font-bold.text-appTextMuted.uppercase.tracking-widest.mt-1 Operational Protocols & Systems Guide
        
        .rounded-3xl.p-8(class="bg-purple-brand/5 border border-purple-brand/10")
          p.text-sm.leading-relaxed.text-appText.font-medium
            | Welcome to the Dekode command deck. This manual provides the strategic and tactical logic required to operate the multi-project control suite. 
            | The system is designed to separate high-level scheduling from granular daily execution.

      //- Section 01: Navigation
      section#navigation.flex.flex-col.gap-8
        .flex.items-center.gap-4
          span.text-4xl.font-black.text-purple-brand 01
          h2.text-2xl.font-bold.text-appText NAVIGATION ARCHITECTURE
        
        .grid.grid-cols-2.gap-8
          .bg-appBgSoft.p-8.rounded-3xl.flex.flex-col.gap-4.border.border-appBorder
            .flex.items-center.gap-3
              LayoutDashboardIcon.text-purple-brand(:size="24")
              h3.text-lg.font-bold.text-appText DASHBOARD CONTROL
            p.text-sm.text-appTextMuted.leading-relaxed.font-medium
              | The primary intelligence hub. View global portfolio health, active blockers, and upcoming deadlines. 
              | Use the **Context Selector** to filter between the entire organization or a specific initiative.
          
          .bg-appBgSoft.p-8.rounded-3xl.flex.flex-col.gap-4.border.border-appBorder
            .flex.items-center.gap-3
              BriefcaseIcon.text-purple-brand(:size="24")
              h3.text-lg.font-bold.text-appText PROJECT PORTFOLIO
            p.text-sm.text-appTextMuted.leading-relaxed.font-medium
              | The registry for all active initiatives. From here, you can dive into deep project controls including WBS, 
              | Gantt timelines, and tactical task management.

      //- Section 02: Strategic vs Tactical
      section#execution.flex.flex-col.gap-8
        .flex.items-center.gap-4
          span.text-4xl.font-black.text-purple-brand 02
          h2.text-2xl.font-bold.text-appText STRATEGIC vs TACTICAL EXECUTION
        
        .bg-appBgSoft.p-10.rounded-4xl.flex.flex-col.gap-10.border.border-appBorder
          .flex.flex-col.gap-4
            h3.text-xl.font-bold.text-appText THE SCHEDULING ENGINE (WBS)
            p.text-sm.text-appTextMuted.leading-relaxed.font-medium
              | The **Work Breakdown Structure (WBS)** is the project's skeleton. It defines the "When" and "How Long." 
              | It supports complex dependency logic (FS, SS, FF, SF) and automatically calculates the **Critical Path**.
            .bg-appBg.p-4.rounded-2xl.border.border-appBorder
              p.text-xs.italic.text-appTextMuted
                | "Strategic tasks represent project milestones and phases. They should be high-level and duration-based."

          .flex.flex-col.gap-4
            h3.text-xl.font-bold.text-appText THE CONDUCT ENGINE (TASKS)
            p.text-sm.text-appTextMuted.leading-relaxed.font-medium
              | **Task Management** handles the "What." These are granular, daily action items that do not necessarily 
              | impact the critical path but are vital for completion. 
            .flex.flex-col.gap-4.p-6.rounded-3xl(class="bg-purple-brand/5 border border-purple-brand/10")
              p(class="text-[10px]").font-bold.text-purple-brand.uppercase.tracking-widest TACTICAL FEATURES
              ul.list-disc.list-inside.text-appTextMuted.flex.flex-col.gap-2.text-xs.font-bold
                li Nested Checklists / Action Items
                li Specific Calendar Deadlines
                li Individual Assignee Assignments
                li Rich Text Descriptions

      //- Section 03: Resource Health
      section#resources.flex.flex-col.gap-8
        .flex.items-center.gap-4
          span.text-4xl.font-black.text-purple-brand 03
          h2.text-2xl.font-bold.text-appText RESOURCE HEALTH & SATURATION
        
        .grid.grid-cols-2.gap-10
          .flex.flex-col.gap-6
            p.text-sm.text-appTextMuted.leading-relaxed.font-medium
              | A project's success depends on operative availability. The **Heatmap** provides a 
              | saturation-aware view of team load.
            .bg-appBgSoft.p-6.rounded-3xl.flex.flex-col.gap-6.border.border-appBorder
              h4(class="text-[10px]").font-bold.text-appTextMuted INDICATOR LOGIC
              .flex.flex-col.gap-4
                .flex.items-center.gap-3
                  .w-3.h-3.rounded-full.bg-tuscany
                  span.text-xs.font-bold.text-appTextMuted < 70% Saturation (Nominal)
                .flex.items-center.gap-3
                  .w-3.h-3.rounded-full.bg-purple-brand
                  span.text-xs.font-bold.text-appTextMuted 70% - 90% Saturation (Optimal)
                .flex.items-center.gap-3
                  .w-3.h-3.rounded-full.bg-raspberry
                  span.text-xs.font-bold.text-appTextMuted > 90% Saturation (Overload)

          .bg-appBgSoft.p-8.rounded-3xl.border.border-appBorder.flex.flex-col.gap-6
            h4.text-sm.font-bold.text-appText DYNAMIC ASSIGNMENT
            p.text-sm.text-appTextMuted.leading-relaxed.font-medium
              | When assigning tasks or issues, the system displays a real-time capacity pulse next to each operative. 
              | Avoid assigning "Overloaded" operatives to maintain team health and prevent burnout.

      //- Section 04: Risk Mitigation
      section#risks.flex.flex-col.gap-8
        .flex.items-center.gap-4
          span.text-4xl.font-black.text-purple-brand 04
          h2.text-2xl.font-bold.text-appText RISK MITIGATION (ISSUES)
        
        .bg-appBgSoft.p-10.rounded-4xl.flex.flex-col.gap-6.border.border-appBorder
          p.text-sm.text-appTextMuted.leading-relaxed.font-medium
            | The **Issues** module is for tracking impediments that stop work. Issues are distinct from tasks 
            | as they represent risks that require resolution plans.
          .grid.grid-cols-3.gap-6.mt-4
            .p-6.bg-appBg.rounded-3xl.border.border-appBorder
              h5.font-bold.text-sm.text-appText IDENTIFY
              p(class="text-[10px]").font-bold.text-appTextMuted.mt-2 Log the root cause and priority level.
            .p-6.bg-appBg.rounded-3xl.border.border-appBorder
              h5.font-bold.text-sm.text-appText ESCALATE
              p(class="text-[10px]").font-bold.text-appTextMuted.mt-2 Critical issues appear on the global dashboard.
            .p-6.bg-appBg.rounded-3xl.border.border-appBorder
              h5.font-bold.text-sm.text-appText RESOLVE
              p(class="text-[10px]").font-bold.text-appTextMuted.mt-2 Track action items until the impediment is cleared.

      footer.mt-12.pt-8.border-t.border-appBorder.flex.justify-between.items-center
        p(class="text-[10px]").font-bold.text-appTextMuted © 2026 DEKODE PM TOOLS // ALL RIGHTS RESERVED
        p(class="text-[10px]").font-bold.text-appTextMuted PROTOCOL SECURE 0x77-A
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
  { id: 'navigation', title: '01 NAVIGATION ARCHITECTURE' },
  { id: 'execution', title: '02 STRATEGIC VS TACTICAL' },
  { id: 'resources', title: '03 RESOURCE HEALTH' },
  { id: 'risks', title: '04 RISK MITIGATION' },
];
</script>

<style scoped>
.scroll-smooth {
  scroll-behavior: smooth;
}

::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(127, 36, 221, 0.1);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(127, 36, 221, 0.2);
}
</style>
