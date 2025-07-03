
import React from 'react';
import Layout from '@/core/layouts/Layout';
import AuthForm from '@/features/auth/AuthForm';

const Login = () => {
  return (
    <Layout showHeader={false}>
      <AuthForm type="login" />
    </Layout>
  );
};

export default Login;
