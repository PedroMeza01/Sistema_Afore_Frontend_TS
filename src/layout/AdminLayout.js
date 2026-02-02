// layouts/AdminLayout.js
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import NavAdmin from '../components/NavAdmin';

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`admin-layout ${collapsed ? 'collapsed' : ''}`}>
      <NavAdmin collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
