
//for setting user data
export const doLogin = (data, next) => {
    localStorage.setItem("data", JSON.stringify(data));
    next();
}


//for logout
/** EI CODE TA USE KORLE navigate() eta kaj kortesilo na  */
export const doLogout = () =>{
    localStorage.removeItem("data");
}

// const nav = useNavigate();
// export const doLogout = () => {
//     localStorage.removeItem("data");
//     // window.location.href = "/home";
//     return new Promise((resolve, reject) => {
//         resolve();
//     });
// };



//check if login or not
export const isUserLoggedIn = () => {
    let data = localStorage.getItem("data");
    if (data != null) {
        return true;
    } else {
        return false;
    }
}


//get current user info
export const getCurrentUserInfo = () => {
    if (isUserLoggedIn()) {
        let data = JSON.parse(localStorage.getItem("data")).user;
        return data;
    } else {
        return null;
    }
}


export const getToken = () => {
    if (isUserLoggedIn()) {
        let data = JSON.parse(localStorage.getItem("data")).token;
        return data;
    } else {
        return null;
    }
}

export const getLoggedInUsersRole = ()=>{
    if (getCurrentUserInfo()){
        return getCurrentUserInfo().roles;
    }else{
        return null;
    }
}


export const getLoggedInUsersAssignedStore = ()=>{
    if (getCurrentUserInfo()){
        return getCurrentUserInfo().assignedStore;
    }else{
        return null;
    }
}



export const userHasRole = (roleString)=>{
    let rolesArray = getLoggedInUsersRole();
    if (rolesArray.some(role => role.role === "ROLE_ADMIN")){
        return true;
    }
    return rolesArray.some(role => role.role === roleString);
    // return true;
}


