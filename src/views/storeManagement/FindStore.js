import FindStoreComponent from 'components/store/FindStoreComponent'
import React from 'react'
import { userHasRole } from 'services/auth'

const FindStore = () => {
    return (
        <div>
            <FindStoreComponent 
                hasUpdatePermission={userHasRole("ROLE_STORE_UPDATE")}
            />
        </div>
    )
}

export default FindStore
