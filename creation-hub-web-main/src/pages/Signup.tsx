
import React from 'react';
import Layout from '@/components/Layout';
import AuthForm from '@/components/AuthForm';

const Signup = () => {
  return (
    <Layout showHeader={false}>
      <AuthForm type="signup" />
    </Layout>
  );
};

export default Signup;
