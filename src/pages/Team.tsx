import React from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useAuthStore } from '../store/auth';
import { MessageSquare, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const teamMembers = [
  {
    id: '1',
    name: 'John Manager',
    role: 'Project Manager',
    email: 'manager@example.com',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    department: 'Management',
    status: 'online',
  },
  {
    id: '2',
    name: 'Jane Employee',
    role: 'Software Developer',
    email: 'employee@example.com',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    department: 'Engineering',
    status: 'online',
  },
  {
    id: '3',
    name: 'Michael Wilson',
    role: 'UI/UX Designer',
    email: 'michael@example.com',
    avatar:
      'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    department: 'Design',
    status: 'offline',
  },
  {
    id: '4',
    name: 'Sarah Brown',
    role: 'Product Manager',
    email: 'sarah@example.com',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    department: 'Product',
    status: 'busy',
  },
];

export default function Team() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleChat = (memberId: string) => {
    navigate('/chat');
  };

  const handleCall = (memberId: string) => {
    navigate('/meetings');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Team Members</h1>
          <p className="text-gray-600">Connect and collaborate with your team</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map(member => (
            <div key={member.id} className="bg-white rounded-lg shadow-sm p-6 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <img src={member.avatar} alt={member.name} className="h-12 w-12 rounded-full" />
                  <div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                </div>
                <div
                  className={`h-3 w-3 rounded-full ${
                    member.status === 'online'
                      ? 'bg-green-500'
                      : member.status === 'busy'
                        ? 'bg-red-500'
                        : 'bg-gray-300'
                  }`}
                />
              </div>

              <div className="text-sm text-gray-600 mb-4">
                <p>Department: {member.department}</p>
                <p>Email: {member.email}</p>
              </div>

              <div className="mt-auto flex gap-2">
                <button
                  onClick={() => handleChat(member.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  Message
                </button>
                <button
                  onClick={() => handleCall(member.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  Call
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
