import React, { useState } from 'react';
import api from '../api';
import './Dashboard.css';
import homeInsuranceImg from './images/home-insurance.jpeg';
import carInsuranceImg from './images/car-insurance.jpeg';
import lifeInsuranceImg from './images/life-insurance.jpeg';
import termInsuranceImg from './images/term-insurance.jpeg';


const flashCards = [
  { id: 1, type: 'Home Insurance', img: homeInsuranceImg },
  { id: 2, type: 'Car Insurance', img: carInsuranceImg },
  { id: 3, type: 'Life Insurance', img: lifeInsuranceImg },
  { id: 4, type: 'Term Insurance', img: termInsuranceImg },
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

  // Helper function to determine the policy initial based on the policy type
  const getPolicyInitial = (policyType) => {
    if (policyType.toLowerCase().includes('car')) return 'CAR';
    if (policyType.toLowerCase().includes('home')) return 'HOM';
    if (policyType.toLowerCase().includes('life')) return 'LIF';
    if (policyType.toLowerCase().includes('term')) return 'TER';
    return 'GEN'; // Default initial if none match
  };

  // Generate a unique policy number with the policy initial included
  const generatePolicyNumber = (policyType) => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const initial = getPolicyInitial(policyType);
    return `${initial}-POL-${timestamp}-${randomNum}`;
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
        policyNumber: generatePolicyNumber(selectedPolicyType), // Auto-generate the policy number with initial
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
        This is your dashboard. Use the navigation bar to manage your claims, policies, and, if you're an admin, policyholders.
      </p>

      <h2>Our Insurance Policies</h2>
      <div className="flash-card-grid">
        {flashCards.map((card) => (
          <div key={card.id} className="flash-card" onClick={() => handleCardClick(card)}>
            <div className="card-icon">
              <img src={card.img} alt={card.type} />
            </div>
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