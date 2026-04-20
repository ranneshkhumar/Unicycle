import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';

export default function Verify() {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        await API.get(`/auth/verify/${token}`);
        alert('✅ Email verified successfully!');
        navigate('/login');
      } catch (err) {
        alert('❌ Verification failed');
      }
    };

    verifyUser();
  }, [token]);

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>Verifying your email...</h2>
    </div>
  );
}