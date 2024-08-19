import FindUserComponent from 'components/user/FindUserComponent'
import React, { useState } from 'react'
import { userHasRole } from 'services/auth'

const FindUser = () => {
    return (
        <div>
             <FindUserComponent 
                hasUpdatePermission={userHasRole("ROLE_USER_UPDATE")} 
            />
        </div>
    )
}

export default FindUser
