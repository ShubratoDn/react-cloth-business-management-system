import React, { useState, useEffect, useRef } from 'react';
import { CCard, CCardBody, CCardHeader } from '@coreui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {createProduct, getAllProductCategories } from '../../services/productServices';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

const CustomOption = (props) => (
  <div {...props.innerProps} style={{ padding: '10px', backgroundColor: '#f5f5f5' }}>
    {props.data.label}
  </div>
);

const CreateProduct = () => {
    const [options, setOptions] = React.useState([
        { value: 'chocolate', label: 'Chocolate' },
        { value: 'strawberry', label: 'Strawberry' },
    ]);


    const [categories, setCategories] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [message, setMessage] = useState({});
    const [imagePreview, setImagePreview] = useState(null); // State for image preview

    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [stream, setStream] = useState(null);

    useEffect(() => {
        if (isCameraOpen) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then((mediaStream) => {
                    videoRef.current.srcObject = mediaStream;
                    setStream(mediaStream);
                })
                .catch((error) => {
                    console.error('Error accessing camera:', error);
                });
        } else if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [isCameraOpen]);

    const handleCapture = () => {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
            const file = new File([blob], 'captured_image.jpg', { type: 'image/jpeg' });
            formik.setFieldValue('productImage', file);
            setImagePreview(URL.createObjectURL(file)); // Set image preview
        }, 'image/jpeg');
        setIsCameraOpen(false);
    };

    useEffect(() => {
        getAllProductCategories()
            .then(response => {
                setCategories(response);
            })
            .catch(err => {
                console.error(err);
                toast.error('Failed to load categories.', { theme: "dark" });
            });
    }, []);

    const formik = useFormik({
        initialValues: {
            category: '',
            name: '',
            price: '',
            size: '',
            productImage: null,
            remark: '',
        },
        validationSchema: Yup.object({
            // category: Yup.string().required('Category is required'),
            name: Yup.string()
                .required('Product name is required')
                .min(3, 'Product name should be at least 3 characters'),
            price: Yup.number()
                .required('Price is required')
                .min(0.1, 'Price must be greater than zero'),
            size: Yup.string().required('Size is required'),
            productImage: Yup.mixed()
                .required('Product image is required')
                .test('fileSize', 'File size is too large. Maximum size is 5MB', value => {
                    return value ? value.size <= 5000000 : true;
                })
                .test('fileType', 'Invalid file type. Supported formats: JPEG, PNG, GIF', value => {
                    return value ? ['image/jpeg', 'image/png', 'image/gif'].includes(value.type) : true;
                }),
            remark: Yup.string().notRequired(),
        }),
        onSubmit: (values, { resetForm }) => {
            setLoading(true);
            setMessage({});

            createProduct(values)
                .then((response) => {
                    toast.success('Product created successfully!', {
                        position: "bottom-center",
                        theme: "dark",
                    });

                    resetForm({ values: '' });
                    setMessage({ success: "Product creation successful." });
                })
                .catch((err) => {
                    console.error(err);

                    if (err.code === 'ERR_NETWORK') {
                        toast.error('Network error! Failed to connect with server.', {
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
                .finally(() => setLoading(false));
        }
    });

    const handleChange = event => {
        if (event.target.type === 'file') {
            const file = event.target.files[0];
            formik.setFieldValue('productImage', file);
            setImagePreview(URL.createObjectURL(file)); // Set image preview
        } else {
            formik.handleChange(event);
        }
    };

    return (
        <CCard>
            <CCardHeader>
                <h4>Create Product </h4>
            </CCardHeader>
            <CCardBody>
                <form onSubmit={formik.handleSubmit} className="row position-relative">
                    {(message.error || message.success) && (
                        <div className='p-2'>
                            <div className={message.error ? "alert alert-danger mt-3" : "alert alert-success mt-3"} role="alert">
                                {message.error || message.success}
                            </div>
                        </div>
                    )}

                    {isLoading && <div className="loaderContainer"><div className='loader'></div></div>}


                    {/* IMAGE PREVIEW */}
                    {imagePreview && (
                        <div className="image-preview mb-3">
                            <img src={imagePreview} alt="Image preview" className="img-fluid" />
                        </div>
                    )}

                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="category" className="mb-2 text-muted">Category</label>
                        {/* <Select options={options} /> */}
                        <CreatableSelect
                            isClearable
                            onChange={(newValue) => console.log(newValue)}
                            options={options}
                            onCreateOption={(inputValue) => {
                                const newOption = { value: inputValue, label: inputValue };
                                setOptions((prevOptions) => [...prevOptions, newOption]);
                            }}
                            components={{ Option: CustomOption }}
                        />
                        <select
                            className={`form-control ${formik.touched.category && formik.errors.category ? 'is-invalid' : ''}`}
                            id="category"
                            name="category"
                            value={formik.values.category}
                            onChange={handleChange}
                            onBlur={formik.handleBlur}
                        >
                            <option value="">Select a category</option>
                            {categories && categories.map(category => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                        {formik.touched.category && formik.errors.category ? (
                            <small className="form-text text-danger">{formik.errors.category}</small>
                        ) : (
                            <small className="form-text text-muted"></small>
                        )}
                    </div>

                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="name" className="mb-2 text-muted">Product Name</label>
                        <input
                            type="text"
                            className={`form-control ${formik.touched.name && formik.errors.name ? 'is-invalid' : ''}`}
                            id="name"
                            name="name"
                            placeholder="Product name"
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
                        <label htmlFor="productImage" className="mb-2 text-muted">Product Image</label>
                        <input
                            type="file"
                            className={`form-control ${formik.touched.productImage && formik.errors.productImage ? 'is-invalid' : ''}`}
                            id="productImage"
                            name="productImage"
                            onChange={handleChange}
                            onBlur={formik.handleBlur}
                            ref={fileInputRef}
                        />
                        <button
                            type="button"
                            className="btn btn-primary mt-2"
                            onClick={() => setIsCameraOpen(true)}
                        >
                            Capture Image
                        </button>
                        {formik.touched.productImage && formik.errors.productImage && (
                            <small className="form-text text-danger">{formik.errors.productImage}</small>
                        )}
                        {isCameraOpen && (
                            <div className="camera-modal">
                                <video ref={videoRef} autoPlay playsInline className="w-100"></video>
                                <button
                                    type="button"
                                    className="btn btn-success mt-2"
                                    onClick={handleCapture}
                                >
                                    Capture
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger mt-2"
                                    onClick={() => setIsCameraOpen(false)}
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="price" className="mb-2 text-muted">Price</label>
                        <input
                            type="number"
                            className={`form-control ${formik.touched.price && formik.errors.price ? 'is-invalid' : ''}`}
                            id="price"
                            name="price"
                            placeholder="Product price"
                            value={formik.values.price}
                            onChange={handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.price && formik.errors.price ? (
                            <small className="form-text text-danger">{formik.errors.price}</small>
                        ) : (
                            <small className="form-text text-muted"></small>
                        )}
                    </div>

                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="size" className="mb-2 text-muted">Size</label>
                        <input
                            type="text"
                            className={`form-control ${formik.touched.size && formik.errors.size ? 'is-invalid' : ''}`}
                            id="size"
                            name="size"
                            placeholder="Product size"
                            value={formik.values.size}
                            onChange={handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.size && formik.errors.size ? (
                            <small className="form-text text-danger">{formik.errors.size}</small>
                        ) : (
                            <small className="form-text text-muted"></small>
                        )}
                    </div>

                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="productImage" className="mb-2 text-muted">Product Image</label>
                        <input
                            type="file"
                            className={`form-control ${formik.touched.productImage && formik.errors.productImage ? 'is-invalid' : ''}`}
                            id="productImage"
                            name="productImage"
                            onChange={handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.productImage && formik.errors.productImage ? (
                            <small className="form-text text-danger">{formik.errors.productImage}</small>
                        ) : (
                            <small className="form-text text-muted"></small>
                        )}
                    </div>

                    <div className="form-group col-md-6 mb-3">
                        <label htmlFor="remark" className="mb-2 text-muted">Remark</label>
                        <textarea
                            className="form-control"
                            id="remark"
                            name="remark"
                            placeholder="Additional remarks"
                            value={formik.values.remark}
                            onChange={handleChange}
                            onBlur={formik.handleBlur}
                        />
                    </div>

                    <button type="submit" className="btn btn-success w-25 btn-lg m-auto mt-5">Create Product</button>
                </form>
            </CCardBody>
        </CCard>
    );
};

export default CreateProduct;
