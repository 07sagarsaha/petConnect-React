import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCat, FaDog } from 'react-icons/fa';
import { useTour } from '../context/TourContext';


const InteractiveTour = ({ onClose, tourType = 'general' }) => {
  // Use useRef for values that shouldn't trigger re-renders
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightPosition, setHighlightPosition] = useState(null);
  const [actionCompleted, setActionCompleted] = useState(false);
  const tooltipRef = useRef(null);
  const navigate = useNavigate();
  
  // Define different tour steps based on tour type
  const generalTourSteps = [
    {
      title: "Welcome to PetConnect!",
      description: "Hi there! I'm Whiskers, and I'll be your guide today! Let's show you around our amazing pet community.",
      location: "center",
      image: "cat",
      route: "/in/home",
      targetSelector: null
    },
    {
      title: "Home Feed",
      description: "This is your home feed where you can see posts from other pet owners. Try scrolling through the posts!",
      location: "feed",
      image: "dog",
      route: "/in/home",
      targetSelector: ".posts-container, div[class*='w-full flex flex-col gap-0']" // Target the posts container
    },
    {
      title: "Create a Post",
      description: "Share your pet's adventures by creating posts! Click the 'New Post' button to try it out.",
      location: "post",
      image: "cat",
      route: "/in/home",
      targetSelector: ".new-post-button, button:has(.IoMdAddCircleOutline), button:contains('New Post')"
    },
    {
      title: "Your Profile",
      description: "This is your profile page where you can add information about yourself and your pets!",
      location: "profile",
      image: "dog",
      route: "/in/profile",
      targetSelector: ".profile-container, div[class*='profile']"
    },
    {
      title: "Navigation Menu",
      description: "Use this menu to navigate between different sections of PetConnect.",
      location: "nav",
      image: "cat",
      route: "/in/profile",
      targetSelector: "nav, .sidenav, div[class*='fixed z-10']"
    },
    {
      title: "Messages",
      description: "Connect with other pet owners through our messaging feature! Click to explore.",
      location: "messages",
      image: "dog",
      route: "/in/messages",
      targetSelector: ".messages-container, div[class*='messages']"
    },
    {
      title: "AI Chat",
      description: "Have questions about pet care? Our AI assistant is here to help! Click to try it out.",
      location: "ai",
      image: "cat",
      route: "/in/ai-chat",
      targetSelector: ".ai-chat-container, div[class*='ai-chat']"
    },
    {
      title: "That's it!",
      description: "You're all set to enjoy PetConnect! If you ever need this tour again, you can find it in the Settings page. Happy posting!",
      location: "center",
      image: "dog",
      route: "/in/home",
      targetSelector: null
    }
  ];

  // Add messaging tour steps
  const messagingTourSteps = [
    {
      title: "Welcome to Messaging!",
      description: "Let's learn how to connect with other pet owners through our messaging feature.",
      location: "center",
      image: "cat",
      route: "/in/messages",
      targetSelector: null
    },
    {
      title: "Your Conversations",
      description: "Here you can see all your conversations with other pet owners.",
      location: "messages",
      image: "dog",
      route: "/in/messages",
      targetSelector: ".messages-container, div[class*='messages']"
    },
    {
      title: "Start a New Chat",
      description: "Click on any user to start a new conversation or continue an existing one.",
      location: "chat",
      image: "cat",
      route: "/in/messages",
      targetSelector: ".user-list-item, div[class*='user-item']"
    },
    {
      title: "Send Messages",
      description: "Type your message here and press send to connect with other pet owners!",
      location: "input",
      image: "dog",
      route: "/in/chat/sample-user-id",
      targetSelector: ".message-input, input[type='text'], textarea"
    },
    {
      title: "That's it!",
      description: "Now you're ready to connect with the pet community! Happy chatting!",
      location: "center",
      image: "cat",
      route: "/in/messages",
      targetSelector: null
    }
  ];

  // Memoize tour steps to prevent unnecessary re-renders
  const tourSteps = React.useMemo(() => {
    switch (tourType) {
      case 'messaging':
        return messagingTourSteps;
      case 'general':
      default:
        return generalTourSteps;
    }
  }, [tourType]);

  // Navigate to the correct route for each step
  useEffect(() => {
    let isMounted = true;
    
    if (tourSteps[currentStep]?.route) {
      const currentPath = window.location.pathname;
      const targetRoute = tourSteps[currentStep].route;
      
      // Only navigate if we're not already on the correct route
      if (currentPath !== targetRoute) {
        navigate(targetRoute);
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [currentStep, navigate, tourSteps]);

  // Find and highlight the target element
  useEffect(() => {
    let isMounted = true;
    let intervalId = null;
    
    const findTargetElement = () => {
      if (!isMounted) return;
      
      const step = tourSteps[currentStep];
      if (!step || !step.targetSelector) {
        setHighlightPosition(null);
        return;
      }
      
      // Try multiple selectors (comma-separated)
      const selectors = step.targetSelector.split(', ');
      let targetElement = null;
      
      // Try each selector until we find a matching element
      for (const selector of selectors) {
        if (selector.includes(':contains(')) {
          // Handle custom :contains() selector
          const match = selector.match(/:contains\('(.+?)'\)/);
          if (match) {
            const textToFind = match[1];
            const elements = document.querySelectorAll('button, a, div, span, h1, h2, h3, h4, h5, h6, p');
            for (let i = 0; i < elements.length; i++) {
              if (elements[i].textContent.includes(textToFind)) {
                targetElement = elements[i];
                break;
              }
            }
          }
        } else if (selector.includes(':has(')) {
          // Handle custom :has() selector
          const match = selector.match(/:has\((.+?)\)/);
          if (match) {
            const iconClass = match[1];
            const elements = document.querySelectorAll('button, a, div');
            for (let i = 0; i < elements.length; i++) {
              if (elements[i].querySelector(iconClass)) {
                targetElement = elements[i];
                break;
              }
            }
          }
        } else {
          // Standard selector
          const element = document.querySelector(selector);
          if (element) {
            targetElement = element;
            break;
          }
        }
        
        if (targetElement) break;
      }
      
      // Special case handling for specific steps
      if (!targetElement) {
        if (tourType === 'general') {
          if (currentStep === 1) { // Home Feed
            // Try to find the posts container
            targetElement = document.querySelector('.lg\\:w-2\\/3.w-full.z-0.flex.flex-col') || 
                            document.querySelector('div[class*="flex flex-col gap-0"]');
          } else if (currentStep === 2) { // New Post button
            // Find button with "New Post" text
            const buttons = document.querySelectorAll('button');
            for (let i = 0; i < buttons.length; i++) {
              if (buttons[i].textContent.includes('New Post')) {
                targetElement = buttons[i];
                break;
              }
            }
          } else if (currentStep === 4) { // Navigation Menu
            // Find the side navigation
            targetElement = document.querySelector('.fixed.z-10') || 
                            document.querySelector('div[class*="fixed z-10"]');
          }
        }
      }
      
      if (targetElement && isMounted) {
        const rect = targetElement.getBoundingClientRect();
        
        // Only update if we have valid dimensions
        if (rect.width > 0 && rect.height > 0) {
          // For the side nav, adjust the highlight to prevent bouncing
          if (tourType === 'general' && currentStep === 4) {
            setHighlightPosition({
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: Math.min(rect.height, window.innerHeight - 100), // Limit height to prevent overflow
              fixed: true // Mark as fixed position
            });
          } else {
            setHighlightPosition({
              top: rect.top + window.scrollY,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              fixed: false
            });
          }
          
          // Clear the interval once we've found the element
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        } else {
          if (isMounted) setHighlightPosition(null);
        }
      } else {
        if (isMounted) setHighlightPosition(null);
      }
    };

    // Initial check with a delay to allow for navigation
    const timeoutId = setTimeout(() => {
      findTargetElement();
      
      // Set up interval only if we haven't found the element yet
      if (!intervalId) {
        intervalId = setInterval(findTargetElement, 1000);
      }
    }, 500);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [currentStep, tourSteps, tourType]);

  // Position the tooltip based on the highlighted element
  useEffect(() => {
    if (!tooltipRef.current) return;
    
    const tooltip = tooltipRef.current;
    
    // If there's a highlighted element, position relative to it
    if (highlightPosition) {
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const tooltipRect = tooltip.getBoundingClientRect();
      
      // Calculate the center of the highlighted element
      const elementCenterX = highlightPosition.left + (highlightPosition.width / 2);
      
      // Determine the best position for the tooltip
      let top, left;
      
      // Try to position below the element first
      top = highlightPosition.top + highlightPosition.height + 20;
      
      // If that would go off the bottom of the screen, position above
      if (top + tooltipRect.height > windowHeight - 20) {
        top = Math.max(20, highlightPosition.top - tooltipRect.height - 20);
      }
      
      // Center horizontally relative to the element
      left = elementCenterX - (tooltipRect.width / 2);
      
      // Keep the tooltip on screen horizontally
      left = Math.max(20, Math.min(left, windowWidth - tooltipRect.width - 20));
      
      // For the side nav (step 4 in general tour), position the tooltip to the right of the nav
      if (tourType === 'general' && currentStep === 4) {
        left = highlightPosition.left + highlightPosition.width + 20;
        top = Math.min(windowHeight - tooltipRect.height - 20, 
                      highlightPosition.top + (highlightPosition.height / 2) - (tooltipRect.height / 2));
      }
      
      // Use direct DOM manipulation to avoid React re-renders
      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
      tooltip.style.transform = 'none'; // Remove the default transform
    } else {
      // If no element is highlighted, center the tooltip
      tooltip.style.top = '50%';
      tooltip.style.left = '50%';
      tooltip.style.transform = 'translate(-50%, -50%)';
    }
    
  }, [highlightPosition, currentStep, tourType]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setActionCompleted(false);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setActionCompleted(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  // Render the appropriate image based on the step
  const renderImage = () => {
    const image = tourSteps[currentStep]?.image;
    if (image === 'cat') {
      return <FaCat className="text-4xl text-primary" />;
    } else if (image === 'dog') {
      return <FaDog className="text-4xl text-primary" />;
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Create multiple overlay sections to darken everything except the highlighted element */}
      {highlightPosition && (
        <>
          {/* Top section */}
          <div 
            className="absolute bg-black/70 pointer-events-auto"
            style={{
              top: 0,
              left: 0,
              width: '100%',
              height: highlightPosition.top + 'px',
              zIndex: 10000
            }}
          />
          
          {/* Left section */}
          <div 
            className="absolute bg-black/70 pointer-events-auto"
            style={{
              top: highlightPosition.top + 'px',
              left: 0,
              width: highlightPosition.left + 'px',
              height: highlightPosition.height + 'px',
              zIndex: 10000
            }}
          />
          
          {/* Right section */}
          <div 
            className="absolute bg-black/70 pointer-events-auto"
            style={{
              top: highlightPosition.top + 'px',
              left: (highlightPosition.left + highlightPosition.width) + 'px',
              width: `calc(100% - ${highlightPosition.left + highlightPosition.width}px)`,
              height: highlightPosition.height + 'px',
              zIndex: 10000
            }}
          />
          
          {/* Bottom section */}
          <div 
            className="absolute bg-black/70 pointer-events-auto"
            style={{
              top: (highlightPosition.top + highlightPosition.height) + 'px',
              left: 0,
              width: '100%',
              height: `calc(100% - ${highlightPosition.top + highlightPosition.height}px)`,
              zIndex: 10000
            }}
          />
        </>
      )}
      
      {/* If no element is highlighted, darken the entire screen */}
      {!highlightPosition && (
        <div className="absolute inset-0 bg-black/70 pointer-events-auto" style={{ zIndex: 10000 }} />
      )}
      
      {/* Highlight border for the target element */}
      {highlightPosition && (
        <div 
          className="border-4 border-primary rounded-lg pointer-events-none"
          style={{
            position: highlightPosition.fixed ? 'fixed' : 'absolute',
            top: highlightPosition.top + 'px',
            left: highlightPosition.left + 'px',
            width: highlightPosition.width + 'px',
            height: highlightPosition.height + 'px',
            boxShadow: 'var(--shadow-tourHighlight, 0 0 15px 5px rgba(147, 51, 234, 0.7), 0 0 30px 10px rgba(147, 51, 234, 0.4))',
            zIndex: 10001,
            backgroundColor: 'transparent'
          }}
        />
      )}
      
      {/* Create a "hole" in the overlay to allow interaction with the highlighted element */}
      {highlightPosition && (
        <div 
          className="pointer-events-auto"
          style={{
            position: highlightPosition.fixed ? 'fixed' : 'absolute',
            top: highlightPosition.top + 'px',
            left: highlightPosition.left + 'px',
            width: highlightPosition.width + 'px',
            height: highlightPosition.height + 'px',
            zIndex: 10002,
            backgroundColor: 'transparent'
          }}
        />
      )}
      
      {/* Tooltip */}
      <div 
        ref={tooltipRef}
        className="fixed bg-base-100 p-6 rounded-xl shadow-xl max-w-md pointer-events-auto"
        style={{
          position: 'fixed',
          zIndex: 10003,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="flex items-center mb-4">
          {renderImage()}
          <h3 className="text-xl font-bold ml-2">{tourSteps[currentStep]?.title}</h3>
        </div>
        
        <p className="mb-6">{tourSteps[currentStep]?.description}</p>
        
        <div className="flex justify-between items-center">
          <div>
            {currentStep > 0 && (
              <button 
                onClick={handlePrev}
                className="btn btn-outline btn-sm mr-2 pointer-events-auto"
              >
                Back
              </button>
            )}
          </div>
          
          <div className="flex-1 flex justify-center">
            {/* Progress indicators */}
            <div className="flex space-x-1">
              {tourSteps.map((_, index) => (
                <div 
                  key={index} 
                  className={`w-2 h-2 rounded-full ${index === currentStep ? 'bg-primary' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
          
          <div>
            <button 
              onClick={handleSkip}
              className="btn btn-ghost btn-sm mr-2 pointer-events-auto"
            >
              Skip
            </button>
            <button 
              onClick={handleNext}
              className="btn btn-primary btn-sm pointer-events-auto"
            >
              {currentStep < tourSteps.length - 1 ? 'Next' : 'Finish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveTour;

