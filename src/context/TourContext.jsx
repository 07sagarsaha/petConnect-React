import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './authContext/authContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const TourContext = createContext();

export const TourProvider = ({ children }) => {
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tourType, setTourType] = useState('general');
  const [tourHistory, setTourHistory] = useState({});
  const { user } = useAuth();

  // Load tour history from Firestore when user logs in
  useEffect(() => {
    const loadTourHistory = async () => {
      if (!user) return;
      
      try {
        const userRef = doc(db, "users", user.id);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.tourHistory) {
            setTourHistory(userData.tourHistory);
          }
        }
      } catch (error) {
        console.error("Error loading tour history:", error);
      }
    };
    
    loadTourHistory();
  }, [user]);

  // Save tour completion to Firestore
  const saveTourCompletion = async (type) => {
    if (!user) return;
    
    try {
      const updatedHistory = {
        ...tourHistory,
        [type]: true
      };
      
      setTourHistory(updatedHistory);
      
      const userRef = doc(db, "users", user.id);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        await setDoc(userRef, { 
          ...userData, 
          tourHistory: updatedHistory 
        }, { merge: true });
      }
    } catch (error) {
      console.error("Error saving tour completion:", error);
    }
  };

  const startTour = (type = 'general') => {
    setCurrentStep(0);
    setTourType(type);
    setShowTour(true);
  };

  const endTour = async () => {
    await saveTourCompletion(tourType);
    setShowTour(false);
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const hasTourBeenCompleted = (type) => {
    return tourHistory[type] === true;
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
      prevStep,
      hasTourBeenCompleted
    }}>
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => useContext(TourContext);

export default TourContext;
