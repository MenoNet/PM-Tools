<template lang="pug">
.h-full.flex.flex-col.gap-6.overflow-y-auto.pr-2
  .glass-card.rounded-2xl.p-6.flex.justify-between.items-start.flex-shrink-0
    .flex.flex-col.gap-2
      h2.text-3xl.text-header PROJECT PORTFOLIO
      p.text-white_60(class="text-white/60") Global Initiative Registry
    
    //- Add Project Form
    .flex.gap-3.items-end
      .flex.flex-col.gap-1
        label.text-metadata NEW PROJECT
        input.bg-white_5.border.border-white_10.rounded.px-3.py-2.text-sm.outline-none.text-white(v-model="newProject.name" placeholder="Codename" class="bg-white/5 border-white/10")
      .flex.flex-col.gap-1
        label.text-metadata START DATE
        input.bg-white_5.border.border-white_10.rounded.px-3.py-2.text-sm.outline-none.text-white(type="date" v-model="newProject.startDate" class="bg-white/5 border-white/10 [color-scheme:dark]")
      button.bg-redAccent.text-white.px-4.py-2.rounded.font-bold.text-sm.hover_bg-red-700.transition-colors(@click="addProject" class="hover:bg-red-700") INITIALIZE

  .grid.grid-cols-3.gap-6
    .glass-card.rounded-2xl.p-6.flex.flex-col.gap-4.hover_border-redAccent.transition-all.cursor-pointer.group.relative(
      v-for="project in appState.projects" 
      :key="project.id"
      class="hover:border-redAccent hover:shadow-[0_0_30px_rgba(224,30,46,0.15)]"
      @click="$emit('open-project', project.id)"
    )
      .flex.justify-between.items-start
        .flex.flex-col.gap-1.w-full
          input.bg-transparent.border-none.outline-none.text-xl.font-bold.truncate.text-white.hover_text-redAccent.transition-colors(
            v-model="project.name" 
            @click.stop 
            placeholder="Unnamed Project"
          )
          select.bg-transparent.border-none.outline-none.text-metadata.text-redAccent.w-auto(v-model="project.status" @click.stop)
            option.text-obsidian(value="Planning") Planning
            option.text-obsidian(value="Active") Active
            option.text-obsidian(value="On Hold") On Hold
            option.text-obsidian(value="Completed") Completed
        
        button.text-white_40.hover_text-redAccent.p-1.transition-colors(@click.stop="deleteProject(project.id)" class="text-white/40 hover:text-redAccent")
          Trash2Icon(:size="16")
          
      textarea.bg-white_5.border.border-white_10.rounded.px-3.py-2.text-sm.outline-none.text-white.w-full.mt-2.resize-none.h-20.z-10.relative.focus_border-redAccent.transition-colors(
        v-model="project.description" 
        placeholder="Objective details..." 
        @click.stop
        class="bg-white/5 border-white/10"
      )

      .flex.justify-between.items-center.mt-auto.pt-4.border-t.border-white_5(class="border-white/5")
        .flex.flex-col.gap-1
          span.text-metadata START
          input.bg-transparent.border-none.outline-none.text-sm.text-white.hover_text-redAccent.transition-colors(
            type="date" 
            v-model="project.startDate" 
            @click.stop 
            class="[color-scheme:dark]"
          )
        .flex.flex-col.gap-1.text-right
          span.text-metadata PROGRESS
          span.text-xl.font-black.text-redAccent {{ getProjectProgress(project.id) }}%

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
