'use client';

import { useEffect, useState } from 'react';
import {
  FaBook,
  FaUsers,
  FaChalkboardTeacher,
  FaLayerGroup,
} from 'react-icons/fa';

type Stats = {
  courses: number;
  students: number;
  standards: number;
  teachers: number;
};

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500">Loading dashboard...</p>;
  }

  if (!stats) {
    return <p className="text-center text-red-500">Failed to load stats</p>;
  }

  const cards = [
    {
      label: 'Total Courses',
      value: stats.courses,
      icon: <FaBook className="text-blue-600 text-3xl mb-2" />,
    },
    {
      label: 'Total Students',
      value: stats.students,
      icon: <FaUsers className="text-green-600 text-3xl mb-2" />,
    },
    {
      label: 'Total Standards',
      value: stats.standards,
      icon: <FaLayerGroup className="text-yellow-600 text-3xl mb-2" />,
    },
    {
      label: 'Total Teachers',
      value: stats.teachers,
      icon: <FaChalkboardTeacher className="text-purple-600 text-3xl mb-2" />,
    },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-6 p-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="w-48 bg-white rounded-xl shadow p-4 flex flex-col items-center border border-gray-100 hover:shadow-lg transition"
        >
          {card.icon}
          <p className="text-sm text-gray-600">{card.label}</p>
          <p className="text-2xl font-bold text-gray-800">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
