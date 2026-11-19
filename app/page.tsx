'use client';

import React, { useEffect, useState } from 'react';
import AuthModal from '@/components/AuthModal';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import DashboardView from '@/components/DashboardView';
import GoalsView from '@/components/GoalsView';
import TasksView from '@/components/TasksView';
import SummaryView from '@/components/SummaryView';
import Settings from '@/components/Settings';

interface User {
  id: string;
  name: string;
  email: string;
}

export default function Page() {
  // 1. Auth state: Stores the logged-in user and JWT token
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // 2. Navigation state: Which sidebar tab is currently active?
  const [activeTab, setActiveTab] = useState<'dashboard' | 'goals' | 'tasks' | 'summary' | 'settings'>('dashboard');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  // Helper to open Tasks page filtered to a specific goal
  const handleSelectGoalTasks = (goalId: string) => {
    setSelectedGoalId(goalId);
    setActiveTab('tasks');
  };

  // 3. When page loads: check if a previous session exists in localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('agent_token');
    const savedUser = localStorage.getItem('agent_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('agent_token');
        localStorage.removeItem('agent_user');
      }
    }
  }, []);

  // 4. Logout handler: Clears memory and localStorage
  const handleLogout = () => {
    localStorage.removeItem('agent_token');
    localStorage.removeItem('agent_user');
    setUser(null);
    setToken(null);
    setActiveTab('dashboard');
  };

  // 5. SCENARIO A: If NOT logged in -> Show the AuthModal!
  if (!user || !token) {
    return (
      <AuthModal
        onAuthSuccess={(userData, userToken) => {
          setUser(userData);
          setToken(userToken);
        }}
      />
    );
  }

  // 6. SCENARIO B: If LOGGED IN -> Show Sidebar + Navbar + Content!
  return (
    <div className="flex h-screen bg-[#f8f9fe] overflow-hidden">
      {/* 1. Left Dark Purple Sidebar */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* 2. Right Main Layout Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Top Header / Navbar - Sticky with Frosted Glass */}
        <Navbar user={user} onLogout={handleLogout} />

        {/* Dynamic View Canvas */}
        <main className="flex-1 px-6 lg:px-8 py-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              user={user}
              token={token}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onSelectGoalTasks={handleSelectGoalTasks}
            />
          )}
          {activeTab === 'goals' && (
            <GoalsView
              user={user}
              token={token}
              onNavigateToDashboard={() => setActiveTab('dashboard')}
              onSelectGoalTasks={handleSelectGoalTasks}
            />
          )}
          {activeTab === 'tasks' && (
            <TasksView
              user={user}
              token={token}
              selectedGoalId={selectedGoalId}
              onClearGoalFilter={() => setSelectedGoalId(null)}
              onSelectGoalId={(id) => setSelectedGoalId(id)}
            />
          )}
          {activeTab === 'summary' && (
            <SummaryView user={user} token={token} />
          )}
          {activeTab === 'settings' && (
            <Settings user={user} onLogout={handleLogout} />
          )}
        </main>
      </div>
    </div>
  );
}
