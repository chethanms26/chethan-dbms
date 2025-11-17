import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Login = ({ setUser }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const user = await authService.login(username, password);

            if (user && user.role) {
                setUser(user);

                if (user.role === 'ADMIN') navigate('/dashboard');
                else if (user.role === 'SUPPLIER') navigate('/supplier-portal');
                else if (user.role === 'CUSTOMER') navigate('/orders');
                else navigate('/dashboard');
            } else {
                setError('Invalid username or password.');
            }
        } catch (err) {
            setError('Login failed. Please check server or credentials.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-3">
                    SCM Portal Login
                </h2>

                <p className="text-sm text-gray-600 text-center mb-6">
                    Roles: <b>admin / supplier / customer</b><br />
                    Password: <b>DBMS@pesu2025</b>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        Log In
                    </button>
                </form>

                {error && (
                    <p className="mt-4 text-center text-red-600 font-medium">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Login;
