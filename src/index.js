import { Provider } from 'react-redux'
import './assets/css/style.css'

import 'react-toastify/dist/ReactToastify.css';

import store from './store'





import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>
);


