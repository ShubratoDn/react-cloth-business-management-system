import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CCard, CCardBody, CCardHeader } from '@coreui/react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { addStakeholder } from 'services/stakeholderServices';
import { getAllStores } from 'services/storeServices';
import Select from 'react-select';
import store from 'store';

const CreateStakeholder = () => {
  const [isLoading, setLoading] = useState(false)
  const [message, setMessage] = useState({})
  const [imagePreview, setImagePreview] = useState(null);


  const [storeOptions, setStoreOptions] = useState([]);

  useEffect(() => {
    getAllStores().then((response) => {
      const options = response.map(store => ({
        value: store.id,
        label: store.storeName ? `${store.storeName} (${store.storeCode})` : store.storeCode,
      }));
      setStoreOptions(options);
    }).catch(err => {
      console.log(err)
      toast.error('Failed to fetch stores info', {
        position: "bottom-center",
        theme: "dark",
      });
    });
  }, []);

  const formik = useFormik({
    initialValues: {
      stakeHolderType: '',
      name: '',
      phone: '',
      address: '',
      email: '',
      stakeHolderImage: null,
      isActive: true,
      store: null,  // New store field
    },
    validationSchema: Yup.object({
      stakeHolderType: Yup.string().required('Stakeholder type is required'),
      name: Yup.string()
        .required('Name is required')
        .max(100, 'Name cannot be longer than 100 characters'),
      phone: Yup.string()
        .required('Phone is required')
        .max(15, 'Phone cannot be longer than 15 characters')
        .min(11, 'Phone cannot be less than 11 characters'),
      address: Yup.string()
        .required('Address is required')
        .max(255, 'Address cannot be longer than 255 characters'),
      email: Yup.string().email('Invalid email address'),
      stakeHolderImage: Yup.mixed()
        .notRequired()
        .test('fileSize', 'File size is too large. Maximum size is 5MB', value => {
          return value ? value.size <= 5000000 : true;
        })
        .test('fileType', 'Invalid file type. Supported formats: JPEG, PNG, GIF', value => {
          return value ? ['image/jpeg', 'image/png', 'image/gif'].includes(value.type) : true;
        }),
      isActive: Yup.boolean(),
      store: Yup.object().nullable().required('Store is required'),  // Validation for store
    }),
    onSubmit: (values, { resetForm }) => {
      console.log(values)
      setLoading(true)
      setMessage({})

      addStakeholder(values)
        .then((response) => {
          console.log(response);
          toast.success('Stakeholder added successfully!', {
            position: "bottom-center",
            theme: "dark",
          })

          resetForm({ values: "" })
          setMessage({ success: "Stakeholder added successfully." })
          setImagePreview(null);
        })
        .catch((err) => {
          if (err.code === 'ERR_NETWORK') {
            toast.error('Network error!! Failed to connect with server.', {
              position: "bottom-center",
              theme: "dark",
            })
            return
          }

          if (err.response.data.message) {
            toast.error(`${err.response.data.message}`, {
              position: "bottom-center",
              theme: "dark",
            })
            setMessage({ error: err.response.data.message })
            return;
          }

          const errMessages = Object.entries(err.response.data).map(([key, value]) => {
            toast.error(`${value}`, {
              position: "bottom-center",
              theme: "dark",
            })
            return `${value}`
          }).join(", ")

          setMessage({ error: errMessages })
        })
        .finally(() => {
          setTimeout(() => {
            setLoading(false)
          }, 2000)
        })
    },
  });

  const handleImageChange = (event) => {

    if (event.target.type === 'file') {
      formik.setFieldValue('stakeHolderImage', event.target.files[0])
    }

    const file = event.target.files[0];
    formik.setFieldValue('stakeHolderImage', file);
    setImagePreview(URL.createObjectURL(file));
  };



  return (
    <CCard>
      <CCardHeader>
        <h4>Add Stakeholder</h4>
      </CCardHeader>
      <CCardBody>
        <form onSubmit={formik.handleSubmit} className="row">
          <div className="form-group col-md-6 mb-3">
            <label htmlFor="stakeHolderType" className="mb-2 text-muted">Stakeholder Type</label>
            <select
              className={`form-control ${formik.touched.stakeHolderType && formik.errors.stakeHolderType ? 'is-invalid' : ''}`}
              id="stakeHolderType"
              name="stakeHolderType"
              value={formik.values.stakeHolderType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="" className='text-muted'>-- Select Stakeholder Type --</option>
              <option value="CUSTOMER">Customer</option>
              <option value="SUPPLIER">Supplier</option>
            </select>
            {formik.touched.stakeHolderType && formik.errors.stakeHolderType && (
              <small className="form-text text-danger">{formik.errors.stakeHolderType}</small>
            )}
          </div>

          <div className="form-group col-md-6 mb-3">
            <label htmlFor="store" className="mb-2 text-muted">Store</label>
            <Select
              id="store"
              name="store"
              options={storeOptions}
              value={formik.values.store}
              onChange={value => formik.setFieldValue('store', value)}
              onBlur={formik.handleBlur}
              className={`form-control p-0 ${formik.touched.store && formik.errors.store ? 'is-invalid' : ''}`}
            />
            {formik.touched.store && formik.errors.store && (
              <small className="form-text text-danger">{formik.errors.store}</small>
            )}
          </div>


          <div className="form-group col-md-6 mb-3">
            <label htmlFor="name" className="mb-2 text-muted">Name</label>
            <input
              type="text"
              className={`form-control ${formik.touched.name && formik.errors.name ? 'is-invalid' : ''}`}
              id="name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter name"
            />
            {formik.touched.name && formik.errors.name && (
              <small className="form-text text-danger">{formik.errors.name}</small>
            )}
          </div>

          <div className="form-group col-md-6 mb-3">
            <label htmlFor="phone" className="mb-2 text-muted">Phone</label>
            <input
              type="text"
              className={`form-control ${formik.touched.phone && formik.errors.phone ? 'is-invalid' : ''}`}
              id="phone"
              name="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter phone number"
            />
            {formik.touched.phone && formik.errors.phone && (
              <small className="form-text text-danger">{formik.errors.phone}</small>
            )}
          </div>



          <div className="form-group col-md-6 mb-3">
            <label htmlFor="email" className="mb-2 text-muted">Email</label>
            <input
              type="email"
              className={`form-control ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
              id="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter email"
            />
            {formik.touched.email && formik.errors.email && (
              <small className="form-text text-danger">{formik.errors.email}</small>
            )}
          </div>

          <div className="form-group col-md-6 mb-3">
            <label htmlFor="address" className="mb-2 text-muted">Address</label>
            <textarea
              className={`form-control ${formik.touched.address && formik.errors.address ? 'is-invalid' : ''}`}
              id="address"
              name="address"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter address"
              rows="4"
            />
            {formik.touched.address && formik.errors.address && (
              <small className="form-text text-danger">{formik.errors.address}</small>
            )}
          </div>


          <div className="form-group col-md-6 mb-3">
            <label htmlFor="image" className="mb-2 text-muted">Stakeholder Image</label>
            <div className='d-flex align-items-start'>
              <input
                type="file"
                className="form-control"
                id="image"
                name="stakeHolderImage"
                onChange={handleImageChange}
                onBlur={formik.handleBlur}
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Image preview" className="img-fluid" />
                </div>
              )}
            </div>
            {formik.touched.stakeHolderImage && formik.errors.stakeHolderImage && (
              <small className="form-text text-danger">{formik.errors.stakeHolderImage}</small>
            )}
          </div>

          <div className="form-group col-md-6 mb-3">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formik.values.isActive}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <label className="form-check-label m-2" htmlFor="isActive"> Is Active</label>
          </div>

          <button type="submit" className="btn btn-success w-25 btn-lg m-auto mt-5">Create Stakeholder</button>
        </form>
      </CCardBody>
    </CCard>
  );
};

export default CreateStakeholder;
