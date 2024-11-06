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
import { addPurchase } from 'services/purchaseServices';
import { getLoggedInUsersAssignedStore } from 'services/auth';
import { fetchSuppliersByStoreId } from 'services/stakeholderServices';
import { searchProducts } from 'services/productServices';
import { BASE_URL } from 'configs/axiosConfig';
import CIcon from '@coreui/icons-react';
import { cilCamera } from '@coreui/icons';

const CreatePurchase = () => {
    const [isLoading, setLoading] = useState(false);
    const [message, setMessage] = useState({});
    const [storeOptions, setStoreOptions] = useState([]);
    const [supplierOptions, setSupplierOptions] = useState([]);
    const [purchaseDetailRows, setPurchaseDetailRows] = useState([{ productName: '', size: '', category: '', price: '', quantity: '', total: 0, dbImage: '', newImage: null }]);
    const [productPricesTotal, setProductPricesTotal] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);
    const [productSuggestions, setProductSuggestions] = useState({});

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

            purchaseDetails: purchaseDetailValidationSchema, // Add validation here
        }),
        onSubmit: (values, { resetForm }) => {
            setMessage({})
            setLoading(true);
            toast.dismiss();

            let formData = new FormData();
            formData.append("store.id", values.store.id);
            formData.append("partner.id", values.supplier.id);
            formData.append("transactionDate", values.purchaseDate);
            formData.append("transactionType", "PURCHASE");
            formData.append("remark", values.remark);

            formData.append("discountAmount", discount);
            formData.append("discountRemark", discountRemark);

            formData.append("chargeAmount", charge);
            formData.append("chargeRemark", chargeRemark);


            // Handle Purchase Details
            purchaseDetailRows.forEach((row, index) => {
                formData.append(`transactionDetails[${index}].product.name`, row.productName);
                formData.append(`transactionDetails[${index}].product.size`, row.size);
                formData.append(`transactionDetails[${index}].product.category.name`, row.category);
                formData.append(`transactionDetails[${index}].price`, row.price);
                formData.append(`transactionDetails[${index}].quantity`, row.quantity ? row.quantity : 0);
                formData.append(`transactionDetails[${index}].total`, row.total);
                row.newImage && formData.append(`transactionDetails[${index}].productImage`, row.newImage);
            });

            addPurchase(formData)
                .then((response) => {
                    toast.success("Purchase Order (" + response.transactionNumber + ") has been created successfully.", {
                        position: 'bottom-center',
                        theme: 'dark',
                    });
                    setMessage({ success: "Purchase (" + response.transactionNumber + ") has been created successfully." })
                    resetForm();
                    setPurchaseDetailRows([{ productName: null, size: '', category: '', price: '', quantity: '', total: 0 }]);
                    setGrandTotal(0.00); // Reset Grand Total
                    setProductSuggestions({})
                    setDiscount(0);
                    setCharge(0);
                })
                .catch((err) => {
                    setGrandTotal(0.00);
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
        const newRows = [...formik.values.purchaseDetails, { productName: '', size: '', category: '', price: '', quantity: '', total: 0, dbImage: '', newImage: null }];
        formik.setFieldValue('purchaseDetails', newRows);
        calculateProductPricesTotal(newRows); // Recalculate grand total
    };

    const handleRemoveRow = (index) => {
        const newRows = formik.values.purchaseDetails.filter((_, rowIndex) => rowIndex !== index);
        formik.setFieldValue('purchaseDetails', newRows);
        calculateProductPricesTotal(newRows); // Recalculate grand total
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
        calculateProductPricesTotal(newRows);
    };



    const calculateProductPricesTotal = (purchaseDetailRows) => {
        const total = purchaseDetailRows.reduce((acc, row) => {
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
        const newRows = [...formik.values.purchaseDetails];
        newRows[index] = {
            ...newRows[index],
            productName: suggestion.name,
            size: suggestion.size,
            category: suggestion.category.name,
            dbImage: suggestion.image,
            newImage: null
        };
        formik.setFieldValue('purchaseDetails', newRows);
        setProductSuggestions(prev => ({ ...prev, [index]: [] })); // Clear suggestions for this row
    };


    const handleProductSuggestionBlur = () => {
        setTimeout(() => {
            setProductSuggestions({})
        }, 500)
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
                            <table className="table purchase-details">
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
                                                {formik.touched.purchaseDetails?.[index]?.newImage && formik.errors.purchaseDetails?.[index]?.newImage && (
                                                    <div className="text-danger">{formik.errors.purchaseDetails[index].newImage}</div>
                                                )}
                                            </td>
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
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    <input
                                                        type="number"
                                                        className={`form-control ${formik.touched.purchaseDetails?.[index]?.price && formik.errors.purchaseDetails?.[index]?.price ? 'is-invalid' : ''}`}
                                                        value={row.price}
                                                        onChange={e => handleRowChange(index, 'price', parseFloat(e.target.value) || 0)}
                                                        placeholder="Enter price"
                                                    /> <span style={{ marginLeft: "7px" }}>TK</span>
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

export default CreatePurchase;
