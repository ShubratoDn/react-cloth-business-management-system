import { CButton, CCard, CCardBody, CCardHeader, CFormLabel, CModal, CModalBody, CModalHeader } from '@coreui/react';
import { BASE_URL } from 'configs/axiosConfig';
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { fetchCustomersByStoreId, fetchSuppliersByStoreId } from 'services/stakeholderServices';
import { getCurrentUserInfo, getLoggedInUsersAssignedStore, userHasRole } from 'services/auth';
import { searchPurchase } from 'services/purchaseServices';
import ViewSaleDetails from './ViewSaleDetails';
import { Link } from 'react-router-dom';
import { searchSale } from 'services/saleServices';

const SaleHistory = () => {

    const [store, setStore] = useState(null);
    const [customer, setSupplier] = useState(null);
    const [soNumber, setPoNumber] = useState('');
    const [status, setStatus] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');


    const [storeOptions, setStoreOptions] = useState([]);
    const [supplierOptions, setSupplierOptions] = useState([]);

    const [isLoading, setLoading] = useState(false);
    const [message, setMessage] = useState({});
    const [content, setContent] = useState([]);
    const [data, setData] = useState(null);
    const [page, setPage] = useState(0);


    const [modalVisible, setModalVisible] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);

    const handleViewClick = (details) => {
        setSelectedSale(details); // Set the selected purchase
        setModalVisible(true); // Show the modal
    };

    const handleSearch = (field, value) => {
        if (field === 'store') {
            setStore(value)
        }

        if (field === 'customer') {
            setSupplier(value)
        }

        if (field === 'soNumber') {
            setPoNumber(value)
        }

        if (field === 'fromDate') {
            setFromDate(value)
        }

        if (field === 'toDate') {
            setToDate(value)
        }

        if (field === 'status') {
            setStatus(value);
        }
        setPage(0);
    };

    const getPurchaseDetails = () => {
        setLoading(true);
        setMessage({})
        let storeId = store && store.id;
        let supplierId = customer && customer.id;

        searchSale(storeId, supplierId, soNumber, status, fromDate, toDate, page, 10)
            .then((response) => {
                setData(response);
                if (page === 0) {
                    setContent(response.content);
                } else {
                    // Otherwise, append the new data
                    content && setContent((prevContent) => [...prevContent, ...response.content]);
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
        if (store || soNumber) {
            getPurchaseDetails();
        }
    }, [page, store, customer, soNumber, fromDate, toDate, status]); // Trigger the effect on page or query change

    const requestForData = () => {
        setPage((prevPage) => prevPage + 1);
    };




    // UPDATE CODE...
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

    useEffect(() => {
        setSupplierOptions({})
        setSupplier(null)
    }, [store])

    const fetchSuppliers = (option) => {
        fetchCustomersByStoreId(option.value)
            .then((data) => {
                if (data && data.length < 1) {
                    toast.error('No customer found');
                } else {
                    const options = data.map((customer) => ({
                        id: customer.id,
                        value: customer.id,
                        label: customer.name + " - " + customer.phone,
                    }));
                    setSupplierOptions(options);
                }
            })
            .catch((err) => {
                setSupplierOptions([]);

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



    const isPOEditabel = (details) => {
        let status = details.transactionStatus
        if (status === "OPEN" || status === "REJECTED") {
            if ((getCurrentUserInfo().id === details.processedBy.id) || userHasRole("ROLE_PURCHASE_UPDATE")) {
                return true;
            }
        }
    }




    return (
        <>
            <CCard>
                <CCardHeader>
                    <h3>Search Sale Details</h3>
                </CCardHeader>
                <CCardBody>
                    <form className='row'>
                        <div className="form-group col-md-6 mb-3">
                            <CFormLabel htmlFor="store">Store</CFormLabel>
                            <Select
                                id="store"
                                name="store"
                                options={storeOptions}
                                value={store}
                                onChange={(option) => {
                                    handleSearch('store', option);
                                    fetchSuppliers(option);
                                }}
                                classNamePrefix="react-select"
                            />
                        </div>

                        {/* Customer Field */}
                        <div className="form-group col-md-6 mb-3">
                            <CFormLabel htmlFor="customer">Customer</CFormLabel>
                            <Select
                                isDisabled={!store} // Disable if store is not selected
                                id="customer"
                                name="customer"
                                options={supplierOptions}
                                value={customer}
                                onChange={(option) => {
                                    handleSearch('customer', option);
                                }}
                                classNamePrefix="react-select"
                            />
                        </div>



                        <div className="form-group col-md-6 mb-3">
                            <CFormLabel htmlFor="customer"> SO number</CFormLabel>
                            <input
                                type="text"
                                className='form-control me-3'
                                placeholder="Enter  SO number"
                                value={soNumber}
                                onChange={e => handleSearch('soNumber', e.target.value)}
                                onKeyUp={e => handleSearch('soNumber', e.target.value)}
                            />
                        </div>


                        <div className="form-group col-md-6 mb-3">
                            <CFormLabel htmlFor="status">Status</CFormLabel>
                            <select
                                id="status"
                                className='form-control me-3'
                                value={status}
                                onChange={e => handleSearch('status', e.target.value)}
                            >
                                <option value=""> -- Select Status --</option>
                                <option value="OPEN">OPEN</option>
                                <option value="SUBMITTED">SUBMITTED</option>
                                <option value="APPROVED">APPROVED</option>
                                <option value="REJECTED">REJECTED</option>
                                <option value="REJECTED_MODIFIED">REJECTED_MODIFIED</option>
                                <option value="CLOSED">CLOSED</option>
                            </select>
                        </div>


                        <div className="form-group col-md-6 mb-3">
                            <CFormLabel htmlFor="customer">From Date</CFormLabel>
                            <input
                                type="date"
                                className='form-control me-3'
                                placeholder="Enter From Date"
                                value={fromDate}
                                onChange={e => handleSearch('fromDate', e.target.value)}
                            />
                        </div>


                        <div className="form-group col-md-6 mb-3">
                            <CFormLabel htmlFor="customer">To Date</CFormLabel>
                            <input
                                type="date"
                                className='form-control me-3'
                                placeholder="Enter To Date"
                                value={toDate}
                                onChange={e => handleSearch('toDate', e.target.value)}
                            />
                        </div>

                        <div className="form-group col-12">
                            <button type='button' className='btn btn-primary' onClick={() => (store || soNumber) ? getPurchaseDetails() : setMessage({ error: "Select any store first" })}>Search</button>
                        </div>
                    </form>
                </CCardBody>
            </CCard>

            {/* LOADER AND SERVER MESSAGE */}
            {(message.error || message.success) &&
                <div className='p-2'>
                    <div className={message.error ? "alert alert-danger mt-3" : "alert alert-success mt-3"} role="alert">
                        {message.error}
                        {message.success}
                    </div>
                </div>
            }

            <br />

            <CCard>
                <CCardHeader>
                    <h4>{"Sale Details"}</h4>
                </CCardHeader>
                <CCardBody>
                    <InfiniteScroll
                        dataLength={content && content.length}
                        next={requestForData}
                        hasMore={data ? !data.last : true}
                        loader={content ? "Insert any search Criteria" : <div className="border-0 loading">Loading...</div>}
                        endMessage={<div className="my-3 text-center text-muted">No more details to load.</div>}
                    >
                        <table className="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th> SO Number</th>
                                    <th> Type</th>
                                    <th scope="col">Store</th>
                                    <th scope="col">Customer</th>
                                    <th scope="col">Sale Date</th>
                                    <th scope="col">Amount</th>
                                    <th scope="col">Created by</th>
                                    <th scope="col">Status</th>
                                    <th scope='col'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {content && content.length > 0 && (
                                    content.map((details) => (
                                        <tr key={details.id}>
                                            <td>{details.id}</td>
                                            <td>{details.transactionNumber && details.transactionNumber}</td>
                                            <td>{details.transactionType}</td>
                                            <td>{details.store.storeName}</td>
                                            <td>{details.partner.name}</td>
                                            <td>{details.transactionDate}</td>
                                            <td>{details.totalAmount}</td>
                                            <td>{details.processedBy.name}</td>
                                            <td>{details.transactionStatus}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-sm me-2"
                                                    onClick={() => handleViewClick(details)}
                                                >
                                                    View
                                                </button>

                                                {
                                                    isPOEditabel(details) && 
                                                    <Link to={`/procurement/edit-sale-details/${details.id}/${details.transactionNumber}`} className="btn btn-success btn-sm">Edit </Link>
                                                }
                                                
                                                {
                                                    (details.transactionStatus !== "OPEN" && details.transactionStatus !== "REJECTED") &&<Link to={`/procurement/update-sale-status/${details.id}/${details.transactionNumber}`} className="btn btn-success btn-sm">Update Status </Link>
                                                }
                                                
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </InfiniteScroll>
                </CCardBody>
            </CCard>


            {/* Modal for viewing purchase details */}
            <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size='lg'>
                <CModalHeader closeButton>
                    <h5>Sale Details</h5>
                </CModalHeader>
                <CModalBody>
                    {/* Pass the selectedSale as props to ViewSaleDetails */}
                    {selectedSale && <ViewSaleDetails saleInfoFromViewPage={selectedSale} />}
                </CModalBody>
                <div className="modal-footer">
                    <CButton color="secondary" onClick={() => setModalVisible(false)}>
                        Close
                    </CButton>
                </div>
            </CModal>
        </>
    );
}

export default SaleHistory