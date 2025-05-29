'use client';

import { useEffect, useState } from 'react';
import {
  FaChalkboardTeacher,
  FaBook,
  FaClock,
  FaCalendarAlt,
  FaTrash,
} from 'react-icons/fa';
import SideNav from '../components/sidebar';

type Teacher = { id: number; name: string };
type Course = { id: number; name: string; subjects: string[] };
type TimetableEntry = {
  id: number;
  day: string;
  course_name: string;
  subject: string;
  start_time: string;
  end_time: string;
};

export default function AddTeacherTimetable() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<number | ''>('');
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [subjectTimes, setSubjectTimes] = useState<Record<string, { start: string; end: string }>>({});
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetch('/api/add-teacher')
      .then(res => res.json())
      .then(res => setTeachers(res.data || []));

    fetch('/api/courses')
      .then(res => res.json())
      .then(res => setCourses(res.courses || []));
  }, []);

  useEffect(() => {
    if (selectedTeacher) {
      fetch(`/api/manage-timetable?teacher_id=${selectedTeacher}`)
        .then(res => res.json())
        .then(res => {
          setTimetable(res.data || []);
        });
    } else {
      setTimetable([]);
    }
  }, [selectedTeacher]);

  const allSubjects = courses
    .filter(c => selectedCourses.includes(c.id))
    .flatMap(c => c.subjects);
  const uniqueSubjects = [...new Set(allSubjects)];

  const handleSubjectTimeChange = (subject: string, type: 'start' | 'end', value: string) => {
    setSubjectTimes(prev => ({
      ...prev,
      [subject]: { ...prev[subject], [type]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const subjectDetails = selectedSubjects.map(subject => ({
      subject,
      start_time: subjectTimes[subject]?.start || '',
      end_time: subjectTimes[subject]?.end || '',
    }));

    const payload = {
      teacher_id: selectedTeacher,
      courses: selectedCourses,
      subjects: subjectDetails,
      days: selectedDays,
    };

    const res = await fetch('/api/timetable/create-multiple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    alert(result.message);

    if (selectedTeacher) {
      const refresh = await fetch(`/api/manage-timetable?teacher_id=${selectedTeacher}`);
      const data = await refresh.json();
      setTimetable(data.data || []);
    }
  };

  const handleDeleteTimetable = async (id: number) => {
    const confirmed = confirm('Are you sure you want to delete this timetable entry?');
    if (!confirmed) return;

    const res = await fetch(`/api/manage-timetable?id=${id}`, {
      method: 'DELETE',
    });

    const result = await res.json();
    alert(result.message);

    setTimetable(prev => prev.filter(t => t.id !== id));
  };

  return (
    <>
      <SideNav />
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow space-y-6">
        <h2 className="text-2xl font-bold text-center mb-4">Add Teacher Timetable</h2>

        {/* Teacher Select */}
        <div>
          <label className="flex items-center gap-2 mb-2 font-medium">
            <FaChalkboardTeacher /> Select Teacher
          </label>
          <select
            value={selectedTeacher}
            onChange={e => setSelectedTeacher(Number(e.target.value))}
            required
            className="w-full border p-2 rounded"
          >
            <option value="">-- Select Teacher --</option>
            {teachers.map(t => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Course Selection */}
        <div>
          <label className="flex items-center gap-2 mb-2 font-medium">
            <FaBook /> Select Course(s)
          </label>
          <div className="border rounded p-2 max-h-40 overflow-y-auto space-y-2">
            {courses.map(course => (
              <label key={course.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedCourses.includes(course.id)}
                  onChange={e => {
                    const newCourses = e.target.checked
                      ? [...selectedCourses, course.id]
                      : selectedCourses.filter(id => id !== course.id);
                    setSelectedCourses(newCourses);
                    setSelectedSubjects([]);
                    setSubjectTimes({});
                  }}
                />
                {course.name}
              </label>
            ))}
          </div>
        </div>

        {/* Subject Selection */}
        {uniqueSubjects.length > 0 && (
          <div>
            <label className="flex items-center gap-2 mb-2 font-medium">
              <FaBook /> Select Subject(s)
            </label>
            <div className="border rounded p-2 max-h-40 overflow-y-auto space-y-2">
              {uniqueSubjects.map(subject => (
                <label key={subject} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(subject)}
                    onChange={e => {
                      const newSubjects = e.target.checked
                        ? [...selectedSubjects, subject]
                        : selectedSubjects.filter(s => s !== subject);
                      setSelectedSubjects(newSubjects);
                      const updatedTimes = { ...subjectTimes };
                      if (!updatedTimes[subject]) updatedTimes[subject] = { start: '', end: '' };
                      setSubjectTimes(updatedTimes);
                    }}
                  />
                  {subject}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Subject Times */}
        {selectedSubjects.length > 0 && (
          <div className="space-y-4">
            <label className="flex items-center gap-2 font-medium">
              <FaClock /> Set Time for Each Subject
            </label>
            {selectedSubjects.map(subject => (
              <div key={subject} className="bg-gray-50 p-4 rounded border">
                <p className="font-semibold mb-2">{subject}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm">Start Time</label>
                    <input
                      type="time"
                      className="w-full border p-1 rounded"
                      value={subjectTimes[subject]?.start || ''}
                      onChange={e => handleSubjectTimeChange(subject, 'start', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm">End Time</label>
                    <input
                      type="time"
                      className="w-full border p-1 rounded"
                      value={subjectTimes[subject]?.end || ''}
                      onChange={e => handleSubjectTimeChange(subject, 'end', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Day Selection */}
        <div>
          <label className="flex items-center gap-2 mb-2 font-medium">
            <FaCalendarAlt /> Select Day(s)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {days.map(day => (
              <label key={day} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedDays.includes(day)}
                  onChange={e => {
                    const newDays = e.target.checked
                      ? [...selectedDays, day]
                      : selectedDays.filter(d => d !== day);
                    setSelectedDays(newDays);
                  }}
                />
                {day}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded w-full"
        >
          Save Timetable
        </button>
      </form>

      {/* Timetable Display */}
      {selectedTeacher && timetable.length > 0 && (
        <div className="max-w-5xl mx-auto mt-10 mb-10">
          <h3 className="text-xl font-bold mb-4">Existing Timetable</h3>
          {days.map(day => {
            const dayEntries = timetable.filter(entry => entry.day === day);
            if (dayEntries.length === 0) return null;

            return (
              <div key={day} className="mb-6 border rounded shadow">
                <h4 className="bg-gray-100 p-3 font-semibold text-lg border-b">{day}</h4>
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 border">Course</th>
                      <th className="p-2 border">Subject</th>
                      <th className="p-2 border">Start</th>
                      <th className="p-2 border">End</th>
                      <th className="p-2 border">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayEntries.map(entry => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="p-2 border">{entry.course_name}</td>
                        <td className="p-2 border">{entry.subject}</td>
                        <td className="p-2 border">{entry.start_time}</td>
                        <td className="p-2 border">{entry.end_time}</td>
                        <td className="p-2 border text-center">
                          <button
                            onClick={() => handleDeleteTimetable(entry.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
