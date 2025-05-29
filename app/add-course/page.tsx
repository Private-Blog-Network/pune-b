'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaMinus, FaTrash, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';
import SideNav from '../components/sidebar';

export default function AddCoursePage() {
  const [courseName, setCourseName] = useState('');
  const [courseDuration, setCourseDuration] = useState('');
  const [courseFee, setCourseFee] = useState('');
  const [subjects, setSubjects] = useState(['']);
  const [courses, setCourses] = useState([]);
  const [editId, setEditId] = useState<number | null>(null);

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/add-course');
      const data = await res.json();
      if (data.success) setCourses(data.courses);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSubjectChange = (index: number, value: string) => {
    const newSubjects = [...subjects];
    newSubjects[index] = value;
    setSubjects(newSubjects);
  };

  const addSubjectField = () => {
    setSubjects([...subjects, '']);
  };

  const removeSubjectField = (index: number) => {
    if (subjects.length === 1) return;
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      id: editId,
      name: courseName.trim(),
      duration: courseDuration,
      fee: courseFee.trim(),
      subjects: subjects.filter((s) => s.trim() !== ''),
    };

    const method = editId ? 'PUT' : 'POST';

    try {
      const res = await fetch('/api/add-course', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editId ? 'Course updated' : 'Course added');
        setCourseName('');
        setCourseDuration('');
        setCourseFee('');
        setSubjects(['']);
        setEditId(null);
        fetchCourses();
      } else {
        toast.error(data.message || 'Failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error submitting form');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      const res = await fetch(`/api/add-course?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Course deleted');
        fetchCourses();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Delete failed');
    }
  };

  const handleEdit = (course: any) => {
    setEditId(course.id);
    setCourseName(course.name);
    setCourseDuration(course.duration_months);
    setCourseFee(course.fee_inr);
    setSubjects(course.subjects);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <SideNav />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{editId ? 'Edit Course' : 'Add New Course'}</h1>

        {/* Course Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow-md">
          <div>
            <label className="block font-semibold mb-1">Course Name</label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Duration (months)</label>
            <input
              type="number"
              min="1"
              value={courseDuration}
              onChange={(e) => setCourseDuration(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Fee (INR)</label>
            <input
              type="number"
              min="0"
              value={courseFee}
              onChange={(e) => setCourseFee(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Subjects</label>
            {subjects.map((subject, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => handleSubjectChange(index, e.target.value)}
                  className="flex-1 border rounded px-3 py-2"
                  required
                />
                <button
                  type="button"
                  onClick={addSubjectField}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <FaPlus />
                </button>
                {subjects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubjectField(index)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    <FaMinus />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            {editId ? 'Update Course' : 'Add Course'}
          </button>
        </form>

        {/* Course Table */}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">All Courses</h2>
          <div className="overflow-auto">
            <table className="min-w-full bg-white rounded shadow-md">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-3">Name</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Fee</th>
                  <th className="p-3">Subjects</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course: any) => (
                  <tr key={course.id} className="border-t">
                    <td className="p-3">{course.name}</td>
                    <td className="p-3">{course.duration_months} months</td>
                    <td className="p-3">₹{course.fee_inr}</td>
                    <td className="p-3">
                      {course.subjects.join(', ')}
                    </td>
                    <td className="p-3 flex space-x-2">
                      <button
                        onClick={() => handleEdit(course)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
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
            {courses.length === 0 && (
              <p className="text-center text-gray-500 mt-4">No courses found.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
