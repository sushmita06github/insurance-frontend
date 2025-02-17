import React, { useEffect, useState } from 'react';
import api from '../api';
import './DataPage.css';

const Policyholders = () => {
  const [policyholders, setPolicyholders] = useState([]);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // stores the _id of the policyholder being edited
  const [editData, setEditData] = useState({ name: '', email: '', phone: '', role: 'user' });
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchPolicyholders = async () => {
    try {
      const response = await api.get('/policyholders');
      // Filter out admin role accounts so they don't appear in the list.
      const filtered = response.data.filter(ph => ph.role !== 'admin');
      setPolicyholders(filtered);
    } catch (err) {
      setError('Failed to fetch policyholders.');
    }
  };

  useEffect(() => {
    fetchPolicyholders();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/policyholders/${id}`);
      fetchPolicyholders();
    } catch (err) {
      setError('Failed to delete policyholder.');
    }
  };

  const handleEditClick = (ph) => {
    setEditing(ph._id);
    setEditData({ name: ph.name, email: ph.email, phone: ph.phone, role: ph.role });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e, id) => {
    e.preventDefault();
    try {
      await api.put(`/policyholders/${id}`, editData);
      setEditing(null);
      fetchPolicyholders();
    } catch (err) {
      setError('Failed to update policyholder.');
    }
  };

  return (
    <div className="data-container">
      <h2>Policyholders</h2>
      {error && <div className="error">{error}</div>}
      <div className="data-list">
        <h3>Registered Policyholders</h3>
        <ul>
          {policyholders.map(ph => (
            <li key={ph._id}>
              {editing === ph._id ? (
                <form onSubmit={(e) => handleEditSubmit(e, ph._id)} className="data-form">
                  <div className="form-group">
                    <label>Name</label>
                    <input type="text" name="name" value={editData.name} onChange={handleEditChange} required />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={editData.email} onChange={handleEditChange} required />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="text" name="phone" value={editData.phone} onChange={handleEditChange} required />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select name="role" value={editData.role} onChange={handleEditChange}>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <button type="submit" className="data-button">Save</button>
                  <button type="button" className="data-button cancel" onClick={() => setEditing(null)}>Cancel</button>
                </form>
              ) : (
                <>
                  <strong>Name:</strong> {ph.name} | <strong>Email:</strong> {ph.email} | <strong>Phone:</strong> {ph.phone} | <strong>Role:</strong> {ph.role}
                  <div className="action-buttons">
                    <button onClick={() => handleEditClick(ph)} className="data-button edit">Edit</button>
                    <button onClick={() => handleDelete(ph._id)} className="data-button delete">Delete</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Policyholders;