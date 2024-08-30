import React from 'react'
import CIcon from '@coreui/icons-react'
import {
    cilBasket,
    cilBell,
    cilBuilding,
    cilCalculator,
    cilChartPie,
    cilCursor,
    cilDescription,
    cilDrop,
    cilLan,
    cilLockLocked,
    cilNotes,
    cilPencil,
    cilPuzzle,
    cilSpeedometer,
    cilStar,
    cilUser,
    cilUserPlus,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
    {
        component: CNavItem,
        name: 'Dashboard',
        to: '/dashboard',
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
        badge: {
            color: 'success',
            text: 'NEW',
        },
    },



    // USER MANAGEMENT CODES STARTS
    {
        component: CNavTitle,
        name: 'User Management',
    },
    {
        component: CNavGroup,
        name: 'Manage User',
        to: '/user',
        icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
        roleRequired: ["ROLE_USER_CREATE","ROLE_USER_GET"],
        items: [
            {
                component: CNavItem,
                name: 'Add user',
                to: '/user/add',
                roleRequired: "ROLE_USER_CREATE"
            },
            {
                component: CNavItem,
                name: 'Find Users',
                to: '/user/all',
                roleRequired: "ROLE_USER_GET"
            },
        ]
    },    
    {
        component: CNavGroup,
        name: 'Manage Role',
        to: '/user',
        icon: <CIcon icon={cilLockLocked} customClassName="nav-icon" />,
        roleRequired: ["ROLE_ROLE_CREATE","ROLE_ROLE_GET"],
        items: [
            {
                component: CNavItem,
                name: 'Add Role',
                to: '/role/add',
                roleRequired: "ROLE_ROLE_CREATE"
            },
            {
                component: CNavItem,
                name: 'Find Roles',
                to: '/role/all',
                roleRequired:"ROLE_ROLE_GET"
            },
            {
                component: CNavItem,
                name: 'Assign Role',
                to: '/role/assign',
                roleRequired: "ROLE_ROLE_ASSIGN"
            },
        ]
    },
    // USER MANAGEMENT JSON ENDS
    




    //STORE MANAGEMENT
    {
        component: CNavTitle,
        isTitle: true,
        name: 'Store Management',        
        roleRequired: ["ROLE_STORE_CREATE", "ROLE_STORE_GET", "ROLE_STORE_UPDATE",'ROLE_STORE_ASSIGN'],
    },
    {
        component: CNavGroup,
        name: 'Manage Store',
        to: '/store',
        icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
        roleRequired: ["ROLE_STORE_CREATE", "ROLE_STORE_GET", "ROLE_STORE_UPDATE",'ROLE_STORE_ASSIGN'],
        items: [
            {
                component: CNavItem,
                name: 'Add Store',
                to: '/store/add',
                roleRequired: "ROLE_STORE_CREATE"
            },
            {
                component: CNavItem,
                name: 'Find Stores',
                to: '/store/all',
                roleRequired: "ROLE_STORE_GET"
            },
            {
                component: CNavItem,
                name: 'Assign Store',
                to: '/store/assign',
                roleRequired: "ROLE_STORE_ASSIGN"
            },
        ]
    },
    //STORE MANAGEMENT





    //PRODUCT MANAGEMENT
    {
        component: CNavTitle,
        isTitle: true,
        name: 'Product Management',
        // roleRequired: ["ROLE_PRODUCT_CREATE", "ROLE_PRODUCT_GET", "ROLE_PRODUCT_UPDATE", ],
    },
    {
        component: CNavGroup,
        name: 'Products',
        to: '/products',
        icon: <CIcon icon={cilBasket} customClassName="nav-icon" />,
        // roleRequired: ["ROLE_PRODUCT_CREATE", "ROLE_PRODUCT_GET", "ROLE_PRODUCT_UPDATE", ],
        items: [
            {
                component: CNavItem,
                name: 'Add Product',
                to: '/product/add',
                roleRequired: "ROLE_PRODUCT_CREATE"
            },
            {
                component: CNavItem,
                name: 'Find Products',
                to: '/product/all',
                // roleRequired: "ROLE_PRODUCT_GET"
            },            
        ]
    },
    //PRODUCT MANAGEMENT



    //stakeholder management
    {
        component: CNavTitle,
        isTitle: true,
        name: 'Stakeholder',
        roleRequired: ["ROLE_STAKEHOLDER_CREATE", "ROLE_STAKEHOLDER_GET", "ROLE_STAKEHOLDER_UPDATE", ],
    },
    {
        component: CNavGroup,
        name: 'Stakeholders',
        to: '/products',
        icon: <CIcon icon={cilLan} customClassName="nav-icon" />,
        roleRequired: ["ROLE_STAKEHOLDER_CREATE", "ROLE_STAKEHOLDER_GET", "ROLE_STAKEHOLDER_UPDATE", ],
        items: [
            {
                component: CNavItem,
                name: 'Add Stakeholder',
                to: '/stakeholder/add',
                roleRequired: "ROLE_STAKEHOLDER_CREATE"
            },
            {
                component: CNavItem,
                name: 'Find Stakeholders',
                to: '/stakeholder/find',
                roleRequired: "ROLE_STAKEHOLDER_GET"
            },            
        ]
    },
    //STAKEHOLDER MANAGEMENT ENDS



    	
    {
        component: CNavTitle,
        name: 'Theme',
    },
    {
        component: CNavItem,
        name: 'Colors',
        to: '/theme/colors',
        icon: <CIcon icon={cilDrop} customClassName="nav-icon" />,
    },
    {
        component: CNavItem,
        name: 'Typography',
        to: '/theme/typography',
        icon: <CIcon icon={cilPencil} customClassName="nav-icon" />,
    },
    {
        component: CNavTitle,
        name: 'Components',
    },
    {
        component: CNavGroup,
        name: 'Base',
        to: '/base',
        icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
        items: [
            {
                component: CNavItem,
                name: 'Accordion',
                to: '/base/accordion',
            },
            {
                component: CNavItem,
                name: 'Breadcrumb',
                to: '/base/breadcrumbs',
            },
            {
                component: CNavItem,
                name: 'Cards',
                to: '/base/cards',
            },
            {
                component: CNavItem,
                name: 'Carousel',
                to: '/base/carousels',
            },
            {
                component: CNavItem,
                name: 'Collapse',
                to: '/base/collapses',
            },
            {
                component: CNavItem,
                name: 'List group',
                to: '/base/list-groups',
            },
            {
                component: CNavItem,
                name: 'Navs & Tabs',
                to: '/base/navs',
            },
            {
                component: CNavItem,
                name: 'Pagination',
                to: '/base/paginations',
            },
            {
                component: CNavItem,
                name: 'Placeholders',
                to: '/base/placeholders',
            },
            {
                component: CNavItem,
                name: 'Popovers',
                to: '/base/popovers',
            },
            {
                component: CNavItem,
                name: 'Progress',
                to: '/base/progress',
            },
            {
                component: CNavItem,
                name: 'Spinners',
                to: '/base/spinners',
            },
            {
                component: CNavItem,
                name: 'Tables',
                to: '/base/tables',
            },
            {
                component: CNavItem,
                name: 'Tabs',
                to: '/base/tabs',
            },
            {
                component: CNavItem,
                name: 'Tooltips',
                to: '/base/tooltips',
            },
        ],
    },
    {
        component: CNavGroup,
        name: 'Buttons',
        to: '/buttons',
        icon: <CIcon icon={cilCursor} customClassName="nav-icon" />,
        items: [
            {
                component: CNavItem,
                name: 'Buttons',
                to: '/buttons/buttons',
            },
            {
                component: CNavItem,
                name: 'Buttons groups',
                to: '/buttons/button-groups',
            },
            {
                component: CNavItem,
                name: 'Dropdowns',
                to: '/buttons/dropdowns',
            },
        ],
    },
    {
        component: CNavGroup,
        name: 'Forms',
        icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
        items: [
            {
                component: CNavItem,
                name: 'Form Control',
                to: '/forms/form-control',
            },
            {
                component: CNavItem,
                name: 'Select',
                to: '/forms/select',
            },
            {
                component: CNavItem,
                name: 'Checks & Radios',
                to: '/forms/checks-radios',
            },
            {
                component: CNavItem,
                name: 'Range',
                to: '/forms/range',
            },
            {
                component: CNavItem,
                name: 'Input Group',
                to: '/forms/input-group',
            },
            {
                component: CNavItem,
                name: 'Floating Labels',
                to: '/forms/floating-labels',
            },
            {
                component: CNavItem,
                name: 'Layout',
                to: '/forms/layout',
            },
            {
                component: CNavItem,
                name: 'Validation',
                to: '/forms/validation',
            },
        ],
    },
    {
        component: CNavItem,
        name: 'Charts',
        to: '/charts',
        icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
    },
    {
        component: CNavGroup,
        name: 'Icons',
        icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
        items: [
            {
                component: CNavItem,
                name: 'CoreUI Free',
                to: '/icons/coreui-icons',
                badge: {
                    color: 'success',
                    text: 'NEW',
                },
            },
            {
                component: CNavItem,
                name: 'CoreUI Flags',
                to: '/icons/flags',
            },
            {
                component: CNavItem,
                name: 'CoreUI Brands',
                to: '/icons/brands',
            },
        ],
    },
    {
        component: CNavGroup,
        name: 'Notifications',
        icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
        items: [
            {
                component: CNavItem,
                name: 'Alerts',
                to: '/notifications/alerts',
            },
            {
                component: CNavItem,
                name: 'Badges',
                to: '/notifications/badges',
            },
            {
                component: CNavItem,
                name: 'Modal',
                to: '/notifications/modals',
            },
            {
                component: CNavItem,
                name: 'Toasts',
                to: '/notifications/toasts',
            },
        ],
    },
    {
        component: CNavItem,
        name: 'Widgets',
        to: '/widgets',
        icon: <CIcon icon={cilCalculator} customClassName="nav-icon" />,
        badge: {
            color: 'info',
            text: 'NEW',
        },
    },
    {
        component: CNavTitle,
        name: 'Extras',
    },
    {
        component: CNavGroup,
        name: 'Pages',
        icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
        items: [
            {
                component: CNavItem,
                name: 'Login',
                to: '/login',
            },
            {
                component: CNavItem,
                name: 'Register',
                to: '/register',
            },
            {
                component: CNavItem,
                name: 'Error 404',
                to: '/404',
            },
            {
                component: CNavItem,
                name: 'Error 500',
                to: '/500',
            },
        ],
    },
    {
        component: CNavItem,
        name: 'Docs',
        href: 'https://coreui.io/react/docs/templates/installation/',
        icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
    },
]


export default _nav
