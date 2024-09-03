// src/components/CreatePurchase.js
import React, { useState, useEffect } from 'react';
import { useFormik, FieldArray } from 'formik';
import * as Yup from 'yup';
import Select from 'react-select';
import {
    CCard,
    CCardBody,
    CCardHeader,
    CButton,
    CFormGroup,
    CFormLabel,
} from '@coreui/react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { addPurchase } from 'services/purchaseServices';
import { getLoggedInUsersAssignedStore } from 'services/auth';

const CreatePurchase = () => {
    const [isLoading, setLoading] = useState(false);
    const [storeOptions, setStoreOptions] = useState([]);
    const [supplierOptions, setSupplierOptions] = useState([]);
    const [userOptions, setUserOptions] = useState([]);
    const [productOptions, setProductOptions] = useState([]);

    // Fetch Stores
    useEffect(() => {
        const options = getLoggedInUsersAssignedStore().map((store) => ({
            value: store.id,
            label: store.storeName
                ? `${store.storeName} (${store.storeCode})`
                : store.storeCode,
        }));
        setStoreOptions(options);

        // // Fetch Suppliers
        // getSuppliers()
        //     .then((response) => {
        //         const options = response.data.map((supplier) => ({
        //             value: supplier.id,
        //             label: supplier.name,
        //         }));
        //         setSupplierOptions(options);
        //     })
        //     .catch((err) => {
        //         console.error(err);
        //         toast.error('Failed to fetch suppliers.', {
        //             position: 'bottom-center',
        //             theme: 'dark',
        //         });
        //     });

        // // Fetch Users
        // getUsers()
        //     .then((response) => {
        //         const options = response.data.map((user) => ({
        //             value: user.id,
        //             label: user.username,
        //         }));
        //         setUserOptions(options);
        //     })
        //     .catch((err) => {
        //         console.error(err);
        //         toast.error('Failed to fetch users.', {
        //             position: 'bottom-center',
        //             theme: 'dark',
        //         });
        //     });

        // // Fetch Products
        // getProducts()
        //     .then((response) => {
        //         const options = response.data.map((product) => ({
        //             value: product.id,
        //             label: product.productName,
        //         }));
        //         setProductOptions(options);
        //     })
        //     .catch((err) => {
        //         console.error(err);
        //         toast.error('Failed to fetch products.', {
        //             position: 'bottom-center',
        //             theme: 'dark',
        //         });
        //     });
    }, []);

    const formik = useFormik({
        initialValues: {
            store: null,
            supplier: null,
            totalAmount: 0,
            purchaseDate: '',
            remark: '',

        },
        validationSchema: Yup.object({
            store: Yup.object().nullable().required('Store is required'),
            supplier: Yup.object().nullable().required('Supplier is required'),
            totalAmount: Yup.number()
                .required('Total amount is required')
                .positive('Total amount must be positive'),
            purchaseDate: Yup.date().required('Purchase date is required'),
            remark: Yup.string().max(255, 'Remark cannot exceed 255 characters'),

        }),
        onSubmit: (values, { resetForm }) => {
            setLoading(true);
            toast.dismiss();

            addPurchase(values)
                .then((response) => {
                    toast.success('Purchase created successfully!', {
                        position: 'bottom-center',
                        theme: 'dark',
                    });
                    resetForm();
                })
                .catch((err) => {
                    console.error(err);
                    if (err.response && err.response.data && err.response.data.message) {
                        toast.error(err.response.data.message, {
                            position: 'bottom-center',
                            theme: 'dark',
                        });
                    } else {
                        toast.error('An error occurred while creating the purchase.', {
                            position: 'bottom-center',
                            theme: 'dark',
                        });
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        },
    });


    const handleChange = (e) => {
        const { name, value } = e.target;
        formik.setFieldValue(name, value);
    };

    return (
        <CCard>
            <CCardHeader>
                <h4>Create Purchase</h4>
            </CCardHeader>
            <CCardBody>
                <form onSubmit={formik.handleSubmit} className="row">
                    {/* Store Field */}
                    <div className="form-group col-md-6 mb-3">
                        <CFormLabel htmlFor="store">Store</CFormLabel>
                        <Select
                            classNamePrefix="react-select"

                            id="store"
                            name="store"
                            options={storeOptions}
                            value={formik.values.store}
                            onChange={(option) => formik.setFieldValue('store', option)}
                            onBlur={formik.handleBlur}
                            className={formik.touched.store && formik.errors.store
                                    ? 'react-select-container is-invalid'
                                    : 'react-select-container'
                            }
                        />
                        {formik.touched.store && formik.errors.store && (
                            <div className="text-danger mt-1">
                                {formik.errors.store}
                            </div>
                        )}
                    </div>

                    {/* Supplier Field */}
                    <div className="form-group col-md-6 mb-3">
                        <CFormLabel htmlFor="supplier">Supplier</CFormLabel>
                        <Select
                            id="supplier"
                            name="supplier"
                            options={supplierOptions}
                            value={formik.values.supplier}
                            onChange={(option) => formik.setFieldValue('supplier', option)}
                            onBlur={formik.handleBlur}
                            classNamePrefix="react-select"
                            className={
                                formik.touched.supplier && formik.errors.supplier
                                    ? 'is-invalid'
                                    : ''
                            }
                        />
                        {formik.touched.supplier && formik.errors.supplier && (
                            <div className="text-danger mt-1">
                                {formik.errors.supplier}
                            </div>
                        )}
                    </div>

                    {/* Purchase Date Field */}
                    <div className="form-group col-md-6 mb-3">
                        <CFormLabel htmlFor="purchaseDate">Purchase Date</CFormLabel>
                        <input
                            type="date"
                            className={`form-control ${formik.touched.purchaseDate && formik.errors.purchaseDate
                                ? 'is-invalid'
                                : ''
                                }`}
                            id="purchaseDate"
                            name="purchaseDate"
                            value={formik.values.purchaseDate}
                            onChange={handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.purchaseDate && formik.errors.purchaseDate && (
                            <div className="text-danger mt-1">
                                {formik.errors.purchaseDate}
                            </div>
                        )}
                    </div>

                    {/* Total Amount Field */}
                    <div className="form-group col-md-6 mb-3">
                        <CFormLabel htmlFor="totalAmount">Total Amount</CFormLabel>
                        <input
                            type="number"
                            className={`form-control ${formik.touched.totalAmount && formik.errors.totalAmount
                                ? 'is-invalid'
                                : ''
                                }`}
                            id="totalAmount"
                            name="totalAmount"
                            value={formik.values.totalAmount}
                            onChange={handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Enter total amount"
                            min="0"
                            step="0.01"
                        />
                        {formik.touched.totalAmount && formik.errors.totalAmount && (
                            <div className="text-danger mt-1">
                                {formik.errors.totalAmount}
                            </div>
                        )}
                    </div>

                    {/* Remark Field */}
                    <div className="form-group col-md-12 mb-3">
                        <CFormLabel htmlFor="remark">Remark</CFormLabel>
                        <textarea
                            className={`form-control ${formik.touched.remark && formik.errors.remark
                                ? 'is-invalid'
                                : ''
                                }`}
                            id="remark"
                            name="remark"
                            value={formik.values.remark}
                            onChange={handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Enter remark"
                            rows="3"
                        />
                        {formik.touched.remark && formik.errors.remark && (
                            <div className="text-danger mt-1">
                                {formik.errors.remark}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="col-md-12 text-right">
                        <button type="submit" className="btn btn-success">
                            Submit
                        </button>
                    </div>
                </form>
            </CCardBody>
        </CCard>
    );
};

export default CreatePurchase;
