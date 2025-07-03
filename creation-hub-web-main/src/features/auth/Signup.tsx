import React from 'react';
import Layout from '@/core/layouts/Layout';
import AuthForm from '@/features/auth/AuthForm';

const Signup = () => {
  return (
    <Layout showHeader={false}>
      <AuthForm type="signup" />
    </Layout>
  );
};

export default Signup;
