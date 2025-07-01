
import React from 'react';
import Layout from '@/components/Layout';
import AuthForm from '@/components/AuthForm';

const ForgotPassword = () => {
  return (
    <Layout showHeader={false}>
      <AuthForm type="forgot" />
    </Layout>
  );
};

export default ForgotPassword;
