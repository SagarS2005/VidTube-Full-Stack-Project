import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { ToastProvider } from "../context/ToastContext";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 992);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebarMobile = () => {
    // Only close on mobile screen widths (< 992px)
    if (window.innerWidth < 992) {
      setSidebarOpen(false);
    }
  };

  return (
    <ToastProvider>
      <div className="app-shell">
        <Navbar onToggleSidebar={toggleSidebar} />
        <div className="app-body">
          <Sidebar isOpen={sidebarOpen} onCloseMobile={closeSidebarMobile} />
          <main className={`main-viewport ${sidebarOpen ? "with-sidebar" : "with-collapsed-sidebar"}`}>
            <div className="main-content-inner">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
