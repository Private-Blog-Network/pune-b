'use client';

import { useEffect, useState } from 'react';
import { FaClipboardList } from 'react-icons/fa';

type AttendanceData = {
  name: string;
  attendanceLeft: number;
};

export default function TodayAttendanceAnalytics() {
  const [data, setData] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/today-attendance')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500">Loading attendance data...</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
        Today Attendance Analytics
      </h2>

      <div className="flex flex-wrap justify-center gap-6 p-4">
        {data.map((course) => (
          <div
            key={course.name}
            className={`w-56 rounded-xl shadow p-4 border flex flex-col items-center transition ${
              course.attendanceLeft === 0
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <FaClipboardList
              className={`text-3xl mb-2 ${
                course.attendanceLeft === 0 ? 'text-green-600' : 'text-red-600'
              }`}
            />
            <p className="text-sm text-gray-600 text-center">{course.name}</p>
            <p className="text-2xl font-bold text-gray-800">{course.attendanceLeft}</p>
            <p className="text-xs text-gray-500">Attendance Left</p>
          </div>
        ))}
      </div>
    </div>
  );
}
