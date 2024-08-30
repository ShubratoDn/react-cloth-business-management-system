import React, { useState, useEffect, useRef } from 'react';
import { CCard, CCardBody, CCardHeader } from '@coreui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { createProduct, getAllProductCategories } from '../../services/productServices';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateProduct = () => {
    const [categorySuggestions, setCategorySuggestions] = useState([]); // State for categorySuggestions
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


    const formik = useFormik({
        initialValues: {
            productCategory: '',
            name: '',
            size: '',
            productImage: null,
            remark: '',
        },
        validationSchema: Yup.object({
            productCategory: Yup.string().required('Category is required'),
            name: Yup.string()
                .required('Product name is required')
                .min(3, 'Product name should be at least 3 characters'),
            size: Yup.string().required('Size is required'),
            productImage: Yup.mixed()
                .notRequired()
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
            const { name, value } = event.target;
            formik.handleChange(event);

            if (name === 'productCategory' && value.length >= 1) { // Fetch categorySuggestions if 2 or more characters
                getAllProductCategories(value)
                    .then(response => {
                        setCategorySuggestions(response);
                    })
                    .catch(err => {
                        console.error('Failed to fetch categorySuggestions:', err);

                        toast.error('Failed to load categories.', { theme: "dark" });
                    });
            } else {
                setCategorySuggestions([]); // Clear categorySuggestions if less than 2 characters
            }
        }
    };

    const handleSuggestionClick = (suggestion) => {
        formik.setFieldValue('productCategory', suggestion.name);
        setCategorySuggestions([]); // Clear categorySuggestions after selection
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
                    {/* {imagePreview && (
                        <div className="image-preview mb-3">
                            <img src={imagePreview} alt="Image preview" className="img-fluid" />
                        </div>
                    )} */}

                    <div className="form-group col-md-6 mb-3 position-relative">
                        <label htmlFor="productCategory" className="mb-2 text-muted">Category</label>
                        <input type='text'
                            className={`form-control ${formik.touched.productCategory && formik.errors.productCategory ? 'is-invalid' : ''}`}
                            id="productCategory"
                            name="productCategory"
                            value={formik.values.productCategory}
                            onChange={handleChange}
                            placeholder='Product category here'
                        />
                        {categorySuggestions.length > 0 && (
                            <ul className="list-group position-absolute" style={{width:"94.5%"}}>
                                {categorySuggestions.map((suggestion) => (
                                    <li key={suggestion.id} className="list-group-item list-group-item-action" onClick={() => handleSuggestionClick(suggestion)}>
                                        {suggestion.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {formik.touched.productCategory && formik.errors.productCategory && (
                            <small className="form-text text-danger">{formik.errors.productCategory}</small>
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
                        {formik.touched.name && formik.errors.name && (
                            <small className="form-text text-danger">{formik.errors.name}</small>
                        )}
                    </div>

                    {/* <div className="form-group col-md-6 mb-3">
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
                    </div> */}

                    

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
