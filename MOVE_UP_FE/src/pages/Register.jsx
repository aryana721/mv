import React, { useState } from 'react';
import api from '../services/api';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Vendor' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async () => {
    await api.post('/auth/register', form);
    alert('Registered! You can now log in.');
  };

  return (
    <div>
      <h2>Register</h2>
      <input name="name" placeholder="Name" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} />
      <select name="role" onChange={handleChange}>
        <option value="Vendor">Vendor</option>
        <option value="Driver">Driver</option>
        <option value="Admin">Admin</option>
      </select>
      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

export default Register;