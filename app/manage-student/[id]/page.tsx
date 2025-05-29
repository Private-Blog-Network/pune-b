'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import SideNav from '@/app/components/sidebar';

const ManageStudent = () => {
  const { id } = useParams();
  const [student, setStudent] = useState<any>(null);
  const [loadingFields, setLoadingFields] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [standards,setStandards] = useState([])
  const [courses,setCourses] = useState([])

   const fetchStandards = async () => {
      try {
        const res = await fetch('/api/add-standard');
        const data = await res.json();
        if (res.ok) {
          setStandards(data.standards);
      // console.log(data)
  
        } else {
          toast.error(data.error || 'Failed to fetch standards');
        }
      } catch (error) {
        toast.error('Network error');
      } 
    };
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        const data = await res.json();
        if (res.ok) {
          setCourses(data.courses);
      // console.log(data)
  
        } else {
          toast.error(data.error || 'Failed to fetch courses');
        }
      } catch (error) {
        toast.error('Network error');
      } 
    };

    const fetchStudent = async () => {
      try {
        const res = await fetch(`/api/get-student-by-id?id=${id}`);
        const data = await res.json();
        console.log('Fetched student data:', data); // Log the data to ensure it's being fetched
        if (data.success) {
          setStudent(data.student);
          setLoading(false);
          setPhotoPreview(data.student?.photo_url || null);
          setDocumentPreview(data.student?.document_url || null);
        } else {
          toast.error(data.message || 'Failed to fetch student');
        }
      } catch (error) {
        console.error(error);
        toast.error('Something went wrong fetching student');
      }
    };

  useEffect(() => {
    
    if (id) {
      fetchStudent();
      fetchCourses();
      fetchStandards();
    }
  }, [id]);

  // Format date for dob field
  const formatDate = (date: string) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const updateField = async (field: string, value: any, isFile: boolean = false) => {
    if (!id) return;

    setLoadingFields(prev => ({ ...prev, [field]: true }));

    try {
      const formData = new FormData();
      formData.append('id', id);

      // For text fields
      if (!isFile) {
        formData.append(field, value);
      }
      // For file fields (photo, document)
      else if (value instanceof File) {
        formData.append(field, value);
      }

      const response = await fetch(`/api/update-student-by-id`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        toast.success(`${field} updated successfully!`);
      } else {
        toast.error(result.message || `Failed to update ${field}`);
      }
    } catch (error) {
      console.error(error);
      toast.error(`Error updating ${field}`);
    } finally {
      setLoadingFields(prev => ({ ...prev, [field]: false }));
    }
  };

  const renderInput = (field: string, label: string, type: string = 'text') => {
    const value = field === 'dob' ? student?.[field] && formatDate(student[field]) : student?.[field] || '';
    if(field==="standard"){
      return(
      <div className="flex items-center gap-2">
        <select name="standard" id="standard" className="border p-2 w-full rounded"
        onChange={(e) => setStudent({ ...student, [field]: this.value })}>
        <option value={value}>{value}</option>
        {
          standards.map((s,i)=>(
            <option value={s.name} key={i}>{s.name}</option>
          ))
        }
        </select>
        <button
          onClick={() => updateField(field, student?.[field])}
          disabled={loadingFields[field]}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {loadingFields[field] ? <FaSpinner className="animate-spin" /> : 'Update'}
        </button>
        </div>
      )
    }

    if(field==="course"){
      return(
      <div className="flex items-center gap-2">
        <select name="course" id="course" className="border p-2 w-full rounded"
        onChange={(e) => setStudent({ ...student, [field]: e.target.value })}>
        <option value={value}>{value}</option>
        {
          courses.map((s,i)=>(
            <option value={s.name} key={i}>{s.name}</option>
          ))
        }
        </select>
        <button
          onClick={() => updateField(field, student?.[field])}
          disabled={loadingFields[field]}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {loadingFields[field] ? <FaSpinner className="animate-spin" /> : 'Update'}
        </button>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2">
        <input
          type={type}
          placeholder={label}
          value={value}
          onChange={(e) => setStudent({ ...student, [field]: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <button
          onClick={() => updateField(field, student?.[field])}
          disabled={loadingFields[field]}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {loadingFields[field] ? <FaSpinner className="animate-spin" /> : 'Update'}
        </button>
      </div>
    );
  };

  // Helper function to generate Google Drive embeddable URL for photos and documents
  const getDriveEmbedUrl = (url: string) => {
    if (url) {
      const fileIdMatch = url.match(/(?:id=)([^&]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
      }
    }
    return url; // Return the original URL if it's not a Google Drive URL
  };

  const renderFileInput = (field: string, label: string, preview: string | null, setPreview: React.Dispatch<React.SetStateAction<string | null>>) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setPreview(URL.createObjectURL(file));
        updateField(field, file, true);
      }
    };

    return (
      <div className="flex items-center gap-2">
        {preview && (
          <div className="relative w-24 h-24">
            {/* Use an iframe for embedding Google Drive previews */}
            <iframe
              src={getDriveEmbedUrl(preview)} // Use the embeddable Google Drive link
              width="100%"
              height="100%"
              frameBorder="0"
              title="Preview"
              className="w-full h-full object-cover rounded"
            />
          </div>
        )}
        <input
          type="file"
          onChange={handleFileChange}
          className="border p-2 w-full rounded"
        />
        {loadingFields[field] && <FaSpinner className="animate-spin ml-2" />}
      </div>
    );
  };

  if (loading) {
    return <div>Loading student details...</div>;
  }

  return (
    <>
      <SideNav />
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-6">Manage Student</h2>
        <div className="space-y-4">
          {renderInput('name', 'Name')}
          {renderInput('standard', 'Standard')}
          {renderInput('dob', 'Date of Birth', 'date')}
          {renderInput('email', 'Email', 'email')}
          {renderInput('phone', 'Phone')}
          {renderInput('address', 'Address')}
          {renderInput('state', 'State')}
          {renderInput('district', 'District')}
          {renderInput('taluka', 'Taluka')}
          {renderInput('pincode', 'Pincode')}
          {renderInput('course', 'Course')}
          {renderInput('father_name', "Father's Name")}
          {renderInput('mother_name', "Mother's Name")}
          {renderInput('guardian_phone', 'Guardian Phone')}

          <div>
            <label className="block mb-1">Update Photo:</label>
            {renderFileInput('photo', 'Update Photo', photoPreview, setPhotoPreview)}
          </div>

          <div>
            <label className="block mb-1">Update Document:</label>
            {renderFileInput('document', 'Update Document', documentPreview, setDocumentPreview)}
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageStudent;
