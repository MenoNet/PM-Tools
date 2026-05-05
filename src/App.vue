<template lang="pug">
.flex.h-screen.w-screen.overflow-hidden(:class="appState.theme")
  //- Sidebar Navigation
  aside.w-64.flex-shrink-0.flex.flex-col.bg-appBgSoft.border-r.border-appBorder.transition-colors.duration-300
    .p-6.flex.flex-col.gap-8.h-full
      //- Brand Logo
      .flex.items-center.gap-3
        .w-8.h-8.rounded-lg.brand-gradient.flex.items-center.justify-center.text-white
          component(:is="AppIcon" :size="20")
        span.font-bold.tracking-tight.text-xl appflowy
      
      //- User Profile
      .flex.items-center.gap-3.p-2.rounded-xl.hover_bg-appBg.transition-all.cursor-pointer
        .w-8.h-8.rounded-full.bg-purple-brand.flex.items-center.justify-center.text-white.font-bold AM
        .flex.flex-col.flex-1
          span.text-xs.font-bold.truncate Amrita Menon
          span(class="text-[10px]").text-appTextMuted.truncate Administrator
        ChevronDownIcon.text-appTextMuted(:size="14")

      //- Navigation Groups
      nav.flex-1.flex.flex-col.gap-6.overflow-y-auto.pr-2
        //- Core
        .flex.flex-col.gap-1
          button.flex.items-center.gap-3.px-3.py-2.rounded-lg.transition-all.group(
            @click="currentView = 'dashboard'"
            :class="currentView === 'dashboard' ? 'bg-appBg text-purple-brand' : 'text-appTextMuted hover_bg-appBg'"
          )
            DashboardIcon(:size="18")
            span.text-sm.font-medium My Dashboard
          
          button.flex.items-center.gap-3.px-3.py-2.rounded-lg.transition-all.group.text-appTextMuted.hover_bg-appBg
            StarIcon(:size="18")
            span.text-sm.font-medium Favorites

        //- Project Management
        .flex.flex-col.gap-1
          .flex.items-center.justify-between.px-3.py-2
            span(class="text-[10px]").font-bold.text-appTextMuted.uppercase.tracking-widest Project Management
            PlusIcon.text-appTextMuted.cursor-pointer.hover_text-purple-brand(:size="14")
          
          button.flex.items-center.gap-3.px-3.py-2.rounded-lg.transition-all.group(
            @click="currentView = 'projects'"
            :class="currentView === 'projects' ? 'bg-appBg text-purple-brand' : 'text-appTextMuted hover_bg-appBg'"
          )
            ProjectsIcon(:size="18")
            span.text-sm.font-medium Portfolio
          
          button.flex.items-center.gap-3.px-3.py-2.rounded-lg.transition-all.group(
            @click="currentView = 'team'"
            :class="currentView === 'team' ? 'bg-appBg text-purple-brand' : 'text-appTextMuted hover_bg-appBg'"
          )
            TeamIcon(:size="18")
            span.text-sm.font-medium Resources

        //- Help & Guides
        .flex.flex-col.gap-1
          .flex.items-center.justify-between.px-3.py-2
            span(class="text-[10px]").font-bold.text-appTextMuted.uppercase.tracking-widest Support
          
          button.flex.items-center.gap-3.px-3.py-2.rounded-lg.transition-all.group(
            @click="currentView = 'guide'"
            :class="currentView === 'guide' ? 'bg-appBg text-purple-brand' : 'text-appTextMuted hover_bg-appBg'"
          )
            GuideIcon(:size="18")
            span.text-sm.font-medium User Guide

      //- Bottom Controls
      .flex.flex-col.gap-2.pt-4.border-t.border-appBorder
        button.flex.items-center.gap-3.px-3.py-2.rounded-lg.text-appTextMuted.hover_bg-appBg.transition-all(@click="toggleTheme")
          component(:is="appState.theme === 'dark' ? SunIcon : MoonIcon" :size="18")
          span.text-sm.font-medium {{ appState.theme === 'dark' ? 'Light Mode' : 'Dark Mode' }}
        
        button.flex.items-center.gap-3.px-3.py-2.rounded-lg.text-appTextMuted.hover_bg-appBg.transition-all
          TrashIcon(:size="18")
          span.text-sm.font-medium Trash

  //- Main Content Area
  main.flex-1.flex.flex-col.p-6.overflow-hidden.bg-appBg
    //- Header with Breadcrumbs & Actions
    header.flex.justify-between.items-center.mb-6.flex-shrink-0
      .flex.items-center.gap-3
        .flex.items-center.gap-2.text-appTextMuted.text-sm
          span Project Management
          span /
          span.font-bold.text-appText {{ viewLabels[currentView] }}
      
      .flex.items-center.gap-4
        .relative
          SearchIcon.absolute.left-3.top-1/2.-translate-y-1/2.text-appTextMuted(:size="16")
          input.bg-appBgSoft.border.border-appBorder.rounded-xl.pl-10.pr-4.py-2.text-sm.w-64.outline-none.focus_border-purple-brand.transition-all(placeholder="Search...")
        
        button.btn-primary.flex.items-center.gap-2
          span Share
          ShareIcon(:size="14")
        
        button.p-2.rounded-lg.hover_bg-appBgSoft.text-appTextMuted
          MoreVerticalIcon(:size="18")

    //- Content Switching (Wrapped in a container with rounded corners like the image)
    .flex-1.min-h-0.bg-appBgSoft.rounded-3xl.border.border-appBorder.shadow-premium-light.overflow-hidden.p-6
      Transition(name="fade" mode="out-in")
        DashboardView(v-if="currentView === 'dashboard'" class="h-full" @open-project="openProject")
        ProjectsList(v-else-if="currentView === 'projects'" class="h-full" @open-project="openProject")
        ProjectDetail(v-else-if="currentView === 'detail'" class="h-full")
        TeamView(v-else-if="currentView === 'team'" class="h-full")
        UserGuide(v-else-if="currentView === 'guide'" class="h-full")
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { 
  LayoutDashboard as DashboardIcon, 
  Briefcase as ProjectsIcon, 
  Users as TeamIcon, 
  Activity as ActivityIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  HelpCircle as GuideIcon,
  Star as StarIcon,
  Plus as PlusIcon,
  Trash2 as TrashIcon,
  ChevronDown as ChevronDownIcon,
  Search as SearchIcon,
  Share2 as ShareIcon,
  MoreVertical as MoreVerticalIcon,
  Layers as AppIcon
} from "lucide-vue-next";
import { appState } from "./store/appState";

// Components
import DashboardView from "./views/Dashboard.vue";
import ProjectsList from "./views/ProjectsList.vue";
import ProjectDetail from "./views/ProjectDetail.vue";
import TeamView from "./views/TeamView.vue";
import UserGuide from "./views/UserGuide.vue";

const currentView = ref("dashboard");

const viewLabels = {
  dashboard: "Dashboard",
  projects: "Portfolio",
  detail: "Project Detail",
  team: "Resources",
  guide: "User Guide"
};

const toggleTheme = () => {
  appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
};

const openProject = (id) => {
  appState.activeProjectId = id;
  currentView.value = 'detail';
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
