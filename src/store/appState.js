import { reactive, computed, watch } from "vue";
import { addDays, format, parseISO } from "date-fns";

const defaultState = {
  activeProjectId: "p1",
  projects: [
    {
      id: "p1",
      name: "Alpha Initiative",
      description: "Overhaul core defense grid protocols.",
      status: "Active",
      startDate: "2026-04-20",
      endDate: "2026-05-15",
      logs: [
        { time: "14:02:44", msg: "Grid alignment successful." },
        { time: "13:45:12", msg: "Anomalous signature detected in sector 4." },
      ],
      issues: [
        {
          id: "i1",
          title: "Firewall Latency",
          priority: "High",
          status: "Open",
          type: "Bug",
        },
      ],
    },
  ],
  tasks: [
    {
      wbsId: "1",
      projectId: "p1",
      title: "Phase 1: Setup",
      status: "In Progress",
      assignees: [],
      duration: 0,
      predecessorIds: [],
      dependencyType: "",
      lag: 0,
      startDay: 1,
      endDay: 1,
      isParent: true,
      progress: 0,
    },
    {
      wbsId: "1.1",
      projectId: "p1",
      title: "Firewall Config",
      status: "Completed",
      assignees: ["o1"],
      duration: 2,
      predecessorIds: [],
      dependencyType: "",
      lag: 0,
      startDay: 1,
      endDay: 2,
      isParent: false,
      progress: 100,
    },
    {
      wbsId: "1.2",
      projectId: "p1",
      title: "Intrusion Test",
      status: "In Progress",
      assignees: ["o2"],
      duration: 3,
      predecessorIds: ["1.1"],
      dependencyType: "FS",
      lag: 0,
      startDay: 3,
      endDay: 5,
      isParent: false,
      progress: 50,
    },
    {
      wbsId: "1.3",
      projectId: "p1",
      title: "Node Diagnostics",
      status: "To Do",
      assignees: ["o3"],
      duration: 4,
      predecessorIds: ["1.2"],
      dependencyType: "FS",
      lag: -1,
      startDay: 5,
      endDay: 8,
      isParent: false,
      progress: 0,
    },
    {
      wbsId: "2",
      projectId: "p1",
      title: "Phase 2: Deployment",
      status: "To Do",
      assignees: [],
      duration: 0,
      predecessorIds: [],
      dependencyType: "",
      lag: 0,
      startDay: 1,
      endDay: 1,
      isParent: true,
      progress: 0,
    },
    {
      wbsId: "2.1",
      projectId: "p1",
      title: "Patch Deployment",
      status: "To Do",
      assignees: ["o1"],
      duration: 5,
      predecessorIds: ["1.3"],
      dependencyType: "FS",
      lag: 1,
      startDay: 10,
      endDay: 14,
      isParent: false,
      progress: 0,
    },
    {
      wbsId: "2.2",
      projectId: "p1",
      title: "Subroutine Opt",
      status: "To Do",
      assignees: ["o2"],
      duration: 3,
      predecessorIds: ["2.1"],
      dependencyType: "SS",
      lag: 2,
      startDay: 12,
      endDay: 14,
      isParent: false,
      progress: 0,
    },
  ],
  operatives: [
    {
      id: "o1",
      name: "J. Harper",
      role: "Security Spec",
      dailyCapacity: 8,
      availability: 100,
    },
    {
      id: "o2",
      name: "E. Vance",
      role: "Net Engineer",
      dailyCapacity: 8,
      availability: 100,
    },
    {
      id: "o3",
      name: "S. Chen",
      role: "Hardware Tech",
      dailyCapacity: 8,
      availability: 50,
    },
  ],
};

let initialState = defaultState;
const savedState = localStorage.getItem("panopticon_state");
if (savedState) {
  try {
    initialState = JSON.parse(savedState);

    // Migration logic
    if (initialState.issues) {
      initialState.issues.forEach((issue) => {
        const proj = initialState.projects.find(
          (p) => p.id === issue.projectId,
        );
        if (proj) {
          if (!proj.issues) proj.issues = [];
          proj.issues.push({
            id: issue.id,
            title: issue.title,
            priority: issue.priority,
            status: issue.status,
            type: issue.type,
          });
        }
      });
      delete initialState.issues;
    }

    initialState.projects.forEach((p) => {
      if (!p.issues) p.issues = [];
    });
    initialState.tasks.forEach((t) => {
      if (!t.assignees) t.assignees = [];
      if (!t.predecessorIds) t.predecessorIds = [];
    });
    initialState.operatives.forEach((op) => {
      if (op.availability === undefined) op.availability = 100;
    });
  } catch (e) {
    console.error("Failed to migrate state", e);
  }
}

export const appState = reactive(initialState);

watch(
  appState,
  (newState) => {
    localStorage.setItem("panopticon_state", JSON.stringify(newState));
  },
  { deep: true },
);

// Core Scheduling Engine (DRY)
export const calculateSchedule = () => {
  if (!appState.tasks.length) return;
  const tasksMap = new Map();
  appState.tasks.forEach((t) => tasksMap.set(`${t.projectId}-${t.wbsId}`, t));

  const maxProjectEndDayMap = new Map();

  // Forward Pass
  appState.tasks.forEach((t) => {
    t.isParent = appState.tasks.some(
      (c) =>
        c.projectId === t.projectId &&
        c.wbsId.startsWith(t.wbsId + ".") &&
        c.wbsId !== t.wbsId,
    );
    if (t.isParent) return;

    t.duration = Number(t.duration) || 1;
    t.lag = Number(t.lag) || 0;

    if (!t.predecessorIds.length) {
      t.startDay = 1;
    } else {
      const calcStarts = t.predecessorIds.map((pId) => {
        const pred = tasksMap.get(`${t.projectId}-${pId}`);
        if (!pred) return 1;
        if (t.dependencyType === "FS") return pred.endDay + 1 + t.lag;
        if (t.dependencyType === "SS") return pred.startDay + t.lag;
        if (t.dependencyType === "FF")
          return pred.endDay + t.lag - t.duration + 1;
        if (t.dependencyType === "SF")
          return pred.startDay + t.lag - t.duration + 1;
        return pred.endDay + 1 + t.lag;
      });
      t.startDay = Math.max(1, ...calcStarts);
    }
    t.endDay = t.startDay + t.duration - 1;
    maxProjectEndDayMap.set(
      t.projectId,
      Math.max(maxProjectEndDayMap.get(t.projectId) || 1, t.endDay),
    );
  });

  // Parent Rollups
  appState.tasks.forEach((parent) => {
    if (!parent.isParent) return;
    const children = appState.tasks.filter(
      (c) =>
        c.projectId === parent.projectId &&
        c.wbsId.startsWith(parent.wbsId + ".") &&
        !c.isParent,
    );
    if (children.length) {
      parent.startDay = Math.min(...children.map((c) => c.startDay));
      parent.endDay = Math.max(...children.map((c) => c.endDay));
      parent.duration = parent.endDay - parent.startDay + 1;
      parent.progress = Math.round(
        children.reduce((sum, c) => sum + (Number(c.progress) || 0), 0) /
          children.length,
      );
    }
  });

  // Backward Pass & Critical Path
  const lateEnds = new Map();
  appState.tasks.forEach((t) =>
    lateEnds.set(
      `${t.projectId}-${t.wbsId}`,
      maxProjectEndDayMap.get(t.projectId) || 1,
    ),
  );

  appState.projects.forEach((project) => {
    const pTasks = appState.tasks.filter((t) => t.projectId === project.id);
    const maxEnd = maxProjectEndDayMap.get(project.id) || 1;
    for (let i = pTasks.length - 1; i >= 0; i--) {
      const t = pTasks[i];
      if (t.isParent) continue;
      const successors = pTasks.filter((s) =>
        s.predecessorIds?.includes(t.wbsId),
      );
      if (successors.length) {
        const minLateEnd = Math.min(
          ...successors.map((s) => {
            const sLS =
              lateEnds.get(`${s.projectId}-${s.wbsId}`) - s.duration + 1;
            if (s.dependencyType === "FS") return sLS - 1 - s.lag;
            if (s.dependencyType === "SS") return sLS - s.lag + t.duration - 1;
            return maxEnd;
          }),
        );
        lateEnds.set(`${t.projectId}-${t.wbsId}`, minLateEnd);
      }
    }
  });

  appState.tasks.forEach((t) => {
    if (t.isParent) {
      t.float = 0;
      t.isCritical = false;
      return;
    }
    t.float = lateEnds.get(`${t.projectId}-${t.wbsId}`) - t.endDay;
    t.isCritical = t.float <= 0;
  });
};

calculateSchedule();

export const metrics = computed(() => {
  const activeProjects = appState.projects.filter(
    (p) => p.status === "Active",
  ).length;
  const subtasks = appState.tasks.filter((t) => !t.isParent);
  const totalTasks = subtasks.length;
  const completedTasks = subtasks.filter((t) => t.progress === 100).length;
  const openIssues = appState.projects.reduce(
    (sum, p) => sum + p.issues.filter((i) => i.status !== "Resolved").length,
    0,
  );
  const systemLoad = Math.min(100, Math.round((totalTasks / 20) * 100)) || 0;
  return { activeProjects, totalTasks, completedTasks, systemLoad, openIssues };
});

export const getProjectProgress = (projectId) => {
  const pTasks = appState.tasks.filter(
    (t) => t.projectId === projectId && !t.isParent,
  );
  if (!pTasks.length) return 0;
  return Math.round(
    pTasks.reduce((sum, t) => sum + (Number(t.progress) || 0), 0) /
      pTasks.length,
  );
};

export const getResourceHeatmap = (startDateStr, numDays) => {
  const heatmap = {};
  const dates = [];
  const startDate = parseISO(startDateStr);

  for (let i = 0; i < numDays; i++)
    dates.push(format(addDays(startDate, i), "yyyy-MM-dd"));

  appState.operatives.forEach((op) => {
    heatmap[op.id] = {};
    dates.forEach((d) => {
      heatmap[op.id][d] = {
        hoursAssigned: 0,
        capacity: op.dailyCapacity * (op.availability / 100),
      };
    });
  });

  appState.tasks
    .filter((t) => !t.isParent)
    .forEach((task) => {
      if (!task.assignees?.length) return;
      const proj = appState.projects.find((p) => p.id === task.projectId);
      if (!proj) return;
      const tStart = addDays(parseISO(proj.startDate), task.startDay - 1);

      task.assignees.forEach((opId) => {
        if (!heatmap[opId]) return;
        for (let i = 0; i < task.duration; i++) {
          const dStr = format(addDays(tStart, i), "yyyy-MM-dd");
          if (heatmap[opId][dStr]) heatmap[opId][dStr].hoursAssigned += 8;
        }
      });
    });

  Object.values(heatmap).forEach((opDays) => {
    Object.values(opDays).forEach((cell) => {
      cell.saturation =
        cell.capacity > 0
          ? cell.hoursAssigned / cell.capacity
          : cell.hoursAssigned > 0
            ? 999
            : 0;
    });
  });

  return { dates, heatmap };
};
