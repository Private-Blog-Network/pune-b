'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import SideNav from '../components/sidebar';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  dob: yup.string().required('Date of birth is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone is required'),
  address: yup.string().required('Address is required'),
  department: yup.string().required('Department is required'),
  subject: yup.string().required('Subject is required'),
});

const AddTeacher = () => {
  const [photo, setPhoto] = useState<File | null>(null);
  const [document, setDocument] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    if (photo) formData.append('photo', photo);
    if (document) formData.append('document', document);

    try {
      const res = await fetch('/api/add-teacher', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (result.success) {
        toast.success('Teacher added successfully!');
        reset();
        setPhoto(null);
        setDocument(null);
      } else {
        toast.error(result.message || 'Failed to add teacher');
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong while adding teacher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SideNav />
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-6">Add Teacher</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { name: 'name', label: 'Name', type: 'text', placeholder: "Enter teacher's name" },
            { name: 'dob', label: 'Date of Birth', type: 'date' },
            { name: 'email', label: 'Email', type: 'email', placeholder: "Enter teacher's email" },
            { name: 'phone', label: 'Phone', type: 'tel', placeholder: "Enter teacher's phone number" },
            { name: 'address', label: 'Address', type: 'text', placeholder: "Enter teacher's address" },
            { name: 'department', label: 'Department', type: 'text', placeholder: 'Enter department' },
            { name: 'subject', label: 'Subject', type: 'text', placeholder: 'Enter subject' },
          ].map(({ name, label, type, placeholder }) => (
            <div key={name} className="flex flex-col">
              <label className={`mb-1 ${errors[name as keyof typeof errors] ? 'text-red-500' : ''}`}>
                {label}
              </label>
              <input
                type={type}
                placeholder={placeholder}
                {...register(name)}
                className={`border p-2 rounded ${
                  errors[name as keyof typeof errors] ? 'border-red-500' : ''
                }`}
              />
              {errors[name as keyof typeof errors] && (
                <span className="text-red-500 text-sm">{errors[name as keyof typeof errors]?.message}</span>
              )}
            </div>
          ))}

          <div className="flex flex-col">
            <label className="mb-1">Upload Photo</label>
            <input
              type="file"
              onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : null)}
              className="border p-2 rounded"
              accept="image/*"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1">Upload Document</label>
            <input
              type="file"
              onChange={(e) => setDocument(e.target.files ? e.target.files[0] : null)}
              className="border p-2 rounded"
              accept="image/*"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded mt-4 hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? <FaSpinner className="animate-spin" /> : 'Add Teacher'}
          </button>
        </form>
      </div>
    </>
  );
};

export default AddTeacher;
