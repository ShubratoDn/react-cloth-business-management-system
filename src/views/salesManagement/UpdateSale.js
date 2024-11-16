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
    CAlert,
} from '@coreui/react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { addPurchase, findPurchaseByIdAndPO, updatePurchase } from 'services/purchaseServices';
import { getCurrentUserInfo, getLoggedInUsersAssignedStore, userHasRole } from 'services/auth';
import { fetchCustomersByStoreId, fetchSuppliersByStoreId } from 'services/stakeholderServices';
import { searchProducts } from 'services/productServices';
import { BASE_URL } from 'configs/axiosConfig';
import CIcon from '@coreui/icons-react';
import { cilCamera } from '@coreui/icons';
import { useParams } from 'react-router-dom';
import Page404 from 'views/pages/page404/Page404';
import ViewSaleDetails from './ViewSaleDetails';
import { formatDate } from 'services/utils';

const UpdateSale = () => {
    const [isLoading, setLoading] = useState(false);
    const [message, setMessage] = useState({});
    const [poNotFound, setPOnotFound] = useState(false);
    const [unauthorizedAccess, setUnauthorizedAccess] = useState(false);
    const [isUpdatedPurchase, setUpdatedPurchase] = useState(false);
    const [storeOptions, setStoreOptions] = useState([]);
    const [supplierOptions, setSupplierOptions] = useState([]);
    const [transactionDetailRows, setTransactionDetailRows] = useState([{ id: '', productName: '', size: '', category: '', price: '', quantity: '', total: 0, dbImage: '', newImage: null }]);
    const [grandTotal, setGrandTotal] = useState(0); // Grand total state
    const [productSuggestions, setProductSuggestions] = useState({});
    const [productPricesTotal, setProductPricesTotal] = useState(0);

    const [discount, setDiscount] = useState(0); // State to handle discount amount
    const [discountRemark, setDiscountRemark] = useState(""); // State to handle discount amount
    const [charge, setCharge] = useState(0);     // State to handle charge amount
    const [chargeRemark, setChargeRemark] = useState("");     // State to handle charge amount


    const [transaction, setTransaction] = useState(null);
    const { id, transactionNumber } = useParams();



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
                newImage: Yup.mixed()
                    .notRequired()
                    .test('fileSize', 'File size is too large. Maximum size is 10MB', value => {
                        return value ? value.size <= 10000000 : true;
                    })
                    .test('fileType', 'Invalid file type. Supported formats: JPEG, PNG, GIF', value => {
                        return value ? ['image/jpeg', 'image/png', 'image/gif'].includes(value.type) : true;
                    }),
            })
        )
        .min(1, 'At least one transaction detail is required');

    const formik = useFormik({
        initialValues: {
            store: null,
            partner: null,
            transactionDate: new Date().toISOString().split('T')[0], // Set initial value to today's date
            transactionStatus: '',
            remark: '',

            transactionDetails: [{ id: '', productName: '', size: '', category: '', price: '', quantity: '', total: 0, dbImage: '', newImage: null }],
        },
        validationSchema: Yup.object({
            store: Yup.object().nullable().required('Store is required'),
            partner: Yup.object().nullable().required('Customer is required'),
            transactionDate: Yup.date().required('Purchase date is required'),
            remark: Yup.string().max(255, 'Remark cannot exceed 255 characters'),
            transactionStatus: Yup.string().required('Purchase status is required'),
            transactionDetails: purchaseDetailValidationSchema, // Add validation here
        }),
        onSubmit: (values, { resetForm }) => {
            setMessage({})
            setLoading(true);
            toast.dismiss();

            let formData = new FormData();
            formData.append("store.id", values.store.id);
            formData.append("partner.id", values.partner.id);
            formData.append("transactionDate", values.transactionDate);
            formData.append("remark", values.remark);
            formData.append("transactionStatus", values.transactionStatus)

            formData.append("discountAmount", parseFloat(discount || 0.0));
            formData.append("discountRemark", discountRemark);

            formData.append("chargeAmount", parseFloat(charge || 0.0));
            formData.append("chargeRemark", chargeRemark);

            // Handle Purchase Details
            transactionDetailRows.forEach((row, index) => {
                formData.append(`transactionDetails[${index}].id`, row.id);
                formData.append(`transactionDetails[${index}].image`, row.dbImage);
                formData.append(`transactionDetails[${index}].product.name`, row.productName);
                formData.append(`transactionDetails[${index}].product.size`, row.size);
                formData.append(`transactionDetails[${index}].product.category.name`, row.category);
                formData.append(`transactionDetails[${index}].price`, row.price);
                formData.append(`transactionDetails[${index}].quantity`, row.quantity ? row.quantity : 0);
                formData.append(`transactionDetails[${index}].total`, row.total);
                row.newImage && formData.append(`transactionDetails[${index}].productImage`, row.newImage);
            });

            updatePurchase(id, transactionNumber, formData)

                .then((response) => {
                    toast.success("Purchase (" + response.transactionNumber + ") has been updated successfully.", {
                        position: 'bottom-center',
                        theme: 'dark',
                    });
                    setMessage({ success: "Purchase (" + response.transactionNumber + ") has been updated successfully." })
                    resetForm();
                    setUpdatedPurchase(true);
                    setTransactionDetailRows([{ id: '', productName: null, size: '', category: '', price: '', quantity: '', total: 0 }]);
                    setGrandTotal(0); // Reset Grand Total
                    setProductSuggestions({})
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

    // HANDLE PARAMETER DATA    
    useEffect(() => {
        setLoading(true)
        findPurchaseByIdAndPO(id, transactionNumber)
            .then((data) => {
                console.log(data)
                if (!data) {
                    setPOnotFound(true);
                    return;
                }

                if(data && data.transactionType !== "SALE"){
                    
                    toast.error("Invalid Sale Order", {
                        position: "bottom-center",
                        theme: "dark",
                    })
                }else if (data && ((data.transactionStatus === "OPEN" || data.transactionStatus === "REJECTED") && (getCurrentUserInfo().id === data.processedBy.id || userHasRole("ROLE_PURCHASE_UPDATE")))) {
                    setTransaction(data);

                    setDiscount(data.discountAmount);
                    setDiscountRemark(data.discountRemark);
                    setCharge(data.chargeAmount);
                    setChargeRemark(data.chargeRemark);

                    let storeOption = {
                        id: data.store.id,
                        value: data.store.id,
                        label: data.store.storeName
                            ? `${data.store.storeName} (${data.store.storeCode})`
                            : data.store.storeCode,
                    }

                    let supplierOption = {
                        id: data.partner.id,
                        value: data.partner.id,
                        label: data.partner.name + " - " + data.partner.phone,
                    }

                    //set store value
                    formik.setFieldValue("store", storeOption);
                    formik.setFieldValue("partner", supplierOption);
                    formik.setFieldValue("transactionDate", data.transactionDate)
                    formik.setFieldValue("transactionStatus", data.transactionStatus)
                    formik.setFieldValue("remark", data.remark ? data.remark : '')

                    // Extract and Transform transactionDetails from the JSON
                    const dbPurchaseDetails = data.transactionDetails.map((row, index) => ({
                        id: row.id,
                        productName: row.product.name || '',
                        size: row.product.size || '',
                        category: row.product.category.name || '',
                        price: row.price || '',
                        quantity: row.quantity || '',
                        total: (row.price * row.quantity) || 0,
                        dbImage: row.image ? row.image : (row.product.image || ''),
                        newImage: null,
                    }));
                    // Set the transformed transactionDetails into the Formik field value
                    formik.setFieldValue('transactionDetails', dbPurchaseDetails);
                    calculateProductPricesTotal(dbPurchaseDetails);

                } else {
                    setUnauthorizedAccess(true)
                    toast.error("Purchase Order is not editable", {
                        position: "bottom-center",
                        theme: "dark",
                    })
                }
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                setLoading(false)
            })
    }, [id, transactionNumber])


    const handleAddRow = () => {
        const newRows = [...formik.values.transactionDetails, { id: '', productName: '', size: '', category: '', price: '', quantity: '', total: 0, dbImage: '', newImage: null }];
        formik.setFieldValue('transactionDetails', newRows);
        calculateProductPricesTotal(newRows); // Recalculate grand total
    };

    const handleRemoveRow = (index) => {
        const newRows = formik.values.transactionDetails.filter((_, rowIndex) => rowIndex !== index);
        formik.setFieldValue('transactionDetails', newRows);
        calculateProductPricesTotal(newRows); // Recalculate grand total
    };


    const handleRowChange = (index, field, value) => {
        const newRows = [...formik.values.transactionDetails];
        newRows[index][field] = value;

        if (field === 'productName') {
            fetchProductSuggestions(value, index);
        } else if (field === 'price' || field === 'quantity') {
            const price = parseFloat(newRows[index].price) || 0;
            const quantity = parseInt(newRows[index].quantity) || 0;
            newRows[index].total = price * quantity;
        }

        formik.setFieldValue('transactionDetails', newRows);
        calculateProductPricesTotal(newRows);
    };



    const calculateProductPricesTotal = (transactionDetailRows) => {
        const total = transactionDetailRows.reduce((acc, row) => {
            if (row.productName) {
                return acc + row.total;
            }
            return acc;
        }, 0);
        setProductPricesTotal(total);
    };

    useEffect(() => {
        let total = productPricesTotal;
        total -= parseFloat(discount || 0); // Subtract discount
        total += parseFloat(charge || 0);   // Add charge

        setGrandTotal(total);

    }, [discount, charge, productPricesTotal])




    useEffect(() => {
        // Ensure that the transactionDetailRows state is in sync with Formik's values
        setTransactionDetailRows(formik.values.transactionDetails);
    }, [formik.values.transactionDetails]);


    const fetchCustomer = (option) => {
        fetchCustomersByStoreId(option.value)
            .then((data) => {
                if (data && data.length < 1) {
                    toast.error('No partner found');
                } else {
                    const options = data.map((partner) => ({
                        id: partner.id,
                        value: partner.id,
                        label: partner.name + " - " + partner.phone,
                    }));

                    formik.setFieldValue("partner", null)
                    setSupplierOptions(options);
                }
            })
            .catch((err) => {
                if (err.code === 'ERR_NETWORK') {
                    toast.error('Network error! Failed to connect with server.', {
                        position: "bottom-center",
                        theme: "dark",
                    });
                    setMessage({ error: "Network error! Failed to connect with server." })
                    return;
                }

                if (err.response.data.message) {
                    toast.error(`${err.response.data.message}`, {
                        position: "bottom-center",
                        theme: "dark",
                    });
                    setMessage({ error: err.response.data.message })
                    return;
                }

                const errMessages = Object.entries(err.response.data).map(([key, value]) => {
                    toast.error(`${value}`, {
                        position: "bottom-center",
                        theme: "dark",
                    });
                    return `${value}`;
                }).join(", ");
                setMessage({ error: errMessages })
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
        const newRows = [...formik.values.transactionDetails];
        newRows[index] = {
            ...newRows[index],
            productName: suggestion.name,
            size: suggestion.size,
            category: suggestion.category.name,
            dbImage: suggestion.image,
            newImage: null
        };
        formik.setFieldValue('transactionDetails', newRows);
        setProductSuggestions(prev => ({ ...prev, [index]: [] })); // Clear suggestions for this row
    };


    const handleProductSuggestionBlur = () => {
        setTimeout(() => {
            setProductSuggestions({})
        }, 500)
    }



    if (poNotFound) {
        return <Page404></Page404>
    }


    if (isUpdatedPurchase || unauthorizedAccess) {
        return (<ViewSaleDetails purchaseInfoFromViewPage={transaction}></ViewSaleDetails>)
    }



    return (
        <>
            {(message.error || message.success) &&
                <CAlert
                    color={message.success ? "success" : "danger"}
                    dismissible
                >
                    {message.error}
                    {message.success}
                </CAlert>
            }


            <CCard>
                <CCardHeader>
                    <h4>Editing Purchase Order - {transaction && transaction.transactionNumber}</h4>
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
                                    fetchCustomer(option);
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

                        {/* customer Field */}
                        <div className="form-group col-md-6 mb-3">
                            <CFormLabel htmlFor="partner">Customer</CFormLabel>
                            <Select
                                isDisabled={!formik.values.store} // Disable if store is not selected
                                id="partner"
                                name="partner"
                                options={supplierOptions}
                                value={formik.values.partner}
                                onChange={(option) => formik.setFieldValue('partner', option)}
                                onBlur={formik.handleBlur}
                                classNamePrefix="react-select"
                                className={
                                    formik.touched.partner && formik.errors.partner
                                        ? 'is-invalid'
                                        : ''
                                }
                            />
                            {formik.touched.partner && formik.errors.partner && (
                                <div className="text-danger mt-1">
                                    {formik.errors.partner}
                                </div>
                            )}
                        </div>

                        {/* Purchase Date Field */}
                        <div className="form-group col-md-6 mb-3">
                            <CFormLabel htmlFor="transactionDate">Purchase Date</CFormLabel>
                            <input
                                type="date"
                                className={`form-control ${formik.touched.transactionDate && formik.errors.transactionDate
                                    ? 'is-invalid'
                                    : ''
                                    }`}
                                id="transactionDate"
                                name="transactionDate"
                                value={formik.values.transactionDate}
                                onChange={handleChange}
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.transactionDate && formik.errors.transactionDate && (
                                <div className="text-danger mt-1">
                                    {formik.errors.transactionDate}
                                </div>
                            )}
                        </div>


                        {/* Purchase Status Field */}
                        <div className="form-group col-md-6 mb-3">
                            <CFormLabel htmlFor="transactionStatus">Purchase Status</CFormLabel>
                            <select
                                className={`form-control ${formik.touched.transactionStatus && formik.errors.transactionStatus
                                    ? 'is-invalid'
                                    : ''
                                    }`}
                                id="transactionStatus"
                                name="transactionStatus"
                                value={formik.values.transactionStatus}
                                onChange={handleChange}
                                onBlur={formik.handleBlur}
                            >
                                <option value="" label=" -- Select status --" />
                                {formik.values.transactionStatus === "OPEN" && <option value="OPEN" label="Open" />}
                                {formik.values.transactionStatus === "REJECTED" && <option value="REJECTED" label="Rejected" />}
                                <option value="SUBMITTED" label="Submit" />
                            </select>
                            {formik.touched.transactionStatus && formik.errors.transactionStatus && (
                                <div className="text-danger mt-1">
                                    {formik.errors.transactionStatus}
                                </div>
                            )}
                        </div>



                        <div className="form-group col-md-6 mb-3">
                            <CFormLabel htmlFor="transactionDate">Grand Total</CFormLabel>
                            <div>
                                =<span style={{ fontWeight: "bold" }}>{grandTotal}</span> TK
                            </div>

                        </div>

                        {transaction && transaction.transactionStatus === "REJECTED" &&
                            <div className="form-group col-md-6 mb-3" style={{backgroundColor:"#fe08082b"}}>                                
                                <b>Rejected By: </b>{transaction.rejectedBy.name} <br></br>
                                <b>Rejected Date:</b> {formatDate(transaction.rejectedDate)} <br></br>
                                <b>Reason : </b>{transaction.rejectedNote}
                            </div>
                        }


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

                        {formik.errors.transactionDetails && formik.touched.transactionDetails ? (
                            <div style={{ color: 'red' }}>{formik.errors.transactionDetails.length == 40 && formik.errors.transactionDetails}</div>
                        ) : null}

                        <div>
                            <table className="table transaction-details">
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
                                    {formik.values.transactionDetails.map((row, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td className='product-table-image-container'>
                                                <div className='product-table-image-selection'>
                                                    <input
                                                        type='file'
                                                        onChange={e => { handleRowChange(index, 'newImage', e.target.files[0]) }}
                                                    />
                                                    <CIcon icon={cilCamera} className='product-table-image-selection-icon' />
                                                </div>
                                                <img
                                                    className='product-table-image'
                                                    src={row.newImage
                                                        ? URL.createObjectURL(row.newImage)
                                                        : BASE_URL + row.dbImage}
                                                />
                                                {formik.touched.transactionDetails?.[index]?.newImage && formik.errors.transactionDetails?.[index]?.newImage && (
                                                    <div className="text-danger">{formik.errors.transactionDetails[index].newImage}</div>
                                                )}
                                            </td>
                                            <td className='input-suggestable'>
                                                <input
                                                    type="text"
                                                    className={`form-control ${formik.touched.transactionDetails?.[index]?.productName && formik.errors.transactionDetails?.[index]?.productName ? 'is-invalid' : ''}`}
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

                                                {formik.touched.transactionDetails?.[index]?.productName && formik.errors.transactionDetails?.[index]?.productName && (
                                                    <div className="text-danger">{formik.errors.transactionDetails[index].productName}</div>
                                                )}
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className={`form-control ${formik.touched.transactionDetails?.[index]?.size && formik.errors.transactionDetails?.[index]?.size ? 'is-invalid' : ''}`}
                                                    value={row.size}
                                                    onChange={e => handleRowChange(index, 'size', e.target.value)}
                                                    placeholder="Enter size"
                                                />
                                                {formik.touched.transactionDetails?.[index]?.size && formik.errors.transactionDetails?.[index]?.size && (
                                                    <div className="text-danger">{formik.errors.transactionDetails[index].size}</div>
                                                )}
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className={`form-control ${formik.touched.transactionDetails?.[index]?.category && formik.errors.transactionDetails?.[index]?.category ? 'is-invalid' : ''}`}
                                                    value={row.category}
                                                    onChange={e => handleRowChange(index, 'category', e.target.value)}
                                                    placeholder="Enter category"
                                                />
                                                {formik.touched.transactionDetails?.[index]?.category && formik.errors.transactionDetails?.[index]?.category && (
                                                    <div className="text-danger">{formik.errors.transactionDetails[index].category}</div>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    <input
                                                        type="number"
                                                        className={`form-control ${formik.touched.transactionDetails?.[index]?.price && formik.errors.transactionDetails?.[index]?.price ? 'is-invalid' : ''}`}
                                                        value={row.price}
                                                        onChange={e => handleRowChange(index, 'price', parseFloat(e.target.value) || 0)}
                                                        placeholder="Enter price"
                                                    /> <span style={{ marginLeft: "7px" }}>TK</span>
                                                </div>
                                                {formik.touched.transactionDetails?.[index]?.price && formik.errors.transactionDetails?.[index]?.price && (
                                                    <div className="text-danger">{formik.errors.transactionDetails[index].price}</div>
                                                )}
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className={`form-control ${formik.touched.transactionDetails?.[index]?.quantity && formik.errors.transactionDetails?.[index]?.quantity ? 'is-invalid' : ''}`}
                                                    value={row.quantity}
                                                    onChange={e => handleRowChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                                    placeholder="Enter quantity"
                                                />
                                                {formik.touched.transactionDetails?.[index]?.quantity && formik.errors.transactionDetails?.[index]?.quantity && (
                                                    <div className="text-danger">{formik.errors.transactionDetails[index].quantity}</div>
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


                        {/* Discount and Charge Fields */}
                        <div className="form-group row mt-3">
                            <label className="offset-5 col-md-2 col-form-label">Discount</label>
                            <div className="col-md-5 d-flex">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={discountRemark}
                                    onChange={(e) => setDiscountRemark(e.target.value)}
                                    placeholder="Discount note"
                                />
                                <input
                                    type="number"
                                    className="form-control w-50"
                                    value={discount}
                                    onChange={(e) => setDiscount(e.target.value)}
                                    placeholder="Enter discount amount"
                                />
                            </div>
                        </div>

                        <div className="form-group row mt-3">
                            <label className="offset-5 col-md-2 col-form-label">Charge</label>
                            <div className="col-md-5 d-flex">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={chargeRemark}
                                    onChange={(e) => setChargeRemark(e.target.value)}
                                    placeholder="Charge note"
                                />
                                <input
                                    type="number"
                                    className="form-control w-50"
                                    value={charge}
                                    onChange={(e) => setCharge(e.target.value)}
                                    placeholder="Enter charge amount"
                                />
                            </div>
                        </div>


                        {/* Grand Total Section */}
                        <div>
                            <div className='text-right' style={{ width: "fit-content", margin: "auto 0 auto auto", fontSize: "20px", marginTop: "40px" }}>Grand Total: <span style={{ fontWeight: "bolder" }}>{grandTotal} TK</span></div>
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

export default UpdateSale;
