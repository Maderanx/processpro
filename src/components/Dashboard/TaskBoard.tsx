import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useTaskStore } from '../../store/tasks';
import { Task } from '../../types';

const statusColumns = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'completed', title: 'Completed' },
];

const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
};

export default function TaskBoard() {
  const { tasks, updateTask } = useTaskStore();

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId as Task['status'];

    updateTask(taskId, { status: newStatus });
  };

  return (
    <div className="h-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          {statusColumns.map(column => (
            <div key={column.id} className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-4">{column.title}</h3>

              <Droppable droppableId={column.id}>
                {provided => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                    {tasks
                      .filter(task => task.status === column.id)
                      .map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {provided => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white rounded-lg p-4 shadow-sm"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{task.title}</h4>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    priorityColors[task.priority]
                                  }`}
                                >
                                  {task.priority}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{task.description}</p>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
