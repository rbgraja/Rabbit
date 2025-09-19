import React, { useState, Suspense } from "react";
import { FaBars } from "react-icons/fa";
import Adminsidebar from "./Adminsidebar";
import { Outlet } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function Adminlayout() {
  const [isidebaropen, setissidebaropen] = useState(false);

  const toggleSidebar = () => {
    setissidebaropen(!isidebaropen);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* mobile side bar */}
      <div className="flex md:hidden p-4 bg-gray-900 text-white z-20">
        <button onClick={toggleSidebar}>
          <FaBars size={24} />
        </button>
        <h1 className="ml-4 text-xl font-medium">Admin Dashboard</h1>
      </div>

      {/* overlay mobile side bar */}
      {isidebaropen && (
        <div
          className="fixed inset-0 z-10 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* sidebar */}
      <div
        className={`bg-gray-900 w-64 min-h-screen text-white absolute md:relative transform ${
          isidebaropen ? "translate-x-0" : "-translate-x-full"
        } 
         transition-transform duration-300 md:translate-x-0 md:static md:block z-20`}
      >
        <Suspense
          fallback={
            <div className="p-6 space-y-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton
                  key={i}
                  height={20}
                  width="80%"
                  baseColor="#374151"
                  highlightColor="#4B5563"
                />
              ))}
            </div>
          }
        >
          <Adminsidebar />
        </Suspense>
      </div>

      {/* main content */}
      <div className="flex-grow p-6 overflow-auto">
        <Suspense
          fallback={
            <div>
              <Skeleton height={40} width="50%" className="mb-4" />
              <Skeleton count={6} height={28} className="mb-3" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}

export default Adminlayout;
