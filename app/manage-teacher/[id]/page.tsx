'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa';
import SideNav from '@/app/components/sidebar';

const ManageTeacher = () => {
  const { id } = useParams();
  const router = useRouter();
  const [teacher, setTeacher] = useState<any>(null);
  const [loadingFields, setLoadingFields] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await fetch(`/api/get-teacher-by-id?id=${id}`);
        const data = await res.json();
        if (data.success) {
          setTeacher(data.teacher);
          setLoading(false);
          setPhotoPreview(data.teacher?.photo_url || null);
          setDocumentPreview(data.teacher?.document_url || null);
        } else {
          toast.error(data.message || 'Failed to fetch teacher');
        }
      } catch (error) {
        console.error(error);
        toast.error('Error fetching teacher');
      }
    };

    if (id) fetchTeacher();
  }, [id]);

  const updateField = async (field: string, value: any, isFile: boolean = false) => {
    if (!id) return;

    setLoadingFields(prev => ({ ...prev, [field]: true }));

    try {
      const formData = new FormData();
      formData.append('id', id as string);
      if (!isFile) formData.append(field, value);
      else if (value instanceof File) formData.append(field, value);

      const res = await fetch('/api/manage-teacher?id='+ id, {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        toast.success(`${field} updated successfully!`);
      } else {
        toast.error(result.message || `Failed to update ${field}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(`Error updating ${field}`);
    } finally {
      setLoadingFields(prev => ({ ...prev, [field]: false }));
    }
  };

  const deleteTeacher = async () => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;

    try {
      const res = await fetch(`/api/manage-teacher?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Teacher deleted successfully');
        router.push('/view-teachers');
      } else {
        toast.error(data.message || 'Failed to delete teacher');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error deleting teacher');
    }
  };

  const getDriveEmbedUrl = (url: string) => {
    const fileIdMatch = url?.match(/(?:id=)([^&]+)/);
    return fileIdMatch?.[1] ? `https://drive.google.com/file/d/${fileIdMatch[1]}/preview` : url;
  };

  const renderInput = (field: string, label: string, type: string = 'text') => {
    const value = field === 'dob' ? new Date(teacher?.[field]).toISOString().split('T')[0] : teacher?.[field] || '';
    return (
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={value}
          onChange={(e) => setTeacher({ ...teacher, [field]: e.target.value })}
          placeholder={label}
          className="border p-2 w-full rounded"
        />
        <button
          onClick={() => updateField(field, teacher?.[field])}
          disabled={loadingFields[field]}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {loadingFields[field] ? <FaSpinner className="animate-spin" /> : 'Update'}
        </button>
      </div>
    );
  };

  const renderFileInput = (field: string, label: string, preview: string | null, setPreview: React.Dispatch<React.SetStateAction<string | null>>) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setPreview(URL.createObjectURL(file));
        updateField(field, file, true);
      }
    };

    return (
      <div className="flex items-center gap-2">
        {preview && (
          <iframe
            src={getDriveEmbedUrl(preview)}
            width="100"
            height="100"
            className="rounded"
            title={label}
          />
        )}
        <input type="file" onChange={handleChange} className="border p-2 w-full rounded" />
        {loadingFields[field] && <FaSpinner className="animate-spin ml-2" />}
      </div>
    );
  };

  if (loading) return <div className="text-center p-4">Loading teacher details...</div>;

  return (
    <>
      <SideNav />
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-6">Manage Teacher</h2>
        <div className="space-y-4">
          {renderInput('name', 'Name')}
          {renderInput('dob', 'Date of Birth', 'date')}
          {renderInput('email', 'Email', 'email')}
          {renderInput('phone', 'Phone')}
          {renderInput('address', 'Address')}
          {renderInput('department', 'Department')}
          {renderInput('subject', 'Subject')}

          <div>
            <label className="block mb-1">Update Photo:</label>
            {renderFileInput('photo', 'Photo', photoPreview, setPhotoPreview)}
          </div>

          <div>
            <label className="block mb-1">Update Document:</label>
            {renderFileInput('document', 'Document', documentPreview, setDocumentPreview)}
          </div>

          <button
            onClick={deleteTeacher}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Delete Teacher
          </button>
        </div>
      </div>
    </>
  );
};

export default ManageTeacher;
