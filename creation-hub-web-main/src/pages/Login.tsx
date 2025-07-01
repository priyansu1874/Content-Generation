
import React from 'react';
import Layout from '@/components/Layout';
import AuthForm from '@/components/AuthForm';

const Login = () => {
  return (
    <Layout showHeader={false}>
      <AuthForm type="login" />
    </Layout>
  );
};

export default Login;
