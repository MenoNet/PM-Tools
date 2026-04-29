<template lang="pug">
.flex.h-screen.w-screen.overflow-hidden(:class="appState.theme")
  //- Sidebar Navigation
  aside.w-20.flex-shrink-0.flex.flex-col.items-center.py-8.border-r.glass-panel(class="border-white/[0.05]")
    .mb-12
      //- Brand Logo
      .w-12.h-12.rounded-lg.flex.items-center.justify-center.overflow-hidden
        img.w-full.h-full.object-cover(src="/logo.png" alt="Dekode Logo")
    
    nav.flex-1.flex.flex-col.gap-8
      button.p-3.rounded-xl.transition-all.duration-700(
        v-for="item in menuItems" 
        :key="item.id"
        @click="currentView = item.id"
        :class="currentView === item.id ? 'bg-redAccent text-white shadow-[0_0_15px_rgba(224,30,46,0.5)]' : 'text-metadata hover_text-white'"
      )
        component(:is="item.icon" :size="24")
    
    //- Theme Toggle
    button.p-3.rounded-xl.text-metadata.hover_text-white.transition-all(@click="toggleTheme")
      component(:is="appState.theme === 'dark' ? SunIcon : MoonIcon" :size="24")

  //- Main Content Area
  main.flex-1.flex.flex-col.p-8.overflow-hidden.bg-app-bg
    header.flex.justify-between.items-center.mb-8.flex-shrink-0
      .flex.flex-col
        h1.text-3xl.text-header DEKODE PM TOOLS
        p.text-metadata(class="text-opacity-60") COMMAND &amp; CONTROL CENTER
      
      .flex.items-center.gap-6
        .flex.flex-col.items-end
          span.text-metadata(class="text-[9px] tracking-[0.2em]") SYSTEM CLOCK (MYT)
          span.font-mono.text-redAccent.text-xl.font-bold {{ currentTime }}
        .w-12.h-12.rounded-full.bg-white_5.flex.items-center.justify-center.border.border-white_10(class="bg-white/5 border-white/10")
          span.font-black AM

    //- Content Switching
    .flex-1.min-h-0
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
  HelpCircle as GuideIcon
} from "lucide-vue-next";
import { appState } from "./store/appState";

// Components
import DashboardView from "./views/Dashboard.vue";
import ProjectsList from "./views/ProjectsList.vue";
import ProjectDetail from "./views/ProjectDetail.vue";
import TeamView from "./views/TeamView.vue";
import UserGuide from "./views/UserGuide.vue";

const currentView = ref("dashboard");
const currentTime = ref("");

const menuItems = [
  { id: "dashboard", icon: DashboardIcon, label: "Dashboard" },
  { id: "projects", icon: ProjectsIcon, label: "Portfolio" },
  { id: "team", icon: TeamIcon, label: "Resources" },
  { id: "guide", icon: GuideIcon, label: "Guide" },
];

const updateClock = () => {
  const now = new Date();
  // Malaysian Time (UTC+8)
  currentTime.value = now.toLocaleTimeString('en-GB', { 
    hour12: false,
    timeZone: 'Asia/Kuala_Lumpur'
  });
};

let clockInterval;
onMounted(() => {
  updateClock();
  clockInterval = setInterval(updateClock, 1000);
});
onUnmounted(() => clearInterval(clockInterval));

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
