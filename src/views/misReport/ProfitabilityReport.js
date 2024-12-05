import { CButton, CCard, CCardBody, CCardHeader, CFormLabel, CModal, CModalBody, CModalHeader } from '@coreui/react';
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { fetchAllStakeholder } from 'services/stakeholderServices';
import { getLoggedInUsersAssignedStore} from 'services/auth';
import { searchPurchase, searchTransaction } from 'services/purchaseServices';
import ViewPurchaseDetails from 'views/procurementManagement/ViewPurchaseDetails';
import ViewSaleDetails from 'views/salesManagement/ViewSaleDetails';
import { formatDate } from 'services/utils';
import CIcon from '@coreui/icons-react';
import { cilPrint } from '@coreui/icons';
import { downloadProfitabilityReport } from 'services/excelReportService';

const PurchaseHistory = () => {

    const [store, setStore] = useState(null);
    const [stakeholder, setStakeholder] = useState(null);
    const [status, setStatus] = useState('');    
    const [type, setType] = useState('');    
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const [isDownloading, setDownloading] = useState(false);

    const [storeOptions, setStoreOptions] = useState([]);
    const [stakeholderOptions, setStakeholderOptions] = useState([]);

    const [isLoading, setLoading] = useState(false);
    const [message, setMessage] = useState({});

    const [content, setContent] = useState([]);
    const [data, setData] = useState(null);
    const [page, setPage] = useState(0);


    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const handleViewClick = (details) => {
        setSelectedTransaction(details); // Set the selected purchase
        setModalVisible(true); // Show the modal
    };

    const handleSearch = (field, value) => {
        if (field === 'store') {
            setStore(value)
        }

        if (field === 'stakeholder') {
            setStakeholder(value)
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

        if (field === 'type') {
            setType(value);
        }

        setPage(0);
    };

    const getPurchaseDetails = () => {
        setLoading(true);
        setMessage({})
        let storeId = store && store.id;
        let stakeholderId = stakeholder && stakeholder.id;

        searchTransaction(storeId, stakeholderId, "", status, fromDate, toDate, type, page, 10, "transactionDate")
            .then((response) => {
                console.log(response);
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
        if (store) {
            getPurchaseDetails();
        }
    }, [page, store, stakeholder, fromDate, toDate, status, type]); // Trigger the effect on page or query change

    const requestForData = () => {
        setPage((prevPage) => prevPage + 1);
    };



    const handleDownloadExcel = async () => {
        setDownloading(true);

        let storeId = store && store.id;
        let stakeholderId = stakeholder && stakeholder.id;

        // setTimeout(()=>{
        //     setDownloading(false);
        // }, 2000)

        try {
            await downloadProfitabilityReport(storeId, stakeholderId, "", status, fromDate, toDate, type);
        } catch (error) {
            console.log(error)
            alert('Could not download the report. Please try again.');
        } finally {
            setDownloading(false);
        }
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
        setStakeholderOptions([])
        setStakeholder(null)
    }, [store])

    const fetchStakeholders = (option) => {
        fetchAllStakeholder(option.value)
            .then((data) => {
                if (data && data.length < 1) {
                    toast.error('No stakeholder found');
                } else {
                    const options = data.map((stakeholder) => ({
                        id: stakeholder.id,
                        value: stakeholder.id,
                        label: stakeholder.name + " - " + stakeholder.phone + ` \t\t(${stakeholder.stakeHolderType})`,
                    }));
                    setStakeholderOptions(options);
                }
            })
            .catch((err) => {
                setStakeholderOptions([]);

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


    return (
        <>
            <CCard>
                <CCardHeader>
                    <h3>Profitability Report Criteria</h3>
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
                                    fetchStakeholders(option);
                                }}
                                classNamePrefix="react-select"
                            />
                        </div>

                        {/* stakeholder Field */}
                        <div className="form-group col-md-6 mb-3">
                            <CFormLabel htmlFor="stakeholder">Stakeholder</CFormLabel>
                            <Select
                                isDisabled={!store}
                                id="stakeholder"
                                name="stakeholder"
                                options={stakeholderOptions}
                                value={stakeholder}
                                onChange={(option) => {
                                    handleSearch('stakeholder', option);
                                }}
                                isClearable={true}
                                classNamePrefix="react-select"
                            />
                        </div>


                        
                        <div className="form-group col-md-6 mb-3">
                            <CFormLabel htmlFor="stakeholder">From Date</CFormLabel>
                            <input
                                type="date"
                                className='form-control me-3'
                                placeholder="Enter From Date"
                                value={fromDate}
                                onChange={e => handleSearch('fromDate', e.target.value)}
                            />
                        </div>


                        <div className="form-group col-md-6 mb-3">
                            <CFormLabel htmlFor="stakeholder">To Date</CFormLabel>
                            <input
                                type="date"
                                className='form-control me-3'
                                placeholder="Enter To Date"
                                value={toDate}
                                onChange={e => handleSearch('toDate', e.target.value)}
                            />
                        </div>


                        <div className="form-group col-md-6 mb-3">
                            <CFormLabel htmlFor="status">Status</CFormLabel>
                            <select
                                id="status"
                                className='form-control me-3'
                                // multiple
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
                            <CFormLabel htmlFor="type">Transaction Type</CFormLabel>
                            <select
                                id="type"
                                className='form-control me-3'
                                // multiple
                                value={type}
                                onChange={e => handleSearch('type', e.target.value)}
                            >
                                <option value=""> -- Select Type --</option>
                                <option value="SALE">SALE</option>
                                <option value="PURCHASE">PURCHASE</option>
                            </select>
                        </div>


                        <div className="form-group col-12">
                            <button type='button' className='btn btn-primary' onClick={() => store ? getPurchaseDetails() : setMessage({ error: "Select any store first" })}>Search</button>
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
                    <div className='d-flex justify-content-between'>
                        <h4>{"Transaction Details based on search criteria"}</h4> 
                        {data && data.totalElements > 0 && 
                                        <button className='btn btn-success d-flex justify-content-center align-items-center' onClick={handleDownloadExcel} disabled={isDownloading}>
                                            <CIcon icon={cilPrint}></CIcon> &nbsp;
                                            {isDownloading ? 'Downloading...' : 'PDF'}
                                        </button> 
                        }
                    </div>
                    {data && data.totalElements > 0 && <h6 className='text-muted'>Total Item found : {data.totalElements}</h6>}
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
                                    <th>PO Number</th>
                                    <th>Type</th>
                                    <th scope="col">Store</th>
                                    <th scope="col">stakeholder</th>
                                    <th scope="col">Purchase Date</th>
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
                                            <td>{formatDate(details.transactionDate)}</td>
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
                    <h5>Transaction Details</h5>
                </CModalHeader>
                <CModalBody>
                    {/* Pass the selectedTransaction as props to ViewPurchaseDetails */}
                    {selectedTransaction && selectedTransaction.transactionType === "PURCHASE" ? <ViewPurchaseDetails purchaseInfoFromViewPage={selectedTransaction} /> : <ViewSaleDetails saleInfoFromViewPage={selectedTransaction} />}
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

export default PurchaseHistory