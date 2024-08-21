import React from 'react'
import FindStoreComponent from './FindStoreComponent'

const AssignStoreComponent = ({ user, onBackButtonClick }) => {
    return (
        <div>
            <h1>
                Assigning Store for <span style={{ color: "green", fontWeight: "bold" }}> {user.name}</span>
                <button className='btn btn-info' onClick={() => onBackButtonClick(true)}>Back</button>
            </h1>

            <FindStoreComponent></FindStoreComponent>

        </div>
    )
}

export default AssignStoreComponent
