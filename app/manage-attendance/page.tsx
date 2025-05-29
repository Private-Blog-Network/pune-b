'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import SideNav from '@/app/components/sidebar';

const AddAttendance = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        const data = await res.json();
        if (data.success) {
          setCourses(data.courses);
        } else {
          toast.error('Failed to fetch courses');
        }
      } catch (err) {
        console.error(err);
        toast.error('Error loading courses');
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchStudentsAndAttendance = async () => {
      if (!selectedCourse || !date) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/attendance?course=${selectedCourse}&date=${date}`);
        const data = await res.json();
        if (data.success) {
          setStudents(data.students);
          const initial = {};
          data.students.forEach(student => {
            initial[student.id] = data.records?.find(r => r.student_id === student.id)?.status || '';
          });
          setAttendance(initial);
        } else {
          toast.error('Failed to load students');
        }
      } catch (err) {
        console.error(err);
        toast.error('Error loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndAttendance();
  }, [selectedCourse, date]);

  const handleAttendanceChange = (id, status) => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const handleSubmit = async () => {
    if (!selectedCourse || !date) {
      toast.error('Course and date required');
      return;
    }

    const incomplete = Object.values(attendance).some(status => status === '');
    if (incomplete) {
      toast.error('Please mark attendance for all students');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course: selectedCourse, date, records: attendance }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Attendance saved successfully');
      } else {
        toast.error(data.message || 'Save failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SideNav />
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-6">Add / View Attendance</h2>

        <div className="mb-4">
          <label className="block mb-1 font-semibold">Select Course:</label>
          <select
            className="border p-2 w-full rounded"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">-- Select Course --</option>
            {courses.map((course) => (
              <option key={course.id} value={course.name}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-semibold">Select Date:</label>
          <input
            type="date"
            className="border p-2 w-full rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {loading ? (
          <div>Loading students...</div>
        ) : students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Student</th>
                  <th className="border px-4 py-2">Present</th>
                  <th className="border px-4 py-2">Absent</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="border px-4 py-2">{student.name}</td>
                    <td className="border px-4 py-2 text-center">
                      <input
                        type="radio"
                        name={`attendance-${student.id}`}
                        checked={attendance[student.id] === 'present'}
                        onChange={() => handleAttendanceChange(student.id, 'present')}
                      />
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <input
                        type="radio"
                        name={`attendance-${student.id}`}
                        checked={attendance[student.id] === 'absent'}
                        onChange={() => handleAttendanceChange(student.id, 'absent')}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : selectedCourse && (
          <p>No students found for this course.</p>
        )}

        {students.length > 0 && (
          <div className="mt-6">
            <button
              disabled={saving}
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 flex items-center"
            >
              {saving && <FaSpinner className="animate-spin mr-2" />}
              Save Attendance
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default AddAttendance;
