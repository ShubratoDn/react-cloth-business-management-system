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
import { searchProducts } from 'services/productServices';
import { BASE_URL } from 'configs/axiosConfig';

const CreatePurchase = () => {
    const [isLoading, setLoading] = useState(false);
    const [storeOptions, setStoreOptions] = useState([]);
    const [supplierOptions, setSupplierOptions] = useState([]);
    const [purchaseDetailRows, setPurchaseDetailRows] = useState([{ productName: '', size: '', category: '', price: '', quantity: '', total: 0, dbImage: '', newImage: null }]);
    const [grandTotal, setGrandTotal] = useState(0); // Grand total state
    const [productSuggestions, setProductSuggestions] = useState({});


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

    const purchaseDetailValidationSchema = Yup.array()
        .of(
            Yup.object().shape({
                productName: Yup.string().required('Product name is required'),
                size: Yup.string().required('Size is required'),
                category: Yup.string().required('Category is required'),
                price: Yup.number()
                    .required('Price is required')
                    .min(0, 'Price must be greater than or equal to 0'),
                quantity: Yup.number()
                    .required('Quantity is required')
                    .min(1, 'Quantity must be greater than or equal to 1'),
            })
        )
        .min(1, 'At least one purchase detail is required');

    const formik = useFormik({
        initialValues: {
            store: null,
            supplier: null,
            purchaseDate: new Date().toISOString().split('T')[0], // Set initial value to today's date
            remark: '',
            purchaseDetails: [{ productName: '', size: '', category: '', price: '', quantity: '', total: 0, dbImage: '', newImage: null }],
        },
        validationSchema: Yup.object({
            store: Yup.object().nullable().required('Store is required'),
            supplier: Yup.object().nullable().required('Supplier is required'),
            purchaseDate: Yup.date().required('Purchase date is required'),
            remark: Yup.string().max(255, 'Remark cannot exceed 255 characters'),

            // purchaseDetails: purchaseDetailValidationSchema, // Add validation here
        }),
        onSubmit: (values, { resetForm }) => {
            setLoading(true);
            toast.dismiss();

            let formData = new FormData();
            formData.append("store.id", values.store.id);
            formData.append("supplier.id", values.supplier.id);
            formData.append("purchaseDate", values.purchaseDate);

            // Handle Purchase Details
            purchaseDetailRows.forEach((row, index) => {
                formData.append(`purchaseDetails[${index}].product.name`, row.productName);
                formData.append(`purchaseDetails[${index}].product.size`, row.size);
                formData.append(`purchaseDetails[${index}].product.category.name`, row.category);
                formData.append(`purchaseDetails[${index}].price`, row.price);
                formData.append(`purchaseDetails[${index}].quantity`, row.quantity ? row.quantity : 0);
                formData.append(`purchaseDetails[${index}].total`, row.total);
            });

            addPurchase(formData)
                .then((response) => {
                    toast.success('Purchase created successfully!', {
                        position: 'bottom-center',
                        theme: 'dark',
                    });
                    resetForm();
                    setPurchaseDetailRows([{ productName: '', size: '', category: '', price: '', quantity: '', total: 0 }]);
                    setGrandTotal(0); // Reset Grand Total
                })
                .catch((err) => {
                    console.error(err);
                    if (err.response && err.response.data && err.response.data.message) {
                        toast.error(err.response.data.message, {
                            position: 'bottom-center',
                            theme: 'dark',
                        });
                    } else {
                        const errMessages = Object.entries(err.response.data).map(([key, value]) => {
                            toast.error(`${value}`, {
                                position: "bottom-center",
                                theme: "dark",
                            })
                            return `${value}`
                        }).join(", ")
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        },
    });


    const handleAddRow = () => {
        const newRows = [...formik.values.purchaseDetails, { productName: '', size: '', category: '', price: '', quantity: '', total: 0 }];
        formik.setFieldValue('purchaseDetails', newRows);
        calculateGrandTotal(newRows); // Recalculate grand total
    };

    const handleRemoveRow = (index) => {
        const newRows = formik.values.purchaseDetails.filter((_, rowIndex) => rowIndex !== index);
        formik.setFieldValue('purchaseDetails', newRows);
        calculateGrandTotal(newRows); // Recalculate grand total
    };


    const handleRowChange = (index, field, value) => {
        const newRows = [...formik.values.purchaseDetails];
        newRows[index][field] = value;

        if (field === 'productName') {
            fetchProductSuggestions(value, index);
        } else if (field === 'price' || field === 'quantity') {
            const price = parseFloat(newRows[index].price) || 0;
            const quantity = parseInt(newRows[index].quantity) || 0;
            newRows[index].total = price * quantity;
        }

        formik.setFieldValue('purchaseDetails', newRows);
        calculateGrandTotal(newRows);
    };



    const calculateGrandTotal = (purchaseDetailRows) => {
        const total = purchaseDetailRows.reduce((acc, row) => {
            if (row.productName) {
                return acc + row.total;
            }
            return acc;
        }, 0);
        setGrandTotal(total);
    };



    useEffect(() => {
        // Ensure that the purchaseDetailRows state is in sync with Formik's values
        setPurchaseDetailRows(formik.values.purchaseDetails);
    }, [formik.values.purchaseDetails]);


    const fetchSuppliers = (option) => {
        fetchSuppliersByStoreId(option.value)
            .then((data) => {
                if (data && data.length < 1) {
                    toast.error('No supplier found');
                } else {
                    const options = data.map((supplier) => ({
                        id: supplier.id,
                        value: supplier.id,
                        label: supplier.name + " - " + supplier.phone,
                    }));

                    formik.setFieldValue("supplier", null)
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



    const fetchProductSuggestions = async (productName, index) => {
        if (productName.length < 1) {
            // Fetch only if the input is at least 1 characters long
            setProductSuggestions(prev => ({ ...prev, [index]: [] }));
            return;
        }

        try {
            const suggestions = await searchProducts(productName, 0, 5);
            // setProductSuggestions(suggestions.content);
            setProductSuggestions(prev => ({ ...prev, [index]: suggestions.content }));
        } catch (error) {
            console.error('Error fetching product suggestions:', error);
            toast.error('Failed to fetch product suggestions.', {
                position: 'bottom-center',
                theme: 'dark',
            });
        }
    };



    const handleSuggestionClick = (suggestion, index) => {
        const newRows = [...formik.values.purchaseDetails];
        newRows[index] = {
            ...newRows[index],
            productName: suggestion.name,
            size: suggestion.size,
            category: suggestion.category.name,
            dbImage: suggestion.image,
            newImage: null
            // price: '', // You might want to handle fetching price separately
            // quantity: '', // Reset quantity if needed
            // total: 0, // Reset total
        };
        formik.setFieldValue('purchaseDetails', newRows);
        setProductSuggestions(prev => ({ ...prev, [index]: [] })); // Clear suggestions for this row
    };


    const handleProductSuggestionBlur = () => {
        setTimeout(() => {
            setProductSuggestions({})
        }, 100)
    }


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
                                id="store"
                                name="store"
                                options={storeOptions}
                                value={formik.values.store}
                                onChange={(option) => {
                                    formik.setFieldValue('store', option);
                                    fetchSuppliers(option);
                                }}
                                onBlur={formik.handleBlur}
                                classNamePrefix="react-select"
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


                        <div className="form-group col-md-6 mb-3">
                            <CFormLabel htmlFor="purchaseDate">Grand Total</CFormLabel>
                            <div>
                                =<span style={{ fontWeight: "bold" }}>{grandTotal}</span> TK
                            </div>

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

                        {formik.errors.purchaseDetails && formik.touched.purchaseDetails ? (
                            <div style={{ color: 'red' }}>{formik.errors.purchaseDetails.length == 40 && formik.errors.purchaseDetails}</div>
                        ) : null}

                        <div>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Image</th>
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
                                    {formik.values.purchaseDetails.map((row, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{}</td>
                                            <td className='input-suggestable'>
                                                <input
                                                    type="text"
                                                    className={`form-control ${formik.touched.purchaseDetails?.[index]?.productName && formik.errors.purchaseDetails?.[index]?.productName ? 'is-invalid' : ''}`}
                                                    value={row.productName}
                                                    onChange={e => { handleRowChange(index, 'productName', e.target.value) }}
                                                    onFocus={e => { handleRowChange(index, 'productName', e.target.value) }}
                                                    onBlur={() => handleProductSuggestionBlur()}
                                                    placeholder="Enter product name"
                                                />

                                                {productSuggestions[index] && productSuggestions[index].length > 0 && (
                                                    <ul className='input-suggestions'>
                                                        {productSuggestions[index].map((suggestion) => (
                                                            <li key={suggestion.id} onClick={() => handleSuggestionClick(suggestion, index)}>
                                                                {suggestion.name} - {suggestion.size} - {suggestion.category.name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}

                                                {formik.touched.purchaseDetails?.[index]?.productName && formik.errors.purchaseDetails?.[index]?.productName && (
                                                    <div className="text-danger">{formik.errors.purchaseDetails[index].productName}</div>
                                                )}
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className={`form-control ${formik.touched.purchaseDetails?.[index]?.size && formik.errors.purchaseDetails?.[index]?.size ? 'is-invalid' : ''}`}
                                                    value={row.size}
                                                    onChange={e => handleRowChange(index, 'size', e.target.value)}
                                                    placeholder="Enter size"
                                                />
                                                {formik.touched.purchaseDetails?.[index]?.size && formik.errors.purchaseDetails?.[index]?.size && (
                                                    <div className="text-danger">{formik.errors.purchaseDetails[index].size}</div>
                                                )}
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className={`form-control ${formik.touched.purchaseDetails?.[index]?.category && formik.errors.purchaseDetails?.[index]?.category ? 'is-invalid' : ''}`}
                                                    value={row.category}
                                                    onChange={e => handleRowChange(index, 'category', e.target.value)}
                                                    placeholder="Enter category"
                                                />
                                                {formik.touched.purchaseDetails?.[index]?.category && formik.errors.purchaseDetails?.[index]?.category && (
                                                    <div className="text-danger">{formik.errors.purchaseDetails[index].category}</div>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{display:"flex", alignItems:"center"}}>
                                                    <input
                                                        type="number"
                                                        className={`form-control ${formik.touched.purchaseDetails?.[index]?.price && formik.errors.purchaseDetails?.[index]?.price ? 'is-invalid' : ''}`}
                                                        value={row.price}
                                                        onChange={e => handleRowChange(index, 'price', parseFloat(e.target.value) || 0)}
                                                        placeholder="Enter price"
                                                    /> <span style={{marginLeft:"7px"}}>TK</span>
                                                </div>
                                                {formik.touched.purchaseDetails?.[index]?.price && formik.errors.purchaseDetails?.[index]?.price && (
                                                    <div className="text-danger">{formik.errors.purchaseDetails[index].price}</div>
                                                )}
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className={`form-control ${formik.touched.purchaseDetails?.[index]?.quantity && formik.errors.purchaseDetails?.[index]?.quantity ? 'is-invalid' : ''}`}
                                                    value={row.quantity}
                                                    onChange={e => handleRowChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                                    placeholder="Enter quantity"
                                                />
                                                {formik.touched.purchaseDetails?.[index]?.quantity && formik.errors.purchaseDetails?.[index]?.quantity && (
                                                    <div className="text-danger">{formik.errors.purchaseDetails[index].quantity}</div>
                                                )}
                                            </td>
                                            <td>{row.total}</td>
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

                        {/* Grand Total Section */}
                        <div>
                            <div className='text-right' style={{ width: "fit-content", margin: "auto 0 auto auto", fontSize:"20px" }}>Grand Total: <span style={{fontWeight:"bolder"}}>{grandTotal} TK</span></div>
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
