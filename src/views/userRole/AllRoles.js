import { CCard, CCardBody, CCardHeader } from '@coreui/react'
import React, { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component';
import { toast } from 'react-toastify'
import { searchRoles, updateRoleStatus } from 'services/userRoleService';

const AllRoles = () => {
    const [query, setQuery] = useState('');
    const [isLoading, setLoading] = useState(false);
    const [message, setMessage] = useState({});
    const [content, setContent] = useState([]);
    const [data, setData] = useState(null);
    const [page, setPage] = useState(0);

    const getAllRoles = () => {
        setLoading(true);
        searchRoles(query, page, 10)
            .then((response) => {
                setData(response);
                if (page === 0) {
                    // If it's a new search, replace the content
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

                const errMessages = err.response.data.error;
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
        getAllRoles();
    }, [page, query]); // Trigger the effect on page or query change

    const requestForData = () => {
        setPage((prevPage) => prevPage + 1);
    };

    const handleSearch = (event) => {
        setQuery(event.target.value);
        setPage(0); // Reset to page 0 when a new search is performed
    };







    const handleStatusUpdate = (id) => {
        updateRoleStatus(id)
            .then(() => {
                // Update the role status locally to reflect the change
                setContent(prevContent =>
                    prevContent.map(role =>
                        role.id === id ? { ...role, isActive: !role.isActive } : role
                    )
                );
                toast.success('Role status updated successfully!', {
                    position: "bottom-center",
                    theme: "dark",
                });
            })
            .catch(() => {
                toast.error('Failed to update role status. Please try again later.', {
                    position: "bottom-center",
                    theme: "dark",
                });
            });
    };



    return (
        <div>
            <form>
                <div className="form-group mb-3">
                    <label className="mb-2 text-muted">Search Query</label>
                    <div className='d-flex'>
                        <input
                            type="text"
                            name="query"
                            className='form-control me-3'
                            placeholder="Type queries for search role"
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
                    <h4>Search Results</h4>
                </CCardHeader>
                <CCardBody>
                    <InfiniteScroll
                        dataLength={content.length}
                        next={requestForData}
                        hasMore={data ? !data.last : true}
                        loader={<div className="border-0 loading">Loading...</div>}
                        endMessage={<div className="my-3 text-center text-muted">No more roles to load.</div>}
                    >
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    {/* <th scope="col">ID</th> */}
                                    <th scope="col">Role</th>
                                    <th scope="col">Title</th>
                                    <th scope="col">Category</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {content.length > 0 && (
                                    content.map((role) => (
                                        <tr key={role.id}>
                                            <td>R{role.id}</td>
                                            <td>{role.role}</td>
                                            <td>{role.title}</td>
                                            <td>{role.category}</td>
                                            <td>{role.isActive ? 'Active' : 'Inactive'}</td>
                                            <td>
                                                <button className="btn btn-primary btn-sm">Edit</button>
                                                {
                                                    role.isActive ?
                                                        <button
                                                            className="btn btn-danger btn-sm ms-2"
                                                            onClick={() => handleStatusUpdate(role.id)}
                                                        >
                                                            Deactivate
                                                        </button>
                                                        :
                                                        <button
                                                            className="btn btn-success btn-sm ms-2"
                                                            onClick={() => handleStatusUpdate(role.id)}
                                                        >
                                                            Activate
                                                        </button>
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
        </div>
    )
}

export default AllRoles;
