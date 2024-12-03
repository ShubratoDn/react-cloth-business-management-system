import React from 'react'

import AddUser from './views/userManagement/AddUser'
import AddUserRole from 'views/userRole/AddUserRole'
import AllRoles from 'views/userRole/AllRoles'
import { exact } from 'prop-types'
import FindUser from 'views/userManagement/FindUser'
import AssignRole from 'views/userRole/AssignRole'
import AddStore from 'views/storeManagement/AddStore'
import FindStore from 'views/storeManagement/FindStore'
import AssignStore from 'views/storeManagement/AssignStore'
import CreateProduct from 'views/productManagement/CreateProduct'
import FindProduct from 'views/productManagement/FindProduct'
import CreateStakeholder from 'views/stakeholderManagement/CreateStakeholder'
import CreatePurchase from 'views/procurementManagement/CreatePurchase'
import PurchaseHistory from 'views/procurementManagement/PurchaseHistory'
import ViewPurchaseDetails from 'views/procurementManagement/ViewPurchaseDetails'
import UpdatePurchase from 'views/procurementManagement/UpdatePurchase'
import UpdatePurchaseStatus from 'views/procurementManagement/UpdatePurchaseStatus'
import FindStock from 'views/stockManagement/FindStock'
import StockOverview from 'views/stockManagement/StockOverview'
import CreateSale from 'views/salesManagement/CreateSale'
import SellHistory from 'views/salesManagement/SaleHistory'
import ViewSaleDetails from 'views/salesManagement/ViewSaleDetails'
import UpdateSale from 'views/salesManagement/UpdateSale'
import UpdateSaleStatus from 'views/salesManagement/UpdateSaleStatus'
import ProfitabilityReport from 'views/misReport/ProfitabilityReport'


const Logout = React.lazy(() => import('./views/auth/Logout'))
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Colors = React.lazy(() => import('./views/theme/colors/Colors'))
const Typography = React.lazy(() => import('./views/theme/typography/Typography'))

// Base
const Accordion = React.lazy(() => import('./views/base/accordion/Accordion'))
const Breadcrumbs = React.lazy(() => import('./views/base/breadcrumbs/Breadcrumbs'))
const Cards = React.lazy(() => import('./views/base/cards/Cards'))
const Carousels = React.lazy(() => import('./views/base/carousels/Carousels'))
const Collapses = React.lazy(() => import('./views/base/collapses/Collapses'))
const ListGroups = React.lazy(() => import('./views/base/list-groups/ListGroups'))
const Navs = React.lazy(() => import('./views/base/navs/Navs'))
const Paginations = React.lazy(() => import('./views/base/paginations/Paginations'))
const Placeholders = React.lazy(() => import('./views/base/placeholders/Placeholders'))
const Popovers = React.lazy(() => import('./views/base/popovers/Popovers'))
const Progress = React.lazy(() => import('./views/base/progress/Progress'))
const Spinners = React.lazy(() => import('./views/base/spinners/Spinners'))
const Tabs = React.lazy(() => import('./views/base/tabs/Tabs'))
const Tables = React.lazy(() => import('./views/base/tables/Tables'))
const Tooltips = React.lazy(() => import('./views/base/tooltips/Tooltips'))

// Buttons
const Buttons = React.lazy(() => import('./views/buttons/buttons/Buttons'))
const ButtonGroups = React.lazy(() => import('./views/buttons/button-groups/ButtonGroups'))
const Dropdowns = React.lazy(() => import('./views/buttons/dropdowns/Dropdowns'))

//Forms
const ChecksRadios = React.lazy(() => import('./views/forms/checks-radios/ChecksRadios'))
const FloatingLabels = React.lazy(() => import('./views/forms/floating-labels/FloatingLabels'))
const FormControl = React.lazy(() => import('./views/forms/form-control/FormControl'))
const InputGroup = React.lazy(() => import('./views/forms/input-group/InputGroup'))
const Layout = React.lazy(() => import('./views/forms/layout/Layout'))
const Range = React.lazy(() => import('./views/forms/range/Range'))
const Select = React.lazy(() => import('./views/forms/select/Select'))
const Validation = React.lazy(() => import('./views/forms/validation/Validation'))

const Charts = React.lazy(() => import('./views/charts/Charts'))

// Icons
const CoreUIIcons = React.lazy(() => import('./views/icons/coreui-icons/CoreUIIcons'))
const Flags = React.lazy(() => import('./views/icons/flags/Flags'))
const Brands = React.lazy(() => import('./views/icons/brands/Brands'))

// Notifications
const Alerts = React.lazy(() => import('./views/notifications/alerts/Alerts'))
const Badges = React.lazy(() => import('./views/notifications/badges/Badges'))
const Modals = React.lazy(() => import('./views/notifications/modals/Modals'))
const Toasts = React.lazy(() => import('./views/notifications/toasts/Toasts'))

const Widgets = React.lazy(() => import('./views/widgets/Widgets'))

const routes = [
    // USER MANAGEMENT JSON
    { path: '/user', exact: true, name: 'Users', element: FindUser, roleRequired: "ROLE_USER_GET" },
    { path: '/user/add', name: 'Add User', element: AddUser, roleRequired: "ROLE_USER_CREATE" },
    { path: '/user/all', name: 'Find Users', element: FindUser, roleRequired: "ROLE_USER_GET" },
    // USER MANAGEMENT JSON ENDS



    //USER ROLE
    { path: '/role', exact: true, name: "Roles", element: AllRoles, roleRequired: "ROLE_ROLE_GET" },
    { path: '/role/all', name: 'All Roles', element: AllRoles, roleRequired: "ROLE_ROLE_GET" },
    { path: '/role/add', name: 'Add Role', element: AddUserRole, roleRequired: "ROLE_ROLE_CREATE" },
    { path: '/role/assign', name: 'Assign Role', element: AssignRole, roleRequired: "ROLE_ROLE_ASSIGN" },
    //USER ROLE ENDS




    //STORE MANAGEMENT
    { path: '/store', exact: true, name: "Stores", element: FindStore, roleRequired: "ROLE_STORE_GET" },
    { path: '/store/all', name: 'All Stores', element: FindStore, roleRequired: "ROLE_STORE_GET" },
    { path: '/store/add', name: 'Add Store', element: AddStore, roleRequired: "ROLE_STORE_CREATE" },
    { path: '/store/assign', name: 'Assign Store', element: AssignStore, roleRequired: "ROLE_STORE_ASSIGN" },
    //STORE MANAGEMENT



    //product Management
    { path: '/product', exact: true, name: "Products", element: FindProduct},
    { path: '/product/all', name: 'All Products', element: FindProduct},
    { path: '/product/add', name: 'Add Product', element: CreateProduct, roleRequired: "ROLE_PRODUCT_CREATE" },
    { path: '/stock/overview', name: 'Stock Overview', element: StockOverview },
    { path: '/stock/find', name: 'Find Stock', element: FindStock, roleRequired: "ROLE_STOCK_GET" },
    //product management ends





      //STAKEHOLDER Management
      { path: '/stakeholder', exact: true, name: "Stakeholders", element: FindProduct},
      { path: '/stakeholder/find', name: 'Find Stakeholders', element: FindProduct},
      { path: '/stakeholder/add', name: 'Add Stakeholders', element: CreateStakeholder, roleRequired: "ROLE_STAKEHOLDER_CREATE" },
      //STAKEHOLDER management ends



      // PROCUREMENT & SALES
      { path: '/procurement/purchase', exact: true, name: "Purchase", element: CreatePurchase},
      { path: '/procurement/purchase-history', name: "Purchase History", element: PurchaseHistory},
      { path: '/procurement/view-purchase-details/:id/:transactionNumber', name: "View purchase details", element: ViewPurchaseDetails},
      { path: '/procurement/edit-purchase-details/:id/:transactionNumber', name: "Edit purchase details", element: UpdatePurchase},
      { path: '/procurement/update-purchase-status/:id/:transactionNumber', name: "Update purchase status", element: UpdatePurchaseStatus},

      { path: '/sales/sell', exact: true, name: "Sell", element: CreateSale},
      { path: '/sales/sale-history', name: "Sell History", element: SellHistory},
      { path: '/procurement/view-sale-details/:id/:transactionNumber', name: "View Sale details", element: ViewSaleDetails},
      { path: '/procurement/edit-sale-details/:id/:transactionNumber', name: "Edit Sale details", element: UpdateSale},
      { path: '/procurement/update-sale-status/:id/:transactionNumber', name: "Update Sale status", element: UpdateSaleStatus},
      // PROCUREMENT & SALES ENDS


      //MIS REPORT
      { path: '/mis/report', exact: true, name: "MIS REPORT", element: ProfitabilityReport},
      { path: '/mis/report/profitability', name: 'Profitability Report', element: ProfitabilityReport},
      //MIS REPORT
    
  



    { path: '/', exact: true, name: 'Home' },
    { path: '/logout', name: 'Logout', element: Logout },
    { path: '/dashboard', name: 'Dashboard', element: Dashboard },
    { path: '/theme', name: 'Theme', element: Colors, exact: true },
    { path: '/theme/colors', name: 'Colors', element: Colors },
    { path: '/theme/typography', name: 'Typography', element: Typography },
    { path: '/base', name: 'Base', element: Cards, exact: true },
    { path: '/base/accordion', name: 'Accordion', element: Accordion },
    { path: '/base/breadcrumbs', name: 'Breadcrumbs', element: Breadcrumbs },
    { path: '/base/cards', name: 'Cards', element: Cards },
    { path: '/base/carousels', name: 'Carousel', element: Carousels },
    { path: '/base/collapses', name: 'Collapse', element: Collapses },
    { path: '/base/list-groups', name: 'List Groups', element: ListGroups },
    { path: '/base/navs', name: 'Navs', element: Navs },
    { path: '/base/paginations', name: 'Paginations', element: Paginations },
    { path: '/base/placeholders', name: 'Placeholders', element: Placeholders },
    { path: '/base/popovers', name: 'Popovers', element: Popovers },
    { path: '/base/progress', name: 'Progress', element: Progress },
    { path: '/base/spinners', name: 'Spinners', element: Spinners },
    { path: '/base/tabs', name: 'Tabs', element: Tabs },
    { path: '/base/tables', name: 'Tables', element: Tables },
    { path: '/base/tooltips', name: 'Tooltips', element: Tooltips },
    { path: '/buttons', name: 'Buttons', element: Buttons, exact: true },
    { path: '/buttons/buttons', name: 'Buttons', element: Buttons },
    { path: '/buttons/dropdowns', name: 'Dropdowns', element: Dropdowns },
    { path: '/buttons/button-groups', name: 'Button Groups', element: ButtonGroups },
    { path: '/charts', name: 'Charts', element: Charts },
    { path: '/forms', name: 'Forms', element: FormControl, exact: true },
    { path: '/forms/form-control', name: 'Form Control', element: FormControl },
    { path: '/forms/select', name: 'Select', element: Select },
    { path: '/forms/checks-radios', name: 'Checks & Radios', element: ChecksRadios },
    { path: '/forms/range', name: 'Range', element: Range },
    { path: '/forms/input-group', name: 'Input Group', element: InputGroup },
    { path: '/forms/floating-labels', name: 'Floating Labels', element: FloatingLabels },
    { path: '/forms/layout', name: 'Layout', element: Layout },
    { path: '/forms/validation', name: 'Validation', element: Validation },
    { path: '/icons', exact: true, name: 'Icons', element: CoreUIIcons },
    { path: '/icons/coreui-icons', name: 'CoreUI Icons', element: CoreUIIcons },
    { path: '/icons/flags', name: 'Flags', element: Flags },
    { path: '/icons/brands', name: 'Brands', element: Brands },
    { path: '/notifications', name: 'Notifications', element: Alerts, exact: true },
    { path: '/notifications/alerts', name: 'Alerts', element: Alerts },
    { path: '/notifications/badges', name: 'Badges', element: Badges },
    { path: '/notifications/modals', name: 'Modals', element: Modals },
    { path: '/notifications/toasts', name: 'Toasts', element: Toasts },
    { path: '/widgets', name: 'Widgets', element: Widgets },
]

export default routes
