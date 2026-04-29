<template lang="pug">
.flex.h-screen.w-screen.bg-obsidian.text-white.overflow-hidden
  //- Sidebar Navigation
  aside.w-20.flex-shrink-0.flex.flex-col.items-center.py-8.border-r.border-white_5.bg-white_2.backdrop-blur-xl(class="border-white/[0.05] bg-white/[0.02]")
    .mb-12
      //- Brand Logo Placeholder
      .w-10.h-10.rounded-lg.bg-redAccent.flex.items-center.justify-center.shadow-lg(style="box-shadow: 0 0 20px rgba(224,30,46,0.3);")
        span.font-black.italic.text-white P
    
    nav.flex-1.w-full.flex.flex-col.gap-6.items-center
      button.relative.p-3.rounded-xl.transition-all.duration-300(
        v-for="item in navItems" 
        :key="item.id"
        @click="navigateTo(item.id)"
        :class="isActive(item.id) ? 'text-redAccent bg-redAccent/10' : 'text-white/40 hover:text-white/80 hover:bg-white/5'"
      )
        //- Active Indicator Line
        .absolute.left-0.top-1_2.-translate-y-1_2.w-1.h-8.bg-redAccent.rounded-r-md(
          v-if="isActive(item.id)"
        )
        component(:is="item.icon" :size="24" :stroke-width="2")

    .mt-auto
      button.p-3.rounded-xl.text-white_40.hover_text-white_80.transition-colors(class="text-white/40 hover:text-white/80")
        SettingsIcon(:size="24" :stroke-width="2")

  //- Main Content Area
  main.flex-1.relative.overflow-hidden.flex.flex-col
    //- Top Header / Status Bar
    header.h-16.flex-shrink-0.border-b.border-white_5.flex.items-center.px-8.justify-between(class="border-white/[0.05]")
      .flex.items-center.gap-4
        h1.text-header.text-2xl PANOPTICON
        .h-4.w-px.bg-white_20(class="bg-white/20")
        span.text-metadata SYSTEM OPERATIONAL

      .flex.items-center.gap-6
        .flex.items-center.gap-2
          .w-2.h-2.rounded-full.bg-redAccent.animate-pulse
          span.text-metadata.text-redAccent LIVE SECURE LINK
        .w-8.h-8.rounded-full.bg-white_10.border.border-white_20.overflow-hidden(class="bg-white/10 border-white/20")
          img(src="https://api.dicebear.com/7.x/bottts/svg?seed=Admin" alt="User")

    //- View Container
    .flex-1.overflow-hidden.relative.p-6
      Transition(
        enter-active-class="transition-all duration-500 ease-out"
        enter-from-class="opacity-0 translate-y-4 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition-all duration-300 ease-in absolute inset-0"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 -translate-y-4 scale-95"
      )
        DashboardView(v-if="currentView === 'dashboard'" class="h-full")
        ProjectsList(v-else-if="currentView === 'projects'" class="h-full" @open-project="openProject")
        ProjectDetailView(v-else-if="currentView === 'project-detail'" class="h-full")
        TeamView(v-else-if="currentView === 'team'" class="h-full")

</template>

<script setup>
import { ref } from 'vue';
import { appState } from './store/appState';
import { LayoutGrid, Briefcase, Users, Activity, Settings as SettingsIcon } from 'lucide-vue-next';

// Views
import DashboardView from './views/Dashboard.vue';
import ProjectsList from './views/ProjectsList.vue';
import ProjectDetailView from './views/ProjectDetail.vue';
import TeamView from './views/TeamView.vue';

const currentView = ref('dashboard');

const navItems = [
  { id: 'dashboard', icon: LayoutGrid },
  { id: 'projects', icon: Briefcase },
  { id: 'team', icon: Users },
  { id: 'activity', icon: Activity },
];

const navigateTo = (id) => {
  currentView.value = id;
};

const isActive = (id) => {
  if (id === 'projects' && currentView.value === 'project-detail') return true;
  return currentView.value === id;
};

const openProject = (projectId) => {
  appState.activeProjectId = projectId;
  currentView.value = 'project-detail';
};
</script>
