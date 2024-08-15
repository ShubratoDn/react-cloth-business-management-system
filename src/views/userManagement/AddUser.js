import React, { useState } from 'react'
import { CCard, CCardBody, CCardHeader } from '@coreui/react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { userRegister } from '../../services/userServices'

import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';



const AddUser = () => {

    const [isLoading, setLoading] = useState(false);
    const [message, setMessage] = useState({});


    const formik = useFormik({
        initialValues: {
            name: '',
            phone: '',
            email: '',
            address: '',
            password: '',
            confirmPassword: '',
            designation: '',
            remark: '',
            userImage: null,
            isLocked: false
        },
        validationSchema: Yup.object({
            name: Yup.string()
                .required('Name is required')
                .min(3, 'Name should be at least 3 characters'),
            phone: Yup.string()
                .required('Phone is required')
                .matches(/^[0-9]+$/, 'Phone must be a number'),
            email: Yup.string()
                .email('Invalid email format')
                .notRequired(),
            address: Yup.string()
                .required('Address is required'),
            password: Yup.string()
                .required('Password is required')
                .min(4, 'Password should be at least 4 characters'),
            confirmPassword: Yup.string()
                .required('Confirm your password')
                .oneOf([Yup.ref('password'), null], 'Passwords must match'),
            designation: Yup.string()
                .required('Designation is required'),
            userImage: Yup.mixed()
                .required('User image is required')
                .test('fileSize', 'File size is too large. Maximum size is 5MB', value => {
                    return value ? value.size <= 5000000 : true;
                })
                .test('fileType', 'Invalid file type. Supported formats: JPEG, PNG, GIF', value => {
                    return value ? ['image/jpeg', 'image/png', 'image/gif'].includes(value.type) : true;
                })
        }),
        onSubmit: (values, { resetForm }) => {

            setLoading(true);
            setMessage({});

            console.log('Form values', values)

            userRegister(values)
                .then((response) => {
                    toast.success('🦄Register Success!', {
                        position: "bottom-center",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });

                    setMessage({ success: "User registration successfull." });

                })
                .catch((err) => {
                    console.log(err.response.data);

                    if (err.code === 'ERR_NETWORK') {
                        // handle connection refused error
                        console.log('Connection refused error');
                        toast.error('Network error!! Failed to connect with server. \n Contact with Shubrato', {
                            position: "bottom-center",
                            theme: "dark",
                        });

                        return;
                    }


                    const errMessages = Object.entries(err.response.data).map(([key, value]) => {
                        toast.error(`${value}`, {
                            position: "bottom-center",
                            theme: "dark",
                        });
                        return `${value}`;
                    }).join(", ");

                    setMessage({ error: errMessages });

                })
                .finally(() => {

                    setTimeout(() => {
                        setLoading(false)
                    }, 2000);
                })

        }
    })



    const handleChange = event => {
        if (event.target.type === 'file') {
            formik.setFieldValue('userImage', event.target.files[0])
        } else {
            formik.handleChange(event)
        }
    }

    return (
        <CCard>
            <CCardHeader>
                <h4>Add User</h4>
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
                        <label htmlFor="fullName" className="mb-2 text-muted">User Name</label>
                        <input
                            type="text"
                            className={`form-control ${formik.touched.name && formik.errors.name ? 'is-invalid' : ''}`}
                            name="name"
                            id="fullName"
                            placeholder="Your full name"
                            value={formik.values.name}
                            onChange={handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.name && formik.errors.name ? (
                            <small className="form-text text-danger">{formik.errors.name}</small>
                        ) : (
                            <small className="form-text text-muted"></small>
                        )}
                    </div>
                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="phone" className="mb-2 text-muted">Phone</label>
                        <input
                            type="text"
                            className={`form-control ${formik.touched.phone && formik.errors.phone ? 'is-invalid' : ''}`}
                            id="phone"
                            placeholder="Your phone number"
                            name="phone"
                            value={formik.values.phone}
                            onChange={handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.phone && formik.errors.phone ? (
                            <small className="form-text text-danger">{formik.errors.phone}</small>
                        ) : (
                            <small className="form-text text-muted"></small>
                        )}
                    </div>
                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="email" className="mb-2 text-muted">Email</label>
                        <input
                            type="email"
                            className={`form-control ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
                            id="email"
                            placeholder="Your email"
                            name="email"
                            value={formik.values.email}
                            onChange={handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.email && formik.errors.email ? (
                            <small className="form-text text-danger">{formik.errors.email}</small>
                        ) : (
                            <small className="form-text text-muted"></small>
                        )}
                    </div>
                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="address" className="mb-2 text-muted">Address</label>
                        <input
                            type="text"
                            className={`form-control ${formik.touched.address && formik.errors.address ? 'is-invalid' : ''}`}
                            id="address"
                            placeholder="Address"
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
                        <label htmlFor="password" className="mb-2 text-muted">Password</label>
                        <input
                            type="password"
                            className={`form-control ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
                            id="password"
                            placeholder="Password"
                            name="password"
                            value={formik.values.password}
                            onChange={handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.password && formik.errors.password ? (
                            <small className="form-text text-danger">{formik.errors.password}</small>
                        ) : (
                            <small className="form-text text-muted"></small>
                        )}
                    </div>
                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="confirmpassword" className="mb-2 text-muted">Confirm Password</label>
                        <input
                            type="password"
                            className={`form-control ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'is-invalid' : ''}`}
                            id="confirmpassword"
                            placeholder="Confirm password"
                            name="confirmPassword"
                            value={formik.values.confirmPassword}
                            onChange={handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                            <small className="form-text text-danger">{formik.errors.confirmPassword}</small>
                        ) : (
                            <small className="form-text text-muted"></small>
                        )}
                    </div>
                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="designation" className="mb-2 text-muted">Designation</label>
                        <input
                            type="text"
                            className={`form-control ${formik.touched.designation && formik.errors.designation ? 'is-invalid' : ''}`}
                            id="designation"
                            placeholder="Your designation"
                            name="designation"
                            value={formik.values.designation}
                            onChange={handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.designation && formik.errors.designation ? (
                            <small className="form-text text-danger">{formik.errors.designation}</small>
                        ) : (
                            <small className="form-text text-muted"></small>
                        )}
                    </div>
                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="Remark" className="mb-2 text-muted">Remark</label>
                        <input
                            type="text"
                            className={`form-control ${formik.touched.remark && formik.errors.remark ? 'is-invalid' : ''}`}
                            id="Remark"
                            placeholder="Remark"
                            name="remark"
                            value={formik.values.remark}
                            onChange={handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.remark && formik.errors.remark ? (
                            <small className="form-text text-danger">{formik.errors.remark}</small>
                        ) : (
                            <small className="form-text text-muted"></small>
                        )}
                    </div>
                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="Userimage" className="mb-2 text-muted">User image</label>
                        <input
                            type="file"
                            className={`form-control ${formik.touched.userImage && formik.errors.userImage ? 'is-invalid' : ''}`}
                            id="Userimage"
                            name="userImage"
                            onChange={handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.userImage && formik.errors.userImage ? (
                            <small className="form-text text-danger">{formik.errors.userImage}</small>
                        ) : (<small className="form-text text-muted"></small>
                        )}
                    </div>
                    <div className="form-group col-md-6 d-flex align-items-center">
                        <div>
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="activeUser"
                                name="isLocked"
                                checked={formik.values.isLocked}
                                onChange={formik.handleChange}
                            />
                            <label className="form-check-label" htmlFor="activeUser" style={{ marginLeft: "10px" }}>Is Locked User</label>
                        </div>
                        <small className="form-text text-muted"></small>
                    </div>
                    <button type="submit" className="btn btn-success w-25 btn-lg m-auto mt-5">Add User</button>
                </form>
            </CCardBody>
        </CCard>
    )
}
export default AddUser;
