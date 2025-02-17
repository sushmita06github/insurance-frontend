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

  // For regular users, handle policy creation
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
              <strong>ID:</strong> {policy._id} |{' '}
              <strong>Policy Number:</strong> {policy.policyNumber} |{' '}
              <strong>Coverage:</strong> {policy.coverageAmount}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Policies;