import React, { useEffect, useState } from 'react';
import api from '../api';
import './DataPage.css';

const Claims = () => {
  const [claims, setClaims] = useState([]);
  const [userPolicies, setUserPolicies] = useState([]);
  const [formData, setFormData] = useState({
    policyId: '',
    amount: '',
    status: 'Pending',
    // Set the initial filing date to today's date in YYYY-MM-DD format
    dateFiled: new Date().toISOString().substring(0, 10)
  });
  const [editingClaimId, setEditingClaimId] = useState(null);
  const [editClaimData, setEditClaimData] = useState({
    policyId: '',
    amount: '',
    status: 'Pending',
    dateFiled: '' // For editing, this field will be populated accordingly
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  // Fetch policies for the dropdown (for regular users)
  const fetchPolicies = async () => {
    try {
      const response = await api.get('/policies');
      let fetchedPolicies = response.data;
      // For non-admin users, filter policies by comparing the logged-in user's id
      if (user.role !== 'admin') {
        fetchedPolicies = fetchedPolicies.filter(
          policy => String(policy.policyholderId) === user.id
        );
      }
      setUserPolicies(fetchedPolicies);
    } catch (err) {
      setError('Failed to fetch policies.');
    }
  };

  // Fetch all claims; for non-admin users, filter by the policies they own.
  const fetchClaims = async () => {
    try {
      const response = await api.get('/claims');
      let fetchedClaims = response.data;
      if (user.role !== 'admin' && userPolicies.length > 0) {
        const userPolicyIds = userPolicies.map(policy => policy._id);
        fetchedClaims = fetchedClaims.filter(claim => userPolicyIds.includes(claim.policyId));
      }
      setClaims(fetchedClaims);
    } catch (err) {
      setError('Failed to fetch claims.');
    }
  };

  // Fetch policies once on mount
  useEffect(() => {
    fetchPolicies();
  }, []);

  // Once policies are loaded (or updated), fetch claims
  useEffect(() => {
    fetchClaims();
  }, [userPolicies]);

  // Handle changes in the new claim form (for regular users)
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle submission of the new claim form (only for regular users)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/claims', formData);
      setSuccess('Claim filed successfully!');
      setFormData({
        policyId: '',
        amount: '',
        status: 'Pending',
        dateFiled: new Date().toISOString().substring(0, 10)
      });
      fetchClaims();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to file claim.');
    }
  };

  // Admin editing functions
  const handleEditClick = (claim) => {
    setEditingClaimId(claim._id);
    setEditClaimData({
      policyId: claim.policyId,
      amount: claim.amount,
      status: claim.status,
      dateFiled: new Date(claim.dateFiled).toISOString().substring(0, 10) // Format date as YYYY-MM-DD
    });
  };

  const handleEditChange = (e) => {
    setEditClaimData({ ...editClaimData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e, id) => {
    e.preventDefault();
    try {
      await api.put(`/claims/${id}`, editClaimData);
      setEditingClaimId(null);
      fetchClaims();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update claim.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/claims/${id}`);
      fetchClaims();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete claim.');
    }
  };

  // For regular users, only display claims for their policies.
  const displayedClaims =
    user.role !== 'admin'
      ? claims.filter(claim => {
          const userPolicyIds = userPolicies.map(policy => policy._id);
          return userPolicyIds.includes(claim.policyId);
        })
      : claims;

  return (
    <div className="data-container">
      <h2>Claims</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {/* Show the claim filing form only for regular users */}
      {user.role !== 'admin' && (
        <form onSubmit={handleSubmit} className="data-form">
          <div className="form-group">
            <label>Select Policy</label>
            <select name="policyId" value={formData.policyId} onChange={handleChange} required>
              <option value="">-- Select Policy --</option>
              {userPolicies.map(policy => (
                <option key={policy._id} value={policy._id}>
                  {policy.policyNumber} (Coverage: {policy.coverageAmount})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Claim Amount</label>
            <input type="number" name="amount" value={formData.amount} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          {/* Adding an editable date field for claim filing */}
          <div className="form-group">
            <label>Filing Date</label>
            <input 
              type="date" 
              name="dateFiled" 
              value={formData.dateFiled} 
              onChange={handleChange} 
              required 
            />
          </div>
          <button type="submit" className="data-button">File Claim</button>
        </form>
      )}

      <div className="data-list">
        <h3>Existing Claims</h3>
        <ul>
          {displayedClaims.map(claim => (
            <li key={claim._id}>
              {editingClaimId === claim._id ? (
                <form onSubmit={(e) => handleEditSubmit(e, claim._id)} className="data-form">
                  <div className="form-group">
                    <label>Policy</label>
                    <select name="policyId" value={editClaimData.policyId} onChange={handleEditChange} required>
                      <option value="">-- Select Policy --</option>
                      {userPolicies.map(policy => (
                        <option key={policy._id} value={policy._id}>
                          {policy.policyNumber} (Coverage: {policy.coverageAmount})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Claim Amount</label>
                    <input type="number" name="amount" value={editClaimData.amount} onChange={handleEditChange} required />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={editClaimData.status} onChange={handleEditChange}>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date Filed</label>
                    <input type="date" name="dateFiled" value={editClaimData.dateFiled} onChange={handleEditChange} required />
                  </div>
                  <button type="submit" className="data-button">Save</button>
                  <button type="button" className="data-button cancel" onClick={() => setEditingClaimId(null)}>Cancel</button>
                </form>
              ) : (
                <>
                  <strong>Policy ID:</strong> {claim.policyId} | <strong>Amount:</strong> {claim.amount} | <strong>Status:</strong> {claim.status} | <strong>Date Filed:</strong> {new Date(claim.dateFiled).toLocaleDateString()}
                  {user.role === 'admin' && (
                    <div className="action-buttons">
                      <button onClick={() => handleEditClick(claim)} className="data-button edit">Edit</button>
                      <button onClick={() => handleDelete(claim._id)} className="data-button delete">Delete</button>
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

export default Claims;