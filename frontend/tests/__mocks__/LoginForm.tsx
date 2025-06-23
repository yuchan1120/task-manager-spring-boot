import React, { useContext } from 'react';
import { AuthContext } from '../../src/AuthContext';

const MockLoginForm = () => {
  const { login } = useContext(AuthContext);
  return <button onClick={() => login('mock-token')}>Mock Login</button>;
};

export default MockLoginForm;
