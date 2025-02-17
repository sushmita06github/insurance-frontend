import React, { useEffect, useState } from 'react';
import api from '../api';
import './DataPage.css';

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const [formData, setFormData] = useState({
    coverageAmount: '',
    startDate: '',
    endDate: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  // States for admin edit mode
  const [editingPolicyId, setEditingPolicyId] = useState(null);
  const [editPolicyData, setEditPolicyData] = useState({
    policyNumber: '',
    coverageAmount: '',
    policyholderId: '',
    startDate: '',
    endDate: ''
  });

  const fetchPolicies = async () => {
    try {
      const response = await api.get('/policies');
      let fetchedPolicies = response.data;
      // For non-admin users, filter policies by comparing string values
      if (user.role !== 'admin') {
        fetchedPolicies = fetchedPolicies.filter(
          policy => String(policy.policyholderId) === user.id
        );
      }
      setPolicies(fetchedPolicies);
    } catch (err) {
      setError('Failed to fetch policies.');
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  // Function to generate a unique policy number
  const generatePolicyNumber = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    return `POL-${timestamp}-${randomNum}`;
  };

  // Handle creation form changes (for regular users)
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit new policy (regular users only)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        policyholderId: user.id,
        policyNumber: generatePolicyNumber() // Auto-generate policy number
      };
      await api.post('/policies', payload);
      setSuccess('Policy created successfully!');
      setFormData({ coverageAmount: '', startDate: '', endDate: '' });
      fetchPolicies();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create policy.');
    }
  };

  // Admin: Initiate edit mode for a policy
  const handleEditClick = (policy) => {
    setEditingPolicyId(policy._id);
    setEditPolicyData({
      policyNumber: policy.policyNumber,
      coverageAmount: policy.coverageAmount,
      policyholderId: policy.policyholderId,
      startDate: new Date(policy.startDate).toISOString().substring(0, 10),
      endDate: new Date(policy.endDate).toISOString().substring(0, 10)
    });
  };

  // Handle changes in the admin edit form
  const handleEditChange = (e) => {
    setEditPolicyData({ ...editPolicyData, [e.target.name]: e.target.value });
  };

  // Admin: Submit updated policy data
  const handleEditSubmit = async (e, id) => {
    e.preventDefault();
    try {
      await api.put(`/policies/${id}`, editPolicyData);
      setSuccess('Policy updated successfully!');
      setEditingPolicyId(null);
      fetchPolicies();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update policy.');
    }
  };

  // Cancel admin edit mode
  const handleCancelEdit = () => {
    setEditingPolicyId(null);
  };

  // Admin: Delete a policy
  const handleDelete = async (id) => {
    try {
      await api.delete(`/policies/${id}`);
      setSuccess('Policy deleted successfully!');
      fetchPolicies();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete policy.');
    }
  };

  return (
    <div className="data-container">
      <h2>Policies</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="data-list">
        <h3>Existing Policies</h3>
        <ul>
          {policies.map((policy) => (
            <li key={policy._id}>
              {editingPolicyId === policy._id ? (
                <form onSubmit={(e) => handleEditSubmit(e, policy._id)} className="data-form">
                  <div className="form-group">
                    <label>Policy Number</label>
                    <input
                      type="text"
                      name="policyNumber"
                      value={editPolicyData.policyNumber}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Coverage Amount</label>
                    <input
                      type="number"
                      name="coverageAmount"
                      value={editPolicyData.coverageAmount}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={editPolicyData.startDate}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={editPolicyData.endDate}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  {/* Include policyholderId as hidden (or read-only) so it passes validation */}
                  <input
                    type="hidden"
                    name="policyholderId"
                    value={editPolicyData.policyholderId}
                  />
                  <button type="submit" className="data-button">Save</button>
                  <button type="button" className="data-button cancel" onClick={handleCancelEdit}>Cancel</button>
                </form>
              ) : (
                <>
                  <strong>Policy Number:</strong> {policy.policyNumber} |{' '}
                  <strong>Coverage:</strong> {policy.coverageAmount} |{' '}
                  <strong>Start:</strong> {new Date(policy.startDate).toLocaleDateString()} |{' '}
                  <strong>End:</strong> {new Date(policy.endDate).toLocaleDateString()}
                  {user.role === 'admin' && (
                    <div className="action-buttons">
                      <button onClick={() => handleEditClick(policy)} className="data-button edit">Edit</button>
                      <button onClick={() => handleDelete(policy._id)} className="data-button delete">Delete</button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Policies;