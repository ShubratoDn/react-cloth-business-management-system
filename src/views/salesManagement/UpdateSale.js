import React, { useState, useEffect } from 'react';
import { useFormik, FieldArray } from 'formik';
import * as Yup from 'yup';
import Select from 'react-select';
import {
    CCard,
    CCardBody,
    CCardHeader,
    CButton,
    CFormLabel,
    CAlert,
} from '@coreui/react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getCurrentUserInfo, getLoggedInUsersAssignedStore, userHasRole } from 'services/auth';
import { fetchCustomersByStoreId } from 'services/stakeholderServices';
import { getStocksByStore } from 'services/stockServices';
import { addSale, updateSaleOrder } from 'services/saleServices';
import { useParams } from 'react-router-dom';
import { findPurchaseByIdAndPO } from 'services/purchaseServices';
import Page404 from 'views/pages/page404/Page404';
import ViewSaleDetails from './ViewSaleDetails';

const UpdateSale = () => {

    const [poNotFound, setPOnotFound] = useState(false);
    const [unauthorizedAccess, setUnauthorizedAccess] = useState(false);
    const [isUpdatedPurchase, setUpdatedPurchase] = useState(false);

    const [supplierOptions, setSupplierOptions] = useState([]);
    const [transactionDetailRows, setTransactionDetailRows] = useState([{ id: '', productName: '', size: '', category: '', price: '', quantity: '', total: 0, dbImage: '', newImage: null }]);

    const [productSuggestions, setProductSuggestions] = useState({});

    const [transaction, setTransaction] = useState(null);
    const { id, transactionNumber } = useParams();
    
    const [isLoading, setLoading] = useState(false);
    const [message, setMessage] = useState({});
    const [storeOptions, setStoreOptions] = useState([]);
    const [customerOptions, setCustomerOptions] = useState([]);
    const [saleDetailRows, setSaleDetailRows] = useState([{ product: '', price: '', quantity: '', total: 0, dbImage: '' }]);
    const [productPricesTotal, setProductPricesTotal] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);

    const [stockSuggestions, setStockSuggestions] = useState([]);

    const [discount, setDiscount] = useState(0); // State to handle discount amount
    const [discountRemark, setDiscountRemark] = useState(""); // State to handle discount amount
    const [charge, setCharge] = useState(0);     // State to handle charge amount
    const [chargeRemark, setChargeRemark] = useState("");     // State to handle charge amount

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

    const saleDetailValidationSchema = Yup.array().of(
        Yup.object().shape({
            product: Yup.number().required('Product is required'),
            price: Yup.number()
                .required('Price is required')
                .min(1, 'Price must be greater than 0'),
            quantity: Yup.number()
                .required('Quantity is required')
                .min(1, 'Quantity must be greater than 0')
                .test('max-stock', 'Quantity exceeds available stock', function (value) {
                    const { product } = this.parent;
                    const stockEntry = stockInfo.find(stock => stock.product.id === product);
                    if(!stockEntry){
                        return false;
                    }
                    return getTotalQuantityByProductId(product) <= stockEntry.totalQuantity;
                })
        })
    ).min(1, 'At least one sale detail is required');
    

    const formik = useFormik({
        initialValues: {
            store: null,
            customer: null,
            saleDate: new Date().toISOString().split('T')[0], // Set initial value to today's date
            remark: '',
            transactionDetails: [{ product: '', price: '', quantity: '', total: 0, dbImage: '' }],
        },
        validationSchema: Yup.object({
            store: Yup.object().nullable().required('Store is required'),
            customer: Yup.object().nullable().required('customer is required'),
            saleDate: Yup.date().required('PurcShase date is required'),
            remark: Yup.string().max(255, 'Remark cannot exceed 255 characters'),

            transactionDetails: saleDetailValidationSchema, // Add validation here
        }),
        validateOnChange:true,
        validateOnBlur:true,
        onSubmit: (values, { resetForm }) => {
            setMessage({})
            setLoading(true);
            toast.dismiss();

            let formData = new FormData();
            formData.append("store.id", values.store.id);
            formData.append("partner.id", values.customer.id);
            formData.append("transactionDate", values.saleDate);
            formData.append("transactionType", "SALE");
            formData.append("remark", values.remark);
            formData.append("transactionStatus", values.transactionStatus)


            formData.append("discountAmount", discount);
            formData.append("discountRemark", discountRemark);

            formData.append("chargeAmount", charge);
            formData.append("chargeRemark", chargeRemark);


            // Handle sale Details
            saleDetailRows.forEach((row, index) => {
                formData.append(`transactionDetails[${index}].id`, row.id);
                formData.append(`transactionDetails[${index}].product.id`, row.product);
                formData.append(`transactionDetails[${index}].price`, row.price);
                formData.append(`transactionDetails[${index}].quantity`, row.quantity ? row.quantity : 0);
                formData.append(`transactionDetails[${index}].total`, row.total);
            });

            updateSaleOrder(id, transactionNumber, formData)
                .then((response) => {
                    toast.success("Sale order (" + response.transactionNumber + ") has been created successfully.", {
                        position: 'bottom-center',
                        theme: 'dark',
                    });
                    setMessage({ success: "Sale order (" + response.transactionNumber + ") has been created successfully." })
                    resetForm();
                    setSaleDetailRows([{ product: '', price: '', quantity: '', total: 0, dbImage: '' }]);
                    setGrandTotal(0);
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

                    fetchStockByStore(storeOption);

                    //set store value
                    formik.setFieldValue("store", storeOption);
                    formik.setFieldValue("customer", supplierOption);
                    formik.setFieldValue("transactionDate", data.transactionDate)
                    formik.setFieldValue("transactionStatus", data.transactionStatus)
                    formik.setFieldValue("remark", data.remark ? data.remark : '')

                    // Extract and Transform transactionDetails from the JSON
                    const dbSaleDetails = data.transactionDetails.map((row, index) => {
                        return ({
                            id: row.id,
                            product: row.product.id || '',
                            price: row.price || '',
                            quantity: row.quantity || '',
                            total: (row.price * row.quantity) || 0,
                            dbImage: row.image ? row.image : (row.product.image || ''),
                        })
                    });
                    // Set the transformed transactionDetails into the Formik field value
                    formik.setFieldValue('transactionDetails', dbSaleDetails);
                    calculateProductPricesTotal(dbSaleDetails);
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



    const createFirstRow = () => {
        const newRows = [{ product: '', price: '', quantity: '', total: 0, dbImage: '' }];
        formik.setFieldValue('transactionDetails', newRows);
        calculateProductPricesTotal(newRows); // Recalculate grand total
    };

    const handleAddRow = () => {
        const newRows = [...formik.values.transactionDetails, { product: '', price: '', quantity: '', total: 0, dbImage: '' }];
        formik.setFieldValue('transactionDetails', newRows);
        calculateProductPricesTotal(newRows); // Recalculate grand total
    };

    const handleRemoveRow = (index) => {
        const newRows = formik.values.transactionDetails.filter((_, rowIndex) => rowIndex !== index);
        formik.setFieldValue('transactionDetails', newRows);
        calculateProductPricesTotal(newRows); // Recalculate grand total
    };



    const [stockInfo, setStockInfo] = useState([]);

    const handleRowChange = (index, field, value) => {
        const newRows = [...formik.values.transactionDetails];
        newRows[index][field] = value;
    
        if (field === 'price' || field === 'quantity') {
            const price = parseFloat(newRows[index].price) || 0;
            const quantity = parseInt(newRows[index].quantity) || 0;
            newRows[index].total = price * quantity;
        }
    
        formik.setFieldValue('transactionDetails', newRows);
        // formik.setFieldValue(`transactionDetails[${index}].${field}`, value);
        formik.setFieldTouched(`transactionDetails[${index}].${field}`, true); // Mark the field as touched
        calculateProductPricesTotal(newRows);
    };

    const getTotalQuantityByProductId = (productId) => {
        return formik.values.transactionDetails
            .filter(item => item.product === productId)
            .reduce((total, item) => total + (parseInt(item.quantity) || 0), 0);
    };
    
    const getRemainingStockByProductId = (productId) => {
        const stockEntry = stockInfo.find(stock => stock.product.id === productId);
        const totalProductQuantity = getTotalQuantityByProductId(productId);
        return stockEntry ? stockEntry.totalQuantity - totalProductQuantity : 0;
    };

    const getStockQtyByProduct = (productId) => {
        const stockEntry = stockInfo.find(stock => stock.product.id === productId);
        return stockEntry ? stockEntry.totalQuantity : 0;
    };


    const calculateProductPricesTotal = (saleDetailRows) => {
        const total = saleDetailRows.reduce((acc, row) => {
            // if (row.productName) {
            //     return acc + row.total;
            // }
            return acc + row.total;
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
        // Ensure that the saleDetailRows state is in sync with Formik's values
        setSaleDetailRows(formik.values.transactionDetails);
    }, [formik.values.transactionDetails]);


    const fetchCustomers = (option) => {
        fetchCustomersByStoreId(option.value)
            .then((data) => {
                if (data && data.length < 1) {
                    toast.error('No customer found for this store');
                } else {
                    const options = data.map((customer) => ({
                        id: customer.id,
                        value: customer.id,
                        label: customer.name + " - " + customer.phone,
                    }));

                    formik.setFieldValue("customer", null)
                    setCustomerOptions(options);
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


    const fetchStockByStore = (option) => {
        getStocksByStore(option.value)
            .then((data) => {
                if (data && data.length < 1) {
                    toast.error('This store is out of stock!');
                } else {
                    const options = data.map((item) => ({
                        id: item.product.id,
                        value: item.product.id,
                        label: `${item.product.name} (${item.product.category.name}) ${item.product.size}`
                    }));
                    setStockSuggestions(options);
                    setStockInfo(data);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        formik.setFieldValue(name, value);
    };

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
                    <h4 className='display-6'>Editing Sales Order : {transaction && transaction.transactionNumber}</h4>
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
                                    formik.setFieldValue('transactionDetails',[]);
                                    createFirstRow();
                                    setStockSuggestions([]);
                                    setStockInfo([]);
                                    setSaleDetailRows([])
                                    fetchCustomers(option);
                                    fetchStockByStore(option);
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

                        {/* Customer Field */}
                        <div className="form-group col-md-6 mb-3">
                            <CFormLabel htmlFor="customer">Customer</CFormLabel>
                            <Select
                                isDisabled={!formik.values.store} // Disable if store is not selected
                                id="customer"
                                name="customer"
                                options={customerOptions}
                                value={formik.values.customer}
                                onChange={(option) => formik.setFieldValue('customer', option)}
                                onBlur={formik.handleBlur}
                                classNamePrefix="react-select"
                                className={
                                    formik.touched.customer && formik.errors.customer
                                        ? 'is-invalid'
                                        : ''
                                }
                            />
                            {formik.touched.customer && formik.errors.customer && (
                                <div className="text-danger mt-1">
                                    {formik.errors.customer}
                                </div>
                            )}
                        </div>

                        {/* Sale Date Field */}
                        <div className="form-group col-md-6 mb-3">
                            <CFormLabel htmlFor="saleDate">Sale Date</CFormLabel>
                            <input
                                type="date"
                                className={`form-control ${formik.touched.saleDate && formik.errors.saleDate
                                    ? 'is-invalid'
                                    : ''
                                    }`}
                                id="saleDate"
                                name="saleDate"
                                value={formik.values.saleDate}
                                onChange={handleChange}
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.saleDate && formik.errors.saleDate && (
                                <div className="text-danger mt-1">
                                    {formik.errors.saleDate}
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
                            <CFormLabel htmlFor="saleDate">Grand Total</CFormLabel>
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

                        <h4>Sale Details</h4>

                        {formik.errors.transactionDetails && formik.touched.transactionDetails ? (
                            <div style={{ color: 'red' }}>{formik.errors.transactionDetails.length == 40 && formik.errors.transactionDetails}</div>
                        ) : null }

                        <div>
                            <table className="table purchase-details">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Product</th>
                                        <th scope="col">Stock Qty</th>
                                        <th scope="col">Remain Stock</th>
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
                                            <td>
                                                <Select
                                                    options={stockSuggestions}
                                                    value={stockSuggestions.find(opt => opt.value === row.product)}
                                                    onChange={(option) => {
                                                        formik.setFieldValue(`transactionDetails[${index}].product`, option.value);
                                                        handleRowChange(index, 'product', option.value);
                                                    }}
                                                    classNamePrefix="react-select"
                                                    className='product-selection'
                                                />
                                                {formik.touched.transactionDetails?.[index]?.product && formik.errors.transactionDetails?.[index]?.product && (
                                                    <div className="text-danger">{formik.errors.transactionDetails[index].product}</div>
                                                )}
                                            </td>
                                            <td>
                                                {row.product ? getStockQtyByProduct(row.product) : 0}
                                            </td>
                                            <td>
                                                {row.product ? getRemainingStockByProductId(row.product) : 0}
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className={`form-control ${formik.touched.transactionDetails?.[index]?.price && formik.errors.transactionDetails?.[index]?.price ? 'is-invalid' : ''}`}
                                                    value={row.price}
                                                    onChange={e => handleRowChange(index, 'price', parseFloat(e.target.value) || 0)}
                                                    placeholder="Enter price"
                                                />
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
