import React from 'react';
import Layout from '@/core/layouts/Layout';
import AuthForm from '@/features/auth/AuthForm';

const ForgotPassword = () => {
  return (
    <Layout showHeader={false}>
      <AuthForm type="forgot" />
    </Layout>
  );
};

export default ForgotPassword;
