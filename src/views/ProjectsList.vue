<template lang="pug">
.h-full.flex.flex-col.gap-8.overflow-y-auto.pr-2
  //- Header Section
  .flex.justify-between.items-end.flex-shrink-0
    .flex.flex-col.gap-1
      label(class="text-[10px]").font-bold.text-appTextMuted.uppercase.tracking-widest Portfolio
      h2.text-3xl.font-bold.text-appText PROJECT INITIATIVES
    
    .flex.gap-4.items-end
      .flex.flex-col.gap-1
        label(class="text-[10px]").font-bold.text-appTextMuted CODENAME
        input.bg-appBgSoft.border.border-appBorder.rounded-xl.px-4.py-2.text-sm.outline-none.text-appText.focus_border-purple-brand.transition-all(v-model="newProject.name" placeholder="Project name...")
      .flex.flex-col.gap-1
        label(class="text-[10px]").font-bold.text-appTextMuted START DATE
        input.bg-appBgSoft.border.border-appBorder.rounded-xl.px-4.py-2.text-sm.outline-none.text-appText.focus_border-purple-brand.transition-all(type="date" v-model="newProject.startDate" class="[color-scheme:light]")
      button.btn-primary.text-sm(@click="addProject") INITIALIZE

  //- Project Grid
  .grid.grid-cols-3.gap-8
    .bg-appBgSoft.rounded-3xl.p-8.flex.flex-col.gap-6.border.border-appBorder.hover_border-purple-brand.transition-all.cursor-pointer.group.relative(
      v-for="project in appState.projects" 
      :key="project.id"
      class="hover:shadow-premium-light"
      @click="$emit('open-project', project.id)"
    )
      .flex.justify-between.items-start
        .flex.flex-col.gap-2.w-full
          .flex.items-center.gap-2
            span(class="text-[10px]").font-bold.text-appTextMuted {{ project.id.toUpperCase() }}
            span(class="text-[10px] px-2 py-0.5").rounded-lg.font-bold.bg-purple-brand/10.text-purple-brand {{ project.status }}
          
          input.bg-transparent.border-none.outline-none.text-2xl.font-bold.truncate.text-appText.hover_text-purple-brand.transition-colors(
            v-model="project.name" 
            @click.stop 
            placeholder="Unnamed Project"
          )
        
        button.text-appTextMuted.hover_text-raspberry.p-1.transition-colors(@click.stop="deleteProject(project.id)")
          Trash2Icon(:size="18")
          
      textarea.bg-appBg.border.border-appBorder.rounded-2xl.px-4.py-3.text-sm.outline-none.text-appText.w-full.resize-none.h-24.focus_border-purple-brand.transition-colors(
        v-model="project.description" 
        placeholder="Executive summary / objectives..." 
        @click.stop
      )

      .flex.justify-between.items-end.mt-auto.pt-6.border-t.border-appBorder
        .flex.flex-col.gap-1
          span(class="text-[10px]").font-bold.text-appTextMuted DEPLOYMENT DATE
          input.bg-transparent.border-none.outline-none.text-xs.font-bold.text-appText.hover_text-purple-brand.transition-colors(
            type="date" 
            v-model="project.startDate" 
            @click.stop 
            class="[color-scheme:light]"
          )
        .flex.flex-col.gap-1.text-right
          span(class="text-[10px]").font-bold.text-appTextMuted COMPLETION
          span.text-3xl.font-black.text-purple-brand {{ getProjectProgress(project.id) }}%

</template>

<script setup>
import { ref } from "vue";
import { appState, getProjectProgress } from "../store/appState";
import { Trash2 as Trash2Icon } from "lucide-vue-next";

defineEmits(["open-project"]);

const newProject = ref({
  name: "",
  startDate: new Date().toISOString().split("T")[0],
});

const addProject = () => {
  if (!newProject.value.name) return;
  const pId = "p" + Date.now();
  appState.projects.push({
    id: pId,
    name: newProject.value.name,
    description: "",
    status: "Planning",
    startDate: newProject.value.startDate,
    endDate: newProject.value.startDate,
    logs: [
      { time: new Date().toLocaleTimeString(), msg: "Project initialized." },
    ],
    issues: [],
  });
  newProject.value.name = "";
};

const deleteProject = (id) => {
  if (confirm("Confirm deletion of project and all associated tasks?")) {
    appState.projects = appState.projects.filter((p) => p.id !== id);
    appState.tasks = appState.tasks.filter((t) => t.projectId !== id);
  }
};
</script>
