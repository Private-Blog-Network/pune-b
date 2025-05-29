'use client';

import { useEffect, useState } from 'react';
import { FaEllipsisV } from 'react-icons/fa';
import { Menu } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import SideNav from '../components/sidebar';

interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  photo_url: string;
}

export default function ViewTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchTeachers();
  }, [page, search]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '10', search });
      const res = await fetch(`/api/view-teachers?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTeachers(data.teachers);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch teachers', error);
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
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    try {
      const res = await fetch(`/api/manage-teacher?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Teacher deleted successfully');
        fetchTeachers();
      } else {
        toast.error(data.message || 'Failed to delete teacher');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete teacher');
    }
  };

  const convertDriveUrl = (url: string) => {
    try {
      const match = url.match(/[-\w]{25,}/);
      return match ? `https://drive.google.com/thumbnail?id=${match[0]}` : url;
    } catch {
      return url;
    }
  };

  return (
    <>
      <SideNav />
      <div className="p-30 left-15 w-full">
        <h1 className="text-3xl font-bold mb-6">View Teachers</h1>

        <form onSubmit={handleSearchSubmit} className="flex items-center mb-6">
          <input
            type="text"
            placeholder="Search teachers..."
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
                <tr><td colSpan={6} className="p-6 text-center">Loading...</td></tr>
              ) : teachers.length > 0 ? (
                teachers.map((teacher) => (
                  <tr key={teacher.id} className="relative border-t hover:bg-gray-50">
                    <td className="p-3">
                      <img
                        src={convertDriveUrl(teacher.photo_url)}
                        alt={teacher.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </td>
                    <td className="p-3">{teacher.name}</td>
                    <td className="p-3">{teacher.email}</td>
                    <td className="p-3">{teacher.phone}</td>
                    <td className="p-3">{teacher.address}</td>
                    <td className="p-3 text-center">
                      <div className="inline-block">
                        <Menu as="div">
                          <Menu.Button className="text-gray-600 hover:text-gray-900">
                            <FaEllipsisV size={18} />
                          </Menu.Button>
                          <Menu.Items className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md z-50">
                            <div className="py-1">
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => router.push(`/manage-teacher/${teacher.id}`)}
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
                                    onClick={() => handleDelete(teacher.id)}
                                    className={`${
                                      active ? 'bg-red-100 text-red-700' : 'text-red-600'
                                    } w-full text-left px-4 py-2 text-sm`}
                                  >
                                    Delete Teacher
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
                <tr><td colSpan={6} className="p-6 text-center">No teachers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

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
