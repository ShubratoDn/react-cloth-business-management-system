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
import { fetchSuppliersByStoreId } from 'services/stakeholderServices';

const CreatePurchase = () => {
    const [isLoading, setLoading] = useState(false);
    const [storeOptions, setStoreOptions] = useState([]);
    const [supplierOptions, setSupplierOptions] = useState([]);
    const [rows, setRows] = useState([{ productName: '', size: '', category: '', price: '', quantity: '', total: 0 }]);

    // Fetch Stores
    useEffect(() => {
        const options = getLoggedInUsersAssignedStore().map((store) => ({
            id: store.id,
            value: store.id,
            label: store.storeName
                ? `${store.storeName} (${store.storeCode})`
                : store.storeCode,
        }));
        setStoreOptions(options);
    }, []);

    const formik = useFormik({
        initialValues: {
            store: null,
            supplier: null,
            purchaseDate: new Date().toISOString().split('T')[0], // Set initial value to today's date
            remark: '',
        },
        validationSchema: Yup.object({
            store: Yup.object().nullable().required('Store is required'),
            supplier: Yup.object().nullable().required('Supplier is required'),
            purchaseDate: Yup.date().required('Purchase date is required'),
            remark: Yup.string().max(255, 'Remark cannot exceed 255 characters'),
        }),
        onSubmit: (values, { resetForm }) => {
            setLoading(true);
            toast.dismiss();

            let formData = new FormData();
            formData.append("store.id", values.store.id);
            formData.append("supplier.id", values.supplier.id);
            formData.append("purchaseDate", values.purchaseDate);

            // Handle Purchase Details
            rows.forEach((row, index) => {
                formData.append(`purchaseDetails[${index}].productName`, row.productName);
                formData.append(`purchaseDetails[${index}].size`, row.size);
                formData.append(`purchaseDetails[${index}].category`, row.category);
                formData.append(`purchaseDetails[${index}].price`, row.price);
                formData.append(`purchaseDetails[${index}].quantity`, row.quantity);
                formData.append(`purchaseDetails[${index}].total`, row.total);
            });

            addPurchase(formData)
                .then((response) => {
                    toast.success('Purchase created successfully!', {
                        position: 'bottom-center',
                        theme: 'dark',
                    });
                    resetForm();
                    setRows([{ productName: '', size: '', category: '', price: '', quantity: '', total: 0 }]);
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

    const handleAddRow = () => {
        setRows([...rows, { productName: '', size: '', category: '', price: '', quantity: '', total: 0 }]);
    };

    const handleRemoveRow = (index) => {
        setRows(rows.filter((_, i) => i !== index));
    };

    const handleRowChange = (index, field, value) => {
        const newRows = [...rows];
        newRows[index][field] = value;

        // Update total for the row
        if (field === 'price' || field === 'quantity') {
            newRows[index].total = newRows[index].price * newRows[index].quantity;
        }

        setRows(newRows);
    };

    const fetchSuppliers = (option) => {
        fetchSuppliersByStoreId(option.value)
            .then((data) => {
                if (data && data.length < 1) {
                    toast.error('No supplier found');
                } else {
                    const options = data.map((supplier) => ({
                        id: supplier.id,
                        value: supplier.id,
                        label: supplier.name,
                    }));
                    setSupplierOptions(options);
                }
            })
            .catch((err) => {
                if (err.code === 'ERR_NETWORK') {
                    toast.error('Network error! Failed to connect with server.', {
                        position: "bottom-center",
                        theme: "dark",
                    });
                    return;
                }

                if (err.response.data.message) {
                    toast.error(`${err.response.data.message}`, {
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

                console.error(errMessages);
            });
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        formik.setFieldValue(name, value);
    };




    return (
        <>
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
                                onChange={(option) => {
                                    formik.setFieldValue('store', option);
                                    fetchSuppliers(option);
                                }}
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
                                isDisabled={!formik.values.store} // Disable if store is not selected
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


                        <hr />

                        <h4>Purchase Details</h4>
                        <div>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Name</th>
                                        <th scope="col">Size</th>
                                        <th scope="col">Category</th>
                                        <th scope="col">Unit Price</th>
                                        <th scope="col">Quantity</th>
                                        <th scope="col">Total</th>
                                        <th scope="col">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={row.productName}
                                                    onChange={(e) => handleRowChange(index, 'productName', e.target.value)}
                                                    placeholder="Enter product name"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={row.size}
                                                    onChange={(e) => handleRowChange(index, 'size', e.target.value)}
                                                    placeholder="Enter size"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={row.category}
                                                    onChange={(e) => handleRowChange(index, 'category', e.target.value)}
                                                    placeholder="Enter category"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={row.price}
                                                    onChange={(e) => handleRowChange(index, 'price', parseFloat(e.target.value) || 0)}
                                                    placeholder="Enter unit price"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={row.quantity}
                                                    onChange={(e) => handleRowChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                                    placeholder="Enter quantity"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={row.total}
                                                    readOnly
                                                />
                                            </td>
                                            <td>
                                                <CButton
                                                    color="danger"
                                                    size="sm"
                                                    onClick={() => handleRemoveRow(index)}
                                                >
                                                    Remove
                                                </CButton>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <CButton
                                color="primary"
                                size="sm"
                                onClick={handleAddRow}
                            >
                                Add Row
                            </CButton>
                        </div>

                        <div className="form-group col-md-12 mt-3">
                            <CButton
                                type="submit"
                                color="primary"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Submitting...' : 'Submit'}
                            </CButton>
                        </div>

                    </form>
                </CCardBody>
            </CCard>
        </>
    );
};

export default CreatePurchase;
