import { CCard, CCardBody, CCardHeader } from '@coreui/react';
import { BASE_URL } from 'configs/axiosConfig';
import React, { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component';
import { toast } from 'react-toastify';
import { searchUsers } from 'services/userServices';

const FindUserComponent = ({ hasUpdatePermission, hasAssignRolePermission, title, onAssignRoleClick, hasAssignStorePermission }) => {



    const [query, setQuery] = useState('');
    const [isLoading, setLoading] = useState(false);
    const [message, setMessage] = useState({});
    const [content, setContent] = useState([]);
    const [data, setData] = useState(null);
    const [page, setPage] = useState(0);

    const handleSearch = (event) => {
        setQuery(event.target.value);
        setPage(0); // Reset to page 0 when a new search is performed
    };



    const getAllUsers = () => {
        setLoading(true);
        searchUsers(query, page, 10)
            .then((response) => {
                setData(response);
                if (page === 0) {
                    setContent(response.content);
                } else {
                    // Otherwise, append the new data
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
        getAllUsers();
    }, [page, query]); // Trigger the effect on page or query change

    const requestForData = () => {
        setPage((prevPage) => prevPage + 1);
    };

    return (
        <>
            <form>
                <div className="form-group mb-3">
                    <label className="mb-2 text-muted">Search User</label>
                    <div className='d-flex'>
                        <input
                            type="text"
                            name="query"
                            className='form-control me-3'
                            placeholder="Type queries for search user"
                            value={query}
                            onChange={handleSearch}
                            onKeyUp={handleSearch} // Debounced search could be more efficient here
                        />
                        <button type="button" className='btn btn-success'>Search</button>
                    </div>
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
                    <h4>{title ? title : "Search Results"}</h4>
                </CCardHeader>
                <CCardBody>
                    <InfiniteScroll
                        dataLength={content.length}
                        next={requestForData}
                        hasMore={data ? !data.last : true}
                        loader={<div className="border-0 loading">Loading...</div>}
                        endMessage={<div className="my-3 text-center text-muted">No more users to load.</div>}
                    >
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Image</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Phone</th>
                                    <th scope="col">Email</th>
                                    <th scope="col">Address</th>
                                    <th scope="col">Designation</th>
                                    <th scope="col">Status</th>
                                    {(hasUpdatePermission || hasAssignRolePermission || hasAssignStorePermission) && (
                                        <th scope="col">Action</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {content.length > 0 && (
                                    content.map((user, index) => (
                                        <tr key={user.id}>
                                            <td>{user.id}</td>
                                            <td><img src={BASE_URL + user.image} alt="Image" style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "50%" }} /></td>
                                            <td>{user.name}</td>
                                            <td>{user.phone}</td>
                                            <td>{user.email}</td>
                                            <td>{user.address}</td>
                                            <td>{user.designation}</td>
                                            <td>{user.isLocked ? 'Locked' : 'Active'}</td>
                                            {(hasUpdatePermission || hasAssignRolePermission || hasAssignStorePermission) && (
                                                <td>
                                                    {hasUpdatePermission && (
                                                        <button className="btn btn-primary btn-sm ms-2">Edit</button>
                                                    )}
                                                    {hasAssignRolePermission && (
                                                        <button className="btn btn-secondary btn-sm ms-2" onClick={() => onAssignRoleClick(user)}>Assign Role</button>
                                                    )}
                                                    {hasAssignStorePermission && (
                                                        <button className="btn btn-secondary btn-sm ms-2" onClick={() => onAssignRoleClick(user)}>Assign Store</button>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </InfiniteScroll>
                </CCardBody>
            </CCard>
        </>
    )
}

export default FindUserComponent
