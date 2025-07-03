
import React from 'react';
import ArticleGenerator from '../components/ArticleGenerator';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Technical Article Generator
          </h1>
          <p className="text-lg text-slate-600">
            Create professional technical content for your organization
          </p>
        </div>
        <ArticleGenerator />
      </div>
    </div>
  );
};

export default Index;
