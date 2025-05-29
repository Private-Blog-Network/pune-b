'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function StandardPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [standards, setStandards] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null); // For editing state
  const [fetching, setFetching] = useState(false);

  // Fetch standards from the API
  const fetchStandards = async () => {
    setFetching(true);
    try {
      const res = await fetch('/api/add-standard');
      const data = await res.json();
      if (res.ok) {
        setStandards(data.standards);
      } else {
        toast.error(data.error || 'Failed to fetch standards');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setFetching(false);
    }
  };

  // Load standards on component mount
  useEffect(() => {
    fetchStandards();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Standard name is required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/add-standard', {
        method: editing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim(), id: editing?.id }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(editing ? 'Standard updated successfully' : 'Standard added successfully');
        setName('');
        setEditing(null);
        fetchStandards(); // Reload standards
      } else {
        toast.error(data.error || 'Something went wrong');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (standard: any) => {
    setEditing(standard);
    setName(standard.name);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this standard?')) {
      setLoading(true);
      try {
        const res = await fetch('/api/add-standard', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });

        const data = await res.json();

        if (res.ok) {
          toast.success('Standard deleted successfully');
          fetchStandards(); // Reload standards
        } else {
          toast.error(data.error || 'Failed to delete standard');
        }
      } catch (error) {
        toast.error('Network error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 border rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">{editing ? 'Edit Standard' : 'Add New Standard'}</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          type="text"
          placeholder="Standard name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Saving...' : editing ? 'Update Standard' : 'Add Standard'}
        </button>
      </form>

      <div>
        {fetching ? (
          <p>Loading standards...</p>
        ) : (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="border p-2">ID</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {standards.length === 0 ? (
                <tr>
                  <td colSpan={3} className="border p-2 text-center">
                    No standards available
                  </td>
                </tr>
              ) : (
                standards.map((standard) => (
                  <tr key={standard.id}>
                    <td className="border p-2">{standard.id}</td>
                    <td className="border p-2">{standard.name}</td>
                    <td className="border p-2">
                      <button
                        onClick={() => handleEdit(standard)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(standard.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
