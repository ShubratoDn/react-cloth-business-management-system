import { CCard, CCardBody, CCardHeader } from '@coreui/react';
import { BASE_URL } from 'configs/axiosConfig';
import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom';
import { findPurchaseByIdAndPO } from 'services/purchaseServices';
import Page404 from 'views/pages/page404/Page404';

const ViewPurchaseDetails = ({ purchaseInfoFromViewPage }) => {
    const [isLoading, setLoading] = useState(true);
    const [message, setMessage] = useState({});


    const [purchase, setPurchase] = useState(null);
    const { id, poNumber } = useParams();


    useEffect(() => {
        setPurchase(purchaseInfoFromViewPage);
    }, [purchaseInfoFromViewPage, id, poNumber])


    useEffect(() => {
        setLoading(true)
        findPurchaseByIdAndPO(id, poNumber)
            .then((data) => {
                console.log(data)
                data && setPurchase(data)
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                setLoading(false)
            })
    }, [id, poNumber])


    return (
        <>
            {isLoading ? <div>Please Wait</div>
                :
                (purchase == null ? <Page404></Page404>
                    :

                    <CCard>
                        <CCardHeader className='d-flex justify-content-between'>
                            <h4>Purchase Details</h4> {purchaseInfoFromViewPage && <Link target='_blank' to={`/procurement/view-purchase-details/${purchase.id}/${purchase.poNumber}`} className='btn btn-info'>View in separate page</Link>}
                        </CCardHeader>
                        <CCardBody className='purchase-details-card-body'>
                            <table className="purchase-details-view-table table table-bordered table-striped">
                                <tbody>
                                    <tr>
                                        <th>Purchase Order</th>
                                        <td>{purchase.poNumber}</td>
                                    </tr>
                                    <tr>
                                        <th>Store</th>
                                        <td>
                                            <p><b>Name : </b>{purchase.store.storeName}</p>
                                            <p><b>Code:</b> {purchase.store.storeCode}</p>
                                            <p><b>Address:</b> {purchase.store.address}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Supplier</th>
                                        <td>
                                            <p><b>Name : </b>{purchase.supplier.name}</p>
                                            <p><b>Phone : </b>{purchase.supplier.phone}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Purchase Date</th>
                                        <td>
                                            {purchase.purchaseDate}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Total Amount</th>
                                        <td>
                                            {purchase.totalAmount} Taka
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Status</th>
                                        <td>
                                            {purchase.purchaseStatus}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>




                            <br></br>
                            <h4>Products Info</h4>

                            <table className="purchase-details-view-table table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>Size</th>
                                        <th>Category</th>
                                        <th>Unit Price</th>
                                        <th>Quantity</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {purchase.purchaseDetails && purchase.purchaseDetails.length > 0 ? (
                                        purchase.purchaseDetails.map((detail) => (
                                            <tr key={detail.id}>
                                                <td>{detail.id}</td>
                                                <td>
                                                    {detail.product.image ? (
                                                        <img src={BASE_URL+ detail.product.image} alt={detail.product.name} style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "50%", display:"block", margin:"0 auto" }}/>
                                                    ) : (
                                                        <span></span>
                                                    )}
                                                </td>
                                                <td>{detail.product.name}</td>
                                                <td>{detail.product.size}</td>
                                                <td>{detail.product.category ? detail.product.category.name : 'N/A'}</td>
                                                <td>{detail.price}</td>
                                                <td>{detail.quantity}</td>
                                                <td>{detail.price * detail.quantity}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center">No Products Found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </CCardBody>
                    </CCard>

                )}
        </>
    );
}

export default ViewPurchaseDetails
