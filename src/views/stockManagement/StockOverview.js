import { CCard, CCardBody, CCardHeader, CFormLabel } from '@coreui/react';
import { BASE_URL } from 'configs/axiosConfig';
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { getLoggedInUsersAssignedStore } from 'services/auth';
import { getAllProductList, searchProducts } from 'services/productServices';
import { stockOverview } from 'services/stockServices';

const StockOverview = () => {
    const [query, setQuery] = useState('');
    const [isLoading, setLoading] = useState(false);
    const [message, setMessage] = useState({});
    const [content, setContent] = useState([]);
    const [data, setData] = useState(null);
    const [page, setPage] = useState(0);

    const [storeOptions, setStoreOptions] = useState([]);
    const [store, setStore] = useState("");

    const [productOptions, setProductOptions] = useState([]);
    const [product, setProduct] = useState("");


    useEffect(() => {
        const options = getLoggedInUsersAssignedStore().map((store) => ({
            id: store.id,
            value: store.id,
            label: store.storeName
                ? `${store.storeName} (${store.storeCode})`
                : store.storeCode,
        }));
        setStoreOptions(options);

        getAllProductList().
            then((resp)=>{
                const productOptions = resp.map((product) => ({
                    id: product.id,
                    value: product.id,
                    label: `${product.name} - ${product.size} (${product.category.name})`
                }));
                setProductOptions(productOptions);
            })
            .catch((err)=>{
                console.error(err)
            })

    }, []);


    const getStockOverviewData = () => {
        setLoading(true);
        stockOverview((store ? store.id : ""), (product ? product.id : ""), query, page, 10)
            .then((response) => {
                setData(response);
                if (page === 0) {
                    setContent(response.content);
                } else {
                    setContent((prevContent) => [...prevContent, ...response.content]);
                }
            })
            .catch((err) => {
                if (err.code === 'ERR_NETWORK') {
                    toast.error('Network error!! Failed to connect with server. \n Contact with Shubrato', {
                        position: "bottom-center",
                        theme: "dark",
                    });
                    return;
                }

                const errMessages = err.response.data.message;
                setMessage({ error: errMessages });

                toast.error(`${errMessages}`, {
                    position: "bottom-center",
                    theme: "dark",
                });
            })
            .finally(() => {
                setTimeout(() => {
                    setLoading(false);
                }, 1000);
            });
    };

    useEffect(() => {
        getStockOverviewData();
        setPage(0);
    }, [page, query, store, product]); // Trigger the effect on page or query change

    const requestForData = () => {
        setPage((prevPage) => prevPage + 1);
    };




    return (
        <>
            <form>
                <div className="form-group mb-3">
                    <h3 className="mb-2 text-muted">Stock Overview</h3>
                    <div className='d-flex'>
                        <div className="form-group col-sm-6 mb-3 pe-2">
                            <CFormLabel htmlFor="store">Store</CFormLabel>
                            <Select
                                id="store"
                                name="store"
                                options={storeOptions}
                                value={store}
                                onChange={(option) => {
                                    setStore(option)
                                }}
                                classNamePrefix="react-select"
                                isClearable
                            />
                        </div>

                        <div className="form-group col-sm-6 mb-3 ps-2">
                            <CFormLabel htmlFor="store">Product</CFormLabel>
                            <Select
                                id="product"
                                options={productOptions}
                                value={product}
                                onChange={(option) => {
                                    setProduct(option)
                                }}
                                classNamePrefix="react-select"
                                isClearable 
                            />
                        </div>
                    </div>
                    <button type="button" className='btn btn-success'>Search</button>
                </div>
            </form>

            {/* LOADER AND SERVER MESSAGE */}
            {(message.error || message.success) &&
                <div className='p-2'>
                    <div className={message.error ? "alert alert-danger mt-3" : "alert alert-success mt-3"} role="alert">
                        {message.error}
                        {message.success}
                    </div>
                </div>
            }

            <CCard>
                <CCardHeader>
                    <h4>{"Stock info"}</h4>
                </CCardHeader>
                <CCardBody>
                    <InfiniteScroll
                        dataLength={content.length}
                        next={requestForData}
                        hasMore={data ? !data.last : true}
                        loader={<div className="border-0 loading">Loading...</div>}
                        endMessage={<div className="my-3 text-center text-muted">No more stores to load.</div>}
                    >
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Product Name</th>
                                    <th scope="col">Category</th>
                                    <th scope="col">Size</th>
                                    <th scope="col">Total Quantity</th>
                                    <th scope="col">Store info</th>
                                </tr>
                            </thead>
                            <tbody>
                                {content.length > 0 && (
                                    content.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{item.product.id}</td>
                                                <td>{item.product.name}</td>
                                                <td>{item.product.category.name}</td>
                                                <td>{item.product.size}</td>
                                                <td><b>{item.totalQuantity}</b></td>
                                                <td>
                                                    {item.store.storeName} ({item.store.storeCode})
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </InfiniteScroll>
                </CCardBody>
            </CCard>
        </>
    );
}

export default StockOverview
