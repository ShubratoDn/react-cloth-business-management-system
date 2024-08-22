import React, { useState } from 'react'
import FindStoreComponent from './FindStoreComponent'
import { getLoggedInUsersAssignedStore, getLoggedInUsersRole } from 'services/auth'

const AssignStoreComponent = ({ user, onBackButtonClick }) => {

    const [userAssignedStores, setUserAssignedStores] = useState(user.assignedStore);

    return (
        <div className='card'>
            <h1 className='card-header d-flex justify-content-between'>
                <span> Assigning Store for <span style={{ color: "#6d6f6d", fontWeight: "bold" }}> {user.name}</span></span>
                <button className='btn btn-info' onClick={() => onBackButtonClick(true)}>Back</button>
            </h1>

            <div className="card-body">
                <FindStoreComponent userAssignedStores={userAssignedStores} isAssigningStore={true} user={user} setUserAssignedStores={setUserAssignedStores}></FindStoreComponent>
            </div>

        </div>
    )
}

export default AssignStoreComponent
