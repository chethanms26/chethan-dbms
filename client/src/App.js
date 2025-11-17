import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import authService from './services/authService';

// --- Common Components ---
import Navbar from './components/common/Navbar';

// --- Pages ---
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Inventory from './pages/Inventory';
import Payments from './pages/Payments';

import './App.css';

// --------------------------------------------------------
// 🔒 Protected Route
// --------------------------------------------------------
const ProtectedRoute = ({ element: Element, allowedRoles, user, ...rest }) => {
    if (!user) return <Navigate to="/login" replace />;

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        const redirect = user.role === 'SUPPLIER' ? '/supplier-portal' : '/dashboard';
        return <Navigate to={redirect} replace />;
    }

    return <Element user={user} {...rest} />;
};
// --------------------------------------------------------


function App() {
    const [user, setUser] = useState(authService.getCurrentUser());

    const handleLogout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <Router>
            <Navbar user={user} handleLogout={handleLogout} />

            <div className="min-h-screen bg-gray-50">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Routes>

                        {/* PUBLIC */}
                        <Route path="/login" element={<Login setUser={setUser} />} />

                        <Route
                            path="/"
                            element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
                        />

                        {/* PROTECTED ROUTES */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute
                                    element={Dashboard}
                                    allowedRoles={['ADMIN', 'CUSTOMER']}
                                    user={user}
                                />
                            }
                        />

                        <Route
                            path="/products"
                            element={
                                <ProtectedRoute
                                    element={Products}
                                    allowedRoles={['ADMIN', 'SUPPLIER']}
                                    user={user}
                                />
                            }
                        />

                        <Route
                            path="/orders"
                            element={
                                <ProtectedRoute
                                    element={Orders}
                                    allowedRoles={['ADMIN', 'CUSTOMER']}
                                    user={user}
                                />
                            }
                        />

                        <Route
                            path="/customers"
                            element={
                                <ProtectedRoute
                                    element={Customers}
                                    allowedRoles={['ADMIN']}
                                    user={user}
                                />
                            }
                        />

                        <Route
                            path="/inventory"
                            element={
                                <ProtectedRoute
                                    element={Inventory}
                                    allowedRoles={['ADMIN', 'SUPPLIER']}
                                    user={user}
                                />
                            }
                        />

                        {/* SUPPLIER PORTAL */}
                        <Route
                            path="/supplier-portal"
                            element={
                                <ProtectedRoute
                                    element={Dashboard}
                                    allowedRoles={['SUPPLIER']}
                                    user={user}
                                />
                            }
                        />

                        {/* ⭐ PAYMENT PAGE WITH ORDER ID PARAM */}
                        <Route
                            path="/payments/:orderId"
                            element={
                                <ProtectedRoute
                                    element={Payments}
                                    allowedRoles={['ADMIN', 'CUSTOMER']}
                                    user={user}
                                />
                            }
                        />

                        <Route path="/unauthorized" element={<h1>403 - Access Denied</h1>} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
