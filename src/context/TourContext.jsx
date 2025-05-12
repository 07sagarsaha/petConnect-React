import React, { createContext, useState, useContext } from 'react';

const TourContext = createContext();

export const TourProvider = ({ children }) => {
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tourType, setTourType] = useState('general');

  const startTour = (type = 'general') => {
    setCurrentStep(0);
    setTourType(type);
    setShowTour(true);
  };

  const endTour = () => {
    setShowTour(false);
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  return (
    <TourContext.Provider value={{ 
      showTour, 
      currentStep,
      tourType,
      setCurrentStep,
      startTour, 
      endTour, 
      nextStep, 
      prevStep 
    }}>
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => useContext(TourContext);

export default TourContext;
