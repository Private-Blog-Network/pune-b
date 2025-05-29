// components/AddStudentForm.tsx
"use client"
import React, { useState,useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';

const AddStudentForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
 const [standards,setStandards] = useState([])
 const [courses,setCourses] = useState([])
  const formik = useFormik({
    initialValues: {
      name: '',
      standard:"",
      dob: '',
      email: '',
      phone: '',
      address: '',
      state: '',
      district: '',
      taluka: '',
      pincode: '',
      course: '',
      father_name: '',
      mother_name: '',
      guardian_phone: '',
      photo: null,
      document: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      dob: Yup.date().required('Date of birth is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      phone: Yup.string().required('Phone number is required'),
      address: Yup.string().required('Address is required'),
      state: Yup.string().required('State is required'),
      district: Yup.string().required('District is required'),
      taluka: Yup.string().required('Taluka is required'),
      pincode: Yup.string().required('Pincode is required'),
      father_name: Yup.string().required('Father\'s name is required'),
      mother_name: Yup.string().required('Mother\'s name is required'),
      guardian_phone: Yup.string().required('Guardian phone number is required'),
      photo: Yup.mixed().required('Photo is required'),
      document: Yup.mixed().required('Document is required'),
    }),
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        const formData = new FormData();
        Object.keys(values).forEach(key => {
          if (key !== 'photo' && key !== 'document') {
            formData.append(key, values[key as keyof typeof values]);
          }
        });
        formData.append('photo', values.photo as Blob);
        formData.append('document', values.document as Blob);

        const response = await fetch('/api/add-student', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          toast.success('Student added successfully!');
        } else {
          toast.error('Failed to add student.');
        }
      } catch (error) {
        toast.error('Something went wrong!');
      } finally {
        setIsSubmitting(false);
      }
    },
  });


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
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (field === 'photo') {
        setPhotoPreview(URL.createObjectURL(file));
      } else if (field === 'document') {
        setDocumentPreview(URL.createObjectURL(file));
      }
      formik.setFieldValue(field, file);
    }
  };


  useEffect(()=>{
    fetchStandards()
    fetchCourses()
  },[])
  return (
    <div className="max-w-3xl mx-auto p-8 bg-white mt-5 shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Add Student</h2>
      <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
        {/* Grouping fields into two columns */}
        
          {/* Name */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className={`w-full px-4 py-2 mt-1 border rounded-lg text-black ${formik.errors.name && formik.touched.name ? 'border-red-500' : 'border-gray-300'}`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
            />
            {formik.errors.name && formik.touched.name && <p className="text-red-500 text-sm">{formik.errors.name}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700">Standard</label>
            <select
              id="standard"
              name="standard"
              className={`w-full px-4 py-2 mt-1 border rounded-lg text-black ${formik.errors.standard && formik.touched.standard ? 'border-red-500' : 'border-gray-300'}`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.standard}
            >
              {
                standards.map((std,i)=>(
                  <option key={i}>{std.name}</option>
                ))
              }
              </select>
            {formik.errors.standard && formik.touched.standard && <p className="text-red-500 text-sm">{formik.errors.standard}</p>}
          </div>

          {/* Date of Birth */}
          <div className="mb-4">
            <label htmlFor="dob" className="block text-gray-700">Date of Birth</label>
            <input
              id="dob"
              name="dob"
              type="date"
              className={`w-full px-4 py-2 mt-1 border rounded-lg text-black ${formik.errors.dob && formik.touched.dob ? 'border-red-500' : 'border-gray-300'}`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.dob}
            />
            {formik.errors.dob && formik.touched.dob && <p className="text-red-500 text-sm">{formik.errors.dob}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className={`w-full px-4 py-2 mt-1 border rounded-lg text-black ${formik.errors.email && formik.touched.email ? 'border-red-500' : 'border-gray-300'}`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
            {formik.errors.email && formik.touched.email && <p className="text-red-500 text-sm">{formik.errors.email}</p>}
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label htmlFor="phone" className="block text-gray-700">Phone</label>
            <input
              id="phone"
              name="phone"
              type="text"
              className={`w-full px-4 py-2 mt-1 border rounded-lg text-black ${formik.errors.phone && formik.touched.phone ? 'border-red-500' : 'border-gray-300'}`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.phone}
            />
            {formik.errors.phone && formik.touched.phone && <p className="text-red-500 text-sm">{formik.errors.phone}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Address */}
          <div className="mb-4">
            <label htmlFor="address" className="block text-gray-700">Address</label>
            <input
              id="address"
              name="address"
              type="text"
              className={`w-full px-4 py-2 mt-1 border rounded-lg text-black ${formik.errors.address && formik.touched.address ? 'border-red-500' : 'border-gray-300'}`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.address}
            />
            {formik.errors.address && formik.touched.address && <p className="text-red-500 text-sm">{formik.errors.address}</p>}
          </div>

          {/* State */}
          <div className="mb-4">
            <label htmlFor="state" className="block text-gray-700">State</label>
            <input
              id="state"
              name="state"
              type="text"
              className={`w-full px-4 py-2 mt-1 border rounded-lg text-black ${formik.errors.state && formik.touched.state ? 'border-red-500' : 'border-gray-300'}`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.state}
            />
            {formik.errors.state && formik.touched.state && <p className="text-red-500 text-sm">{formik.errors.state}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* District */}
          <div className="mb-4">
            <label htmlFor="district" className="block text-gray-700">District</label>
            <input
              id="district"
              name="district"
              type="text"
              className={`w-full px-4 py-2 mt-1 border rounded-lg text-black ${formik.errors.district && formik.touched.district ? 'border-red-500' : 'border-gray-300'}`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.district}
            />
            {formik.errors.district && formik.touched.district && <p className="text-red-500 text-sm">{formik.errors.district}</p>}
          </div>

          {/* Taluka */}
          <div className="mb-4">
            <label htmlFor="taluka" className="block text-gray-700">Taluka</label>
            <input
              id="taluka"
              name="taluka"
              type="text"
              className={`w-full px-4 py-2 mt-1 border rounded-lg text-black ${formik.errors.taluka && formik.touched.taluka ? 'border-red-500' : 'border-gray-300'}`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.taluka}
            />
            {formik.errors.taluka && formik.touched.taluka && <p className="text-red-500 text-sm">{formik.errors.taluka}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pincode */}
          <div className="mb-4">
            <label htmlFor="pincode" className="block text-gray-700">Pincode</label>
            <input
              id="pincode"
              name="pincode"
              type="text"
              className={`w-full px-4 py-2 mt-1 border rounded-lg text-black ${formik.errors.pincode && formik.touched.pincode ? 'border-red-500' : 'border-gray-300'}`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.pincode}
            />
            {formik.errors.pincode && formik.touched.pincode && <p className="text-red-500 text-sm">{formik.errors.pincode}</p>}
          </div>

          {/* Course */}
          <div className="mb-4">
            <label htmlFor="course" className="block text-gray-700">Course</label>
            <select
              id="course"
              name="course"
              className={`w-full px-4 py-2 mt-1 border rounded-lg text-black ${formik.errors.course && formik.touched.course ? 'border-red-500' : 'border-gray-300'}`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.course}
            > 
            {
              courses.map((c,i)=>(
                <option key={i}>{c.name}</option>
              ))
            }
            </select>
            {formik.errors.course && formik.touched.course && <p className="text-red-500 text-sm">{formik.errors.course}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Father's Name */}
          <div className="mb-4">
            <label htmlFor="father_name" className="block text-gray-700">Father's Name</label>
            <input
              id="father_name"
              name="father_name"
              type="text"
              className={`w-full px-4 py-2 mt-1 border rounded-lg text-black ${formik.errors.father_name && formik.touched.father_name ? 'border-red-500' : 'border-gray-300'}`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.father_name}
            />
            {formik.errors.father_name && formik.touched.father_name && <p className="text-red-500 text-sm">{formik.errors.father_name}</p>}
          </div>

          {/* Mother's Name */}
          <div className="mb-4">
            <label htmlFor="mother_name" className="block text-gray-700">Mother's Name</label>
            <input
              id="mother_name"
              name="mother_name"
              type="text"
              className={`w-full px-4 py-2 mt-1 border rounded-lg text-black ${formik.errors.mother_name && formik.touched.mother_name ? 'border-red-500' : 'border-gray-300'}`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.mother_name}
            />
            {formik.errors.mother_name && formik.touched.mother_name && <p className="text-red-500 text-sm">{formik.errors.mother_name}</p>}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="guardian_phone" className="block text-gray-700">Guardian's Phone</label>
          <input
            id="guardian_phone"
            name="guardian_phone"
            type="text"
            className={`w-full px-4 py-2 mt-1 border rounded-lg text-black ${formik.errors.guardian_phone && formik.touched.guardian_phone ? 'border-red-500' : 'border-gray-300'}`}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.guardian_phone}
          />
          {formik.errors.guardian_phone && formik.touched.guardian_phone && <p className="text-red-500 text-sm">{formik.errors.guardian_phone}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="photo" className="block text-gray-700">Student Photo</label>
          <input
            id="photo"
            name="photo"
            type="file"
            accept="image/*"
            className="w-full px-4 py-2 mt-1 border rounded-lg text-black"
            onChange={(e) => handleFileChange(e, 'photo')}
          />
          {photoPreview && <img src={photoPreview} alt="Preview" className="mt-2 max-h-32" />}
        </div>

        <div className="mb-4">
          <label htmlFor="document" className="block text-gray-700">Document</label>
          <input
            id="document"
            name="document"
            type="file"
            className="w-full px-4 py-2 mt-1 border rounded-lg text-black"
            onChange={(e) => handleFileChange(e, 'document')}
          />
          {documentPreview && <a href={documentPreview} className="mt-2 text-blue-500" target="_blank" rel="noopener noreferrer">View Document</a>}
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 mt-4 bg-blue-600 text-white rounded-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? <ClipLoader size={24} color="white" /> : 'Add Student'}
        </button>
      </form>
    </div>
  );
};

export default AddStudentForm;
