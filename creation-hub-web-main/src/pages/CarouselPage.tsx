import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { FormProvider } from '@/modules/carousel/FormContext';
import UserInputForm from '@/modules/carousel/UserInputForm';
import PromptEditor from '@/modules/carousel/PromptEditor';
import OutputViewer from '@/modules/carousel/OutputViewer';

const CarouselPage = () => {
  return (
    <FormProvider>
      <Routes>
        <Route path="/" element={<UserInputForm />} />
        <Route path="/prompt" element={<PromptEditor />} />
        <Route path="/output" element={<OutputViewer />} />
      </Routes>
    </FormProvider>
  );
};

export default CarouselPage;
