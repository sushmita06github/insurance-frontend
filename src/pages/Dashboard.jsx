import React, { useState } from 'react';
import api from '../api';
import './Dashboard.css';

const flashCards = [
  { id: 1, type: 'Home Insurance', icon: '🏠' },
  { id: 2, type: 'Car Insurance', icon: '🚗' },
  { id: 3, type: 'Life Insurance', icon: '❤️' },
  { id: 4, type: 'Term Insurance', icon: '📜' },
];

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [showModal, setShowModal] = useState(false);
  const [selectedPolicyType, setSelectedPolicyType] = useState('');
  const [formData, setFormData] = useState({
    coverageAmount: '',
    startDate: '',
    endDate: '',
  });
  const [flashMessage, setFlashMessage] = useState('');

  // Function to generate a unique policy number
  const generatePolicyNumber = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    return `POL-${timestamp}-${randomNum}`;
  };

  const handleCardClick = (card) => {
    setSelectedPolicyType(card.type);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyPolicy = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        policyholderId: user.id, // Automatically assign the logged-in user's ID
        policyNumber: generatePolicyNumber(), // Auto-generate the policy number
      };
      await api.post('/policies', payload);
      setFlashMessage('Policy applied successfully!');
      setFormData({ coverageAmount: '', startDate: '', endDate: '' });
      setTimeout(() => {
        setFlashMessage('');
        setShowModal(false);
      }, 2000);
    } catch (err) {
      setFlashMessage(err.response?.data?.message || 'Failed to apply for policy.');
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome, {user ? user.name : 'User'}!</h1>
      <p>
        This is your dashboard. Use the navigation bar to manage your claims, policies,
        and, if you're an admin, policyholders.
      </p>
      
      <h2>Our Insurance Policies</h2>
      <div className="flash-card-grid">
        {flashCards.map((card) => (
          <div key={card.id} className="flash-card" onClick={() => handleCardClick(card)}>
            <div className="card-icon">{card.icon}</div>
            <h3>{card.type}</h3>
            <p>Click to apply</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Apply for {selectedPolicyType}</h2>
            {flashMessage && <div className="flash-message">{flashMessage}</div>}
            <form onSubmit={handleApplyPolicy} className="modal-form">
              <div className="form-group">
                <label>Coverage Amount</label>
                <input
                  type="number"
                  name="coverageAmount"
                  value={formData.coverageAmount}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="modal-button">Apply</button>
                <button type="button" className="modal-button cancel" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;