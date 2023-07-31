import * as React from 'react';
import App from './app';
import {createRoot} from 'react-dom/client';
import './style.css';

const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App/>);