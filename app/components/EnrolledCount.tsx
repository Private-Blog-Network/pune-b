'use client';

import { useEffect, useState } from 'react';
import { FaGraduationCap } from 'react-icons/fa';

type CourseCount = {
  name: string;
  count: number;
};

export default function EnrolledStudentsByCourse() {
  const [data, setData] = useState<CourseCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/student-count-by-course')
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
    return <p className="text-center text-gray-500">Loading course data...</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
        Enrolled Students in Courses
      </h2>

      <div className="flex flex-wrap justify-center gap-6 p-4">
        {data.map((course) => (
          <div
            key={course.name}
            className="w-56 bg-white rounded-xl shadow p-4 border border-gray-100 flex flex-col items-center hover:shadow-md transition"
          >
            <FaGraduationCap className="text-3xl text-indigo-600 mb-2" />
            <p className="text-sm text-gray-500 text-center">{course.name}</p>
            <p className="text-2xl font-bold text-gray-800">{course.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
