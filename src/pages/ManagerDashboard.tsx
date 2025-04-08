import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useAuthStore } from '../store/auth';
import { useTaskStore } from '../store/tasks';
import { usePerformanceStore } from '../store/performance';
import { useWorkloadStore } from '../store/workload';
import { useProjectStore } from '../store/projects';
import { Task } from '../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import { Plus, Trash2, Save, RefreshCw, User, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function ManagerDashboard() {
  const { user } = useAuthStore();
  const { tasks, fetchTasks, addTask, updateTask, deleteTask, getTasksByAssignee } = useTaskStore();
  const { metrics, fetchMetrics, addMetric, updateMetric } = usePerformanceStore();
  const { workloadData, fetchWorkloadData, updateWorkloadData } = useWorkloadStore();
  const { projects, fetchProjects, addProject, updateProject, deleteProject } = useProjectStore();
  
  const [activeTab, setActiveTab] = useState('tasks');
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    department: 'Engineering',
  });
  
  const [performanceSettings, setPerformanceSettings] = useState({
    completionRate: 80,
    efficiencyScore: 75,
    autoGenerate: true,
  });
  
  const [workloadSettings, setWorkloadSettings] = useState({
    todo: 5,
    in_progress: 3,
    completed: 8,
    autoGenerate: true,
  });
  
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'planning',
  });

  // Get all users from auth store for employee selection
  const allUsers = Object.values(useAuthStore.getState())
    .filter((item): item is { id: string; name: string; avatar: string; role: string; department: string } => 
      typeof item === 'object' && 
      item !== null && 
      'id' in item && 
      'name' in item &&
      'role' in item &&
      item.role === 'employee'
    );

  useEffect(() => {
    if (user?.id) {
      fetchTasks(user.id);
      fetchMetrics(user.id);
      fetchWorkloadData(user.id);
      fetchProjects(user.id);
    }
  }, [user?.id, fetchTasks, fetchMetrics, fetchWorkloadData, fetchProjects]);

  const handleAddTask = () => {
    if (newTask.title && user?.id) {
      addTask({
        ...newTask,
        assignee: {
          id: 'user-1',
          name: 'Employee 1',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
        },
        createdBy: user.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      } as Omit<Task, 'id' | 'createdAt'>);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        department: 'Engineering',
      });
    }
  };

  const handleAddMetric = () => {
    if (user?.id) {
      addMetric({
        userId: user.id,
        completionRate: performanceSettings.completionRate,
        efficiencyScore: performanceSettings.efficiencyScore,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const handleAddWorkload = () => {
    if (user?.id) {
      Object.entries(workloadSettings).forEach(([status, count]) => {
        if (status !== 'autoGenerate') {
          updateWorkloadData(user.id, status, count);
        }
      });
    }
  };

  const handleAddProject = () => {
    if (newProject.name && user?.id) {
      addProject({
        ...newProject,
        startDate: new Date(),
        endDate: null,
        createdBy: user.id,
        createdAt: new Date(),
      });
      setNewProject({
        name: '',
        description: '',
        status: 'planning',
      });
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'on_hold':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Manager Dashboard</h1>
            <p className="text-gray-600">Manage your team's tasks, performance, and projects</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="workload">Workload</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add New Task</CardTitle>
                <CardDescription>Create a new task for employees</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-title">Task Title</Label>
                    <Input 
                      id="task-title" 
                      value={newTask.title} 
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      placeholder="Enter task title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-department">Department</Label>
                    <Select 
                      value={newTask.department} 
                      onValueChange={(value) => setNewTask({...newTask, department: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-description">Description</Label>
                  <Textarea 
                    id="task-description" 
                    value={newTask.description} 
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Enter task description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-priority">Priority</Label>
                    <Select 
                      value={newTask.priority} 
                      onValueChange={(value) => setNewTask({...newTask, priority: value as Task['priority']})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-status">Status</Label>
                    <Select 
                      value={newTask.status} 
                      onValueChange={(value) => setNewTask({...newTask, status: value as Task['status']})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-assignee">Assignee</Label>
                    <Select 
                      value={newTask.assignee?.id} 
                      onValueChange={(value) => {
                        const assignee = allUsers.find(u => u.id === value);
                        if (assignee) {
                          setNewTask({
                            ...newTask, 
                            assignee: {
                              id: assignee.id,
                              name: assignee.name,
                              avatar: assignee.avatar
                            }
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {allUsers.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name} ({employee.department})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleAddTask} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Employee Tasks</CardTitle>
                <CardDescription>View and manage tasks assigned to employees</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {allUsers.map((employee) => {
                    const employeeTasks = getTasksByAssignee(employee.id);
                    return (
                      <div key={employee.id} className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-10 w-10 rounded-full overflow-hidden">
                            <img src={employee.avatar} alt={employee.name} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <h3 className="font-medium">{employee.name}</h3>
                            <p className="text-sm text-gray-500">{employee.department}</p>
                          </div>
                        </div>
                        
                        {employeeTasks.length > 0 ? (
                          <div className="space-y-3">
                            {employeeTasks.map((task) => (
                              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  {getStatusIcon(task.status)}
                                  <div>
                                    <h4 className="font-medium">{task.title}</h4>
                                    <p className="text-sm text-gray-500">
                                      <span className={getPriorityColor(task.priority)}>{task.priority}</span> • 
                                      Due: {new Date(task.dueDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Select 
                                    value={task.status} 
                                    onValueChange={(value) => updateTask(task.id, { status: value as Task['status'] })}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="todo">To Do</SelectItem>
                                      <SelectItem value="in_progress">In Progress</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                      <SelectItem value="on_hold">On Hold</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button variant="destructive" size="icon" onClick={() => deleteTask(task.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            No tasks assigned to this employee
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Settings</CardTitle>
                <CardDescription>Configure performance metrics for your team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Task Completion Rate</Label>
                      <span className="text-sm font-medium">{performanceSettings.completionRate}%</span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[performanceSettings.completionRate]}
                      onValueChange={(value) => setPerformanceSettings({...performanceSettings, completionRate: value[0]})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Efficiency Score</Label>
                      <span className="text-sm font-medium">{performanceSettings.efficiencyScore}%</span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[performanceSettings.efficiencyScore]}
                      onValueChange={(value) => setPerformanceSettings({...performanceSettings, efficiencyScore: value[0]})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Auto-generate metrics</Label>
                    <Switch
                      checked={performanceSettings.autoGenerate}
                      onCheckedChange={(checked) => setPerformanceSettings({...performanceSettings, autoGenerate: checked})}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleAddMetric} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="workload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Workload Settings</CardTitle>
                <CardDescription>Configure workload distribution for your team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>To Do Tasks</Label>
                      <span className="text-sm font-medium">{workloadSettings.todo}</span>
                    </div>
                    <Slider
                      min={0}
                      max={20}
                      step={1}
                      value={[workloadSettings.todo]}
                      onValueChange={(value) => setWorkloadSettings({...workloadSettings, todo: value[0]})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>In Progress Tasks</Label>
                      <span className="text-sm font-medium">{workloadSettings.in_progress}</span>
                    </div>
                    <Slider
                      min={0}
                      max={20}
                      step={1}
                      value={[workloadSettings.in_progress]}
                      onValueChange={(value) => setWorkloadSettings({...workloadSettings, in_progress: value[0]})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Completed Tasks</Label>
                      <span className="text-sm font-medium">{workloadSettings.completed}</span>
                    </div>
                    <Slider
                      min={0}
                      max={20}
                      step={1}
                      value={[workloadSettings.completed]}
                      onValueChange={(value) => setWorkloadSettings({...workloadSettings, completed: value[0]})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Auto-generate workload</Label>
                    <Switch
                      checked={workloadSettings.autoGenerate}
                      onCheckedChange={(checked) => setWorkloadSettings({...workloadSettings, autoGenerate: checked})}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleAddWorkload} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add New Project</CardTitle>
                <CardDescription>Create a new project for your team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input 
                    id="project-name" 
                    value={newProject.name} 
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    placeholder="Enter project name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="project-description">Description</Label>
                  <Textarea 
                    id="project-description" 
                    value={newProject.description} 
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    placeholder="Enter project description"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="project-status">Status</Label>
                  <Select 
                    value={newProject.status} 
                    onValueChange={(value) => setNewProject({...newProject, status: value as 'planning' | 'in_progress' | 'completed' | 'on_hold'})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleAddProject} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Existing Projects</CardTitle>
                <CardDescription>Manage your team's projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{project.name}</h3>
                        <p className="text-sm text-gray-500">{project.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select 
                          value={project.status} 
                          onValueChange={(value) => updateProject(project.id, { status: value as 'planning' | 'in_progress' | 'completed' | 'on_hold' })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planning">Planning</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="on_hold">On Hold</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="destructive" size="icon" onClick={() => deleteProject(project.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 