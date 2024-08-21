import React, { useState } from 'react'
import { CCard, CCardBody, CCardHeader } from '@coreui/react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { addStore } from 'services/storeServices'

const AddStore = () => {
    const [isLoading, setLoading] = useState(false)
    const [message, setMessage] = useState({})

    const formik = useFormik({
        initialValues: {
            storeName:'',
            address: '',
            storeCode: '',
            remark: '',
            storeImage: null,
            isActive: true,
        },
        validationSchema: Yup.object({
            storeName: Yup.string()
                .required('Store Name is required')
                .min(3, 'Store name should be at least 3 characters'),
            address: Yup.string()
                .required('Store address is required'),
            storeCode: Yup.string()
                .required('Store code is required')
                .min(3, 'Store code should be at least 3 characters'),
            storeImage: Yup.mixed()
                .notRequired()
                .test('fileSize', 'File size is too large. Maximum size is 5MB', value => {
                    return value ? value.size <= 5000000 : true
                })
                .test('fileType', 'Invalid file type. Supported formats: JPEG, PNG, GIF', value => {
                    return value ? ['image/jpeg', 'image/png', 'image/gif'].includes(value.type) : true
                }),
        }),
        onSubmit: (values, { resetForm }) => {
            setLoading(true)
            setMessage({})

            // Make API call to submit the form data
            // Replace `addStore` with your actual API call
            addStore(values)
                .then((response) => {
                    console.log(response);
                    toast.success('Store added successfully!', {
                        position: "bottom-center",
                        theme: "dark",
                    })

                    // resetForm({ values: "" })
                    setMessage({ success: "Store added successfully." })
                })
                .catch((err) => {
                    if (err.code === 'ERR_NETWORK') {
                        toast.error('Network error!! Failed to connect with server.', {
                            position: "bottom-center",
                            theme: "dark",
                        })
                        return
                    }

                    if(err.response.data.message){
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
        }
    })

    const handleChange = event => {
        if (event.target.type === 'file') {
            formik.setFieldValue('storeImage', event.target.files[0])
        } else {
            formik.handleChange(event)
        }
    }

    return (
        <CCard>
            <CCardHeader>
                <h4>Add Store</h4>
            </CCardHeader>
            <CCardBody>
                <form onSubmit={formik.handleSubmit} className="row position-relative">

                    {(message.error || message.success) &&
                        <div className='p-2'>
                            <div className={message.error ? "alert alert-danger mt-3" : "alert alert-success mt-3"} role="alert">
                                {message.error}
                                {message.success}
                            </div>
                        </div>
                    }

                    {isLoading && <div className="loaderContainer"><div className='loader'></div></div>}


                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="address" className="mb-2 text-muted">Store Name</label>
                        <input
                            type="text"
                            className={`form-control ${formik.touched.storeName && formik.errors.storeName ? 'is-invalid' : ''}`}
                            id="storeName"
                            placeholder="Store Name"
                            name="storeName"
                            value={formik.values.storeName}
                            onChange={handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.storeName && formik.errors.storeName ? (
                            <small className="form-text text-danger">{formik.errors.storeName}</small>
                        ) : (
                            <small className="form-text text-muted"></small>
                        )}
                    </div>


                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="address" className="mb-2 text-muted">Store Address</label>
                        <input
                            type="text"
                            className={`form-control ${formik.touched.address && formik.errors.address ? 'is-invalid' : ''}`}
                            id="address"
                            placeholder="Store Address"
                            name="address"
                            value={formik.values.address}
                            onChange={handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.address && formik.errors.address ? (
                            <small className="form-text text-danger">{formik.errors.address}</small>
                        ) : (
                            <small className="form-text text-muted"></small>
                        )}
                    </div>

                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="storeCode" className="mb-2 text-muted">Store Code</label>
                        <input
                            type="text"
                            className={`form-control ${formik.touched.storeCode && formik.errors.storeCode ? 'is-invalid' : ''}`}
                            id="storeCode"
                            placeholder="Store Code"
                            name="storeCode"
                            value={formik.values.storeCode}
                            onChange={handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.storeCode && formik.errors.storeCode ? (
                            <small className="form-text text-danger">{formik.errors.storeCode}</small>
                        ) : (
                            <small className="form-text text-muted"></small>
                        )}
                    </div>

                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="remark" className="mb-2 text-muted">Remark</label>
                        <input
                            type="text"
                            className="form-control"
                            id="remark"
                            placeholder="Remark"
                            name="remark"
                            value={formik.values.remark}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        <small className="form-text text-muted"></small>
                    </div>

                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="storeImage" className="mb-2 text-muted">Store Image</label>
                        <input
                            type="file"
                            className={`form-control ${formik.touched.storeImage && formik.errors.storeImage ? 'is-invalid' : ''}`}
                            id="storeImage"
                            name="storeImage"
                            onChange={handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.storeImage && formik.errors.storeImage ? (
                            <small className="form-text text-danger">{formik.errors.storeImage}</small>
                        ) : (
                            <small className="form-text text-muted"></small>
                        )}
                    </div>

                    <div className="form-group col-md-6 d-flex align-items-center">
                        <div>
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="isActive"
                                name="isActive"
                                checked={formik.values.isActive}
                                onChange={formik.handleChange}
                            />
                            <label className="form-check-label" htmlFor="isActive" style={{ marginLeft: "10px" }}>Is Active</label>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-success w-25 btn-lg m-auto mt-5">Add Store</button>
                </form>
            </CCardBody>
        </CCard>
    )
}

export default AddStore
