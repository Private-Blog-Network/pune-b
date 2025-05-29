'use client';

import { useEffect, useState } from 'react';
import { FaEllipsisV } from 'react-icons/fa';
import { Menu } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import SideNav from '../components/sidebar';
interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  photo: string;
}

export default function ViewStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchStudents();
  }, [page, search]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '10', search });
      const res = await fetch(`/api/view-students?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch students', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm('Are you sure you want to delete this student?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/delete-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Student deleted successfully');
        fetchStudents(); // Refresh
      } else {
        toast.error(data.message || 'Failed to delete student');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete student');
    }
  };

  function convertDriveUrl(url: string) {
    try {
      const match = url.match(/[-\w]{25,}/);
      if (match) {
        const fileId = match[0];
        return `https://drive.google.com/thumbnail?id=${fileId}`;
      }
      return url;
    } catch {
      return url;
    }
  }

  return (
    <>
    <SideNav/>
    <div className="p-30  left-15 w-full">
      <h1 className="text-3xl font-bold mb-6">View Students</h1>

      <form onSubmit={handleSearchSubmit} className="flex items-center mb-6">
        <input
          type="text"
          placeholder="Search students..."
          className="border p-2 rounded-l-md w-72"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Photo</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Address</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : students.length > 0 ? (
              students.map((student) => (
                <tr key={student.id} className="relative border-t hover:bg-gray-50">

                  <td className="p-3">
                    <img
                      src={convertDriveUrl(student.photo)}
                      alt={student.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </td>
                  <td className="p-3">{student.name}</td>
                  <td className="p-3">{student.email}</td>
                  <td className="p-3">{student.phone}</td>
                  <td className="p-3">{student.address}</td>
                  <td className="p-3 text-center">
  <div className=" inline-block">
    <Menu as="div">
      <Menu.Button className="text-gray-600 hover:text-gray-900">
        <FaEllipsisV size={18} />
      </Menu.Button>
      <Menu.Items className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md z-50">
        <div className="py-1">
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => router.push(`/manage-student/${student.id}`)}
                className={`${
                  active ? 'bg-gray-100' : ''
                } w-full text-left px-4 py-2 text-sm`}
              >
                Manage
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => router.push(`/view-attendance/${student.id}`)}
                className={`${
                  active ? 'bg-gray-100' : ''
                } w-full text-left px-4 py-2 text-sm`}
              >
                View Attendance
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => router.push(`/last-locations/${student.id}`)}
                className={`${
                  active ? 'bg-gray-100' : ''
                } w-full text-left px-4 py-2 text-sm`}
              >
                Last Locations
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => handleDelete(student.id)}
                className={`${
                  active ? 'bg-red-100 text-red-700' : 'text-red-600'
                } w-full text-left px-4 py-2 text-sm`}
              >
                Delete Student
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  </div>
</td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-6 text-center">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 space-x-2">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="flex items-center px-4">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
    </>
  );
}
