import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const Login = ({ setAuth }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('https://al-nashar-backend.onrender.com/api/login', { password });
            if (res.data.success) {
                setAuth(true);
            }
        } catch (err) {
            setError('كلمة المرور غير صحيحة');
        }
    };

    return (
        <div className="login-page">
            <div className="login-frame">
                <h2 className="login-title">تسجيل الدخول</h2>
                <h3 className="welcome-text">مرحباً بك في مجموعة النشار المعمارية</h3>
                
                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-field">
                        <label>كلمة المرور</label>
                        <input 
                            type="password" 
                            placeholder="أدخل كلمة المرور هنا..." 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="error-text">{error}</p>}
                    <button type="submit" className="submit-btn">دخول</button>
                </form>
            </div>
        </div>
    );
};

export default Login;