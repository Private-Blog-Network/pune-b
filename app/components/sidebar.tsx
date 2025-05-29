"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import TopBar from "./topbar";
import {
  FaBars,
  FaHome,
  FaUserPlus,
  FaUsers,
  FaChalkboardTeacher,
  FaEye,
  FaBookOpen,
  FaEdit,
  FaCalendarCheck,
  FaClipboardList,
  FaChartBar,
  FaSignOutAlt,
} from "react-icons/fa";

const menuItems = [
  { label: "Home", href: "/dashboard", icon: <FaHome /> },
  { label: "Add Students", href: "/addstudent", icon: <FaUserPlus /> },
  { label: "View Students", href: "/view-students", icon: <FaUsers /> },
  { label: "Add Teachers", href: "/add-teachers", icon: <FaChalkboardTeacher /> },
  { label: "View Teachers", href: "/view-teachers", icon: <FaEye /> },
  { label: "Add Course", href: "/add-course", icon: <FaBookOpen /> },
  { label: "View Attendance", href: "/view-attendance", icon: <FaCalendarCheck /> },
  { label: "Manage Attendance", href: "/manage-attendance", icon: <FaClipboardList /> },
  { label: "Manage Results", href: "/manage-results", icon: <FaChartBar /> },
  { label: "Logout", href: "/logout", icon: <FaSignOutAlt /> },
];

export default function SideNav() {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  return (
    <>
        <TopBar/>
    
    <div className={`h-screen z-100 bg-gray-900 fixed text-white flex flex-col ${expanded ? "w-60" : "w-20"} transition-all duration-300`}>
      <button
        className="p-4 focus:outline-none text-xl"
        onClick={() => setExpanded(!expanded)}
      >
        <FaBars />
      </button>

      <nav className="flex-1">
        {menuItems.map(({ label, href, icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              href={href}
              key={href}
              className={`flex items-center gap-4 px-4 py-3 hover:bg-gray-700 transition-colors ${
                isActive ? "bg-blue-600" : ""
              }`}
            >
              <span className="text-lg">{icon}</span>
              {expanded && <span className="text-sm">{label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
    </>

  );
}
