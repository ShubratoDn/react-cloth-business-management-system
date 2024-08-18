import { CCard, CCardBody, CCardHeader } from '@coreui/react';
import { useFormik } from 'formik';
import React, { useState } from 'react'
import * as Yup from 'yup'
import { userRegister } from '../../services/userServices'

import { toast } from 'react-toastify'
import { addRole } from 'services/userRoleService';

const AddUserRole = () => {

    const [isLoading, setLoading] = useState(false);
    const [message, setMessage] = useState({});


    const formik = useFormik({
        initialValues: {
            role: '',
            title: '',
            category: '',
            isActive: false
        },
        validationSchema: Yup.object({
            role: Yup.string()
                .required('Role name is required')
                .min(3, 'Role name should be at least 3 characters'),
            title: Yup.string()
                .notRequired()
                .min(3, "Minimum three character is required"),
            category: Yup.string()
                .required("Category is required"),
        }),
        onSubmit: (values, { resetForm }) => {

            setLoading(true);
            setMessage({});

            // console.log('Form values', values)

            addRole(values)
                .then((response) => {
                    toast.success('Role added successfull!', {
                        position: "bottom-center",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });

                    resetForm({ values: "" })
                    setMessage({ success: "Role registration successfull." });

                })
                .catch((err) => {
                    // console.log(err.response.data);

                    if (err.code === 'ERR_NETWORK') {
                        // handle connection refused error
                        console.log('Connection refused error');
                        toast.error('Network error!! Failed to connect with server. \n Contact with Shubrato', {
                            position: "bottom-center",
                            theme: "dark",
                        });

                        return;
                    }


                    // const errMessages = Object.entries(err.response.data).map(([key, value]) => {
                    //     toast.error(`${value}`, {
                    //         position: "bottom-center",
                    //         theme: "dark",
                    //     });
                    //     return `${value}`;
                    // }).join(", ");

                    const errMessages = err.response.data.error;

                    setMessage({ error: errMessages });
                        toast.error(`${errMessages}`, {
                            position: "bottom-center",
                            theme: "dark",
                        });

                })
                .finally(() => {

                    setTimeout(() => {
                        setLoading(false)
                    }, 1000);
                })
        }
    })


    return (
        <CCard>
            <CCardHeader>
                <h4>Add Role</h4>
            </CCardHeader>
            <CCardBody>
                <form onSubmit={formik.handleSubmit} className="row position-relative">

                    {/* LOADER AND SERVER MESSAGE */}
                    {(message.error || message.success) &&
                        <div className='p-2'>
                            <div className={message.error ? "alert alert-danger mt-3" : "alert alert-success mt-3"} role="alert">
                                {message.error}
                                {message.success}
                            </div>
                        </div>
                    }
                    {isLoading && <div className="loaderContainer"><div className='loader'></div></div>}
                    {/* LOADER AND SERVER MESSAGE */}


                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="role" className="mb-2 text-muted">Role Name</label>
                        <input
                            type="text"
                            className={`form-control ${formik.touched.role && formik.errors.role ? 'is-invalid' : ''}`}
                            id="role"
                            name="role"
                            placeholder="Role name"
                            value={formik.values.role}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.role && formik.errors.role ? (
                            <small className="form-text text-danger">{formik.errors.role}</small>
                        ) : (
                            <small className="form-text text-muted"></small>
                        )}
                    </div>
                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="title" className="mb-2 text-muted">Title</label>
                        <input
                            type="text"
                            className={`form-control ${formik.touched.title && formik.errors.title ? 'is-invalid' : ''}`}
                            id="title"
                            name="title"
                            placeholder="Title"
                            value={formik.values.title}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.title && formik.errors.title ? (
                            <small className="form-text text-danger">{formik.errors.title}</small>
                        ) : (
                            <small className="form-text text-muted"></small>
                        )}
                    </div>
                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="category" className="mb-2 text-muted">Category</label>
                        <input
                            type="text"
                            className={`form-control ${formik.touched.category && formik.errors.category ? 'is-invalid' : ''}`}
                            id="category"
                            name="category"
                            placeholder="Category"
                            value={formik.values.category}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.category && formik.errors.category ? (
                            <small className="form-text text-danger">{formik.errors.category}</small>
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
                        <small className="form-text text-muted"></small>
                    </div>
                    <button type="submit" className="btn btn-success w-25 btn-lg m-auto mt-5">Add Role</button>
                </form>
            </CCardBody>
        </CCard>
    )
}

export default AddUserRole