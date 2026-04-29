import { reactive, computed, watch } from 'vue';
import { addDays, format, differenceInDays, parseISO } from 'date-fns';

const todayStr = format(new Date(), 'yyyy-MM-dd');

const defaultState = {
  activeProjectId: 'p1', // currently viewed project
  projects: [
    {
      id: 'p1',
      name: 'Alpha Initiative',
      description: 'Overhaul core defense grid protocols.',
      status: 'Active',
      startDate: '2026-04-20',
      endDate: '2026-05-15',
      logs: [
        { time: '14:02:44', msg: 'Grid alignment successful.' },
        { time: '13:45:12', msg: 'Anomalous signature detected in sector 4.' }
      ]
    }
  ],
  tasks: [
    { wbsId: '1', projectId: 'p1', title: 'Phase 1: Setup', status: 'In Progress', assignee: '', duration: 0, predecessorId: '', dependencyType: '', lag: 0, startDay: 1, endDay: 1, isParent: true, progress: 0 },
    { wbsId: '1.1', projectId: 'p1', title: 'Firewall Config', status: 'Completed', assignee: 'o1', duration: 2, predecessorId: '', dependencyType: '', lag: 0, startDay: 1, endDay: 2, isParent: false, progress: 100 },
    { wbsId: '1.2', projectId: 'p1', title: 'Intrusion Test', status: 'In Progress', assignee: 'o2', duration: 3, predecessorId: '1.1', dependencyType: 'FS', lag: 0, startDay: 3, endDay: 5, isParent: false, progress: 50 },
    { wbsId: '1.3', projectId: 'p1', title: 'Node Diagnostics', status: 'To Do', assignee: 'o3', duration: 4, predecessorId: '1.2', dependencyType: 'FS', lag: -1, startDay: 5, endDay: 8, isParent: false, progress: 0 },
    
    { wbsId: '2', projectId: 'p1', title: 'Phase 2: Deployment', status: 'To Do', assignee: '', duration: 0, predecessorId: '', dependencyType: '', lag: 0, startDay: 1, endDay: 1, isParent: true, progress: 0 },
    { wbsId: '2.1', projectId: 'p1', title: 'Patch Deployment', status: 'To Do', assignee: 'o1', duration: 5, predecessorId: '1.3', dependencyType: 'FS', lag: 1, startDay: 10, endDay: 14, isParent: false, progress: 0 },
    { wbsId: '2.2', projectId: 'p1', title: 'Subroutine Opt', status: 'To Do', assignee: 'o2', duration: 3, predecessorId: '2.1', dependencyType: 'SS', lag: 2, startDay: 12, endDay: 14, isParent: false, progress: 0 }
  ],
  operatives: [
    { id: 'o1', name: 'J. Harper', role: 'Security Spec', dailyCapacity: 8 },
    { id: 'o2', name: 'E. Vance', role: 'Net Engineer', dailyCapacity: 8 },
    { id: 'o3', name: 'S. Chen', role: 'Hardware Tech', dailyCapacity: 8 }
  ]
};

// Load from LocalStorage
let initialState = defaultState;
const savedState = localStorage.getItem('panopticon_state');
if (savedState) {
  try {
    initialState = JSON.parse(savedState);
  } catch (e) {
    console.error("Failed to parse state from local storage", e);
  }
}

export const appState = reactive(initialState);

// Auto-save to LocalStorage
watch(appState, (newState) => {
  localStorage.setItem('panopticon_state', JSON.stringify(newState));
}, { deep: true });

// Scheduling Engine
export const calculateSchedule = () => {
  if (!appState.tasks || appState.tasks.length === 0) return;

  const tasksMap = new Map();
  appState.tasks.forEach(t => tasksMap.set(`${t.projectId}-${t.wbsId}`, t));

  // 1. First pass: Resolve Dependencies for subtasks
  let maxProjectEndDayMap = new Map(); // projectId -> maxEndDay

  appState.tasks.forEach(t => {
    t.isParent = appState.tasks.some(child => child.projectId === t.projectId && child.wbsId.startsWith(t.wbsId + '.') && child.wbsId !== t.wbsId);
    
    if (t.isParent) return; // Parents roll up later

    t.duration = Number(t.duration) || 1;
    t.lag = Number(t.lag) || 0;

    if (!t.predecessorId || !tasksMap.has(`${t.projectId}-${t.predecessorId}`)) {
      t.startDay = 1;
      t.endDay = t.startDay + t.duration - 1;
    } else {
      const pred = tasksMap.get(`${t.projectId}-${t.predecessorId}`);
      if (t.dependencyType === 'FS') {
        t.startDay = pred.endDay + 1 + t.lag;
      } else if (t.dependencyType === 'SS') {
        t.startDay = pred.startDay + t.lag;
      } else if (t.dependencyType === 'FF') {
        t.endDay = pred.endDay + t.lag;
        t.startDay = t.endDay - t.duration + 1;
      } else if (t.dependencyType === 'SF') {
        t.endDay = pred.startDay + t.lag;
        t.startDay = t.endDay - t.duration + 1;
      } else {
        t.startDay = pred.endDay + 1 + t.lag; // Default to FS
      }
      
      // Ensure startDay is at least 1
      t.startDay = Math.max(1, t.startDay);
      t.endDay = t.startDay + t.duration - 1;
    }
    
    const currentMax = maxProjectEndDayMap.get(t.projectId) || 1;
    if (t.endDay > currentMax) maxProjectEndDayMap.set(t.projectId, t.endDay);
  });

  // 2. Second pass: Calculate Parent Roll-ups
  appState.tasks.forEach(parent => {
    if (!parent.isParent) return;
    
    const children = appState.tasks.filter(child => child.projectId === parent.projectId && child.wbsId.startsWith(parent.wbsId + '.') && !child.isParent);
    if (children.length > 0) {
      parent.startDay = Math.min(...children.map(c => c.startDay));
      parent.endDay = Math.max(...children.map(c => c.endDay));
      parent.duration = parent.endDay - parent.startDay + 1;
      
      const totalProgress = children.reduce((sum, c) => sum + (Number(c.progress) || 0), 0);
      parent.progress = Math.round(totalProgress / children.length);
    }
  });

  // 3. Third pass: Critical Path & Float
  const lateEnds = new Map();
  appState.tasks.forEach(t => {
    const maxEnd = maxProjectEndDayMap.get(t.projectId) || 1;
    lateEnds.set(`${t.projectId}-${t.wbsId}`, maxEnd);
  });
  
  // Work backwards (within each project)
  appState.projects.forEach(project => {
    const projectTasks = appState.tasks.filter(t => t.projectId === project.id);
    const maxProjectEndDay = maxProjectEndDayMap.get(project.id) || 1;

    for (let i = projectTasks.length - 1; i >= 0; i--) {
      const t = projectTasks[i];
      if (t.isParent) continue;
      
      const successors = projectTasks.filter(succ => succ.predecessorId === t.wbsId);
      if (successors.length > 0) {
        let minLateEnd = maxProjectEndDay;
        successors.forEach(succ => {
          const succLateStart = lateEnds.get(`${succ.projectId}-${succ.wbsId}`) - succ.duration + 1;
          let tLateEnd = maxProjectEndDay;
          
          if (succ.dependencyType === 'FS') {
            tLateEnd = succLateStart - 1 - succ.lag;
          } else if (succ.dependencyType === 'SS') {
            tLateEnd = succLateStart - succ.lag + t.duration - 1;
          }
          if (tLateEnd < minLateEnd) minLateEnd = tLateEnd;
        });
        lateEnds.set(`${t.projectId}-${t.wbsId}`, minLateEnd);
      }
    }
  });

  appState.tasks.forEach(t => {
    if (t.isParent) {
      t.float = 0;
      t.isCritical = false;
      return;
    }
    const le = lateEnds.get(`${t.projectId}-${t.wbsId}`);
    t.float = le - t.endDay;
    t.isCritical = t.float <= 0;
  });
};

// Initial calculation on load
calculateSchedule();

// Computed properties for panoramic dashboard
export const metrics = computed(() => {
  const activeProjects = appState.projects.filter(p => p.status === 'Active').length;
  const subtasks = appState.tasks.filter(t => !t.isParent);
  const totalTasks = subtasks.length;
  const completedTasks = subtasks.filter(t => t.progress === 100).length;
  
  const systemLoad = Math.min(100, Math.round((totalTasks / 20) * 100)) || 0;

  return {
    activeProjects,
    totalTasks,
    completedTasks,
    systemLoad,
  };
});

// Calculate project progress (Operational Maturity)
export const getProjectProgress = (projectId) => {
  const pTasks = appState.tasks.filter(t => t.projectId === projectId && !t.isParent);
  if (pTasks.length === 0) return 0;
  const totalProg = pTasks.reduce((sum, t) => sum + (Number(t.progress) || 0), 0);
  return Math.round(totalProg / pTasks.length);
};

// Heatmap Calculation Logic
export const getResourceHeatmap = (startDateStr, numDays) => {
  const heatmap = {};
  const dates = [];
  
  const startDate = parseISO(startDateStr);

  for(let i = 0; i < numDays; i++) {
    const d = addDays(startDate, i);
    dates.push(format(d, 'yyyy-MM-dd'));
  }

  appState.operatives.forEach(op => {
    heatmap[op.id] = {};
    dates.forEach(dateStr => {
      heatmap[op.id][dateStr] = { hoursAssigned: 0, capacity: op.dailyCapacity };
    });
  });

  appState.tasks.filter(t => !t.isParent).forEach(task => {
    if (!task.assignee) return;
    
    const proj = appState.projects.find(p => p.id === task.projectId);
    if (!proj) return;

    const pStart = parseISO(proj.startDate);
    const tStart = addDays(pStart, task.startDay - 1);
    const durationDays = task.duration;
    const hoursPerDay = durationDays > 0 ? (durationDays * 8) / durationDays : 0; 

    for (let i = 0; i < durationDays; i++) {
      const currentDayStr = format(addDays(tStart, i), 'yyyy-MM-dd');
      if (heatmap[task.assignee] && heatmap[task.assignee][currentDayStr]) {
        heatmap[task.assignee][currentDayStr].hoursAssigned += hoursPerDay;
      }
    }
  });

  // Calculate saturation
  Object.keys(heatmap).forEach(opId => {
    Object.keys(heatmap[opId]).forEach(dateStr => {
      const cell = heatmap[opId][dateStr];
      cell.saturation = cell.hoursAssigned / cell.capacity;
    });
  });

  return { dates, heatmap };
};
