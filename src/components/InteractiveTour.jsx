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
  const [originalScrollPosition, setOriginalScrollPosition] = useState(0);
  
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

  // Add posting tour steps
  const postingTourSteps = [
    {
      title: "Create a Post",
      description: "Welcome to the posting tour! Let's learn how to share your pet's adventures with the community.",
      location: "center",
      image: "cat",
      route: "/in/home",
      targetSelector: null
    },
    {
      title: "New Post Button",
      description: "Click this button to start creating a new post about your pet.",
      location: "post",
      image: "dog",
      route: "/in/home",
      targetSelector: ".new-post-button, button:has(.IoMdAddCircleOutline), button:contains('New Post')"
    },
    {
      title: "Post Title",
      description: "Give your post a catchy title that describes what you're sharing.",
      location: "input",
      image: "cat",
      route: "/in/home",
      targetSelector: "input[placeholder*='Title'], input[name='title']"
    },
    {
      title: "Post Content",
      description: "Share details about your pet's adventure or ask questions to the community.",
      location: "textarea",
      image: "dog",
      route: "/in/home",
      targetSelector: "textarea, [contenteditable='true']"
    },
    {
      title: "Add Images",
      description: "Make your post more engaging by adding cute photos of your pet!",
      location: "image",
      image: "cat",
      route: "/in/home",
      targetSelector: "button:has(.CiImageOn), button:has(.IoMdImage)"
    },
    {
      title: "Set Severity",
      description: "Indicate how urgent or important your post is to help others prioritize.",
      location: "slider",
      image: "dog",
      route: "/in/home",
      targetSelector: "input[type='range'], .severity-slider"
    },
    {
      title: "Submit Post",
      description: "When you're ready, click this button to share your post with the community!",
      location: "button",
      image: "cat",
      route: "/in/home",
      targetSelector: "button[type='submit'], button:contains('Post')"
    },
    {
      title: "All Done!",
      description: "Great job! Now you know how to create posts and share your pet's journey with the community.",
      location: "center",
      image: "dog",
      route: "/in/home",
      targetSelector: null
    }
  ];

  const profileTourSteps = [
    {
      title: "Profile Page Tour",
      description: "Welcome to your profile page! Let's explore how to customize your profile and manage your pets.",
      location: "center",
      image: "cat",
      route: "/in/profile",
      targetSelector: null
    },
    {
      title: "Your Profile Information",
      description: "This section shows your profile picture, name, and bio. It's how other pet owners will see you!",
      location: "profile",
      image: "dog",
      route: "/in/profile",
      targetSelector: "img[src*='profilePic'], img[alt='Profile']"
    },
    {
      title: "Edit Profile",
      description: "Click this button to update your profile information, including your name, handle, and bio.",
      location: "button",
      image: "cat",
      route: "/in/profile",
      targetSelector: "#profilePicUpload"
    },
    {
      title: "Your Pets",
      description: "Here you can see all your pets. You can add new pets or edit existing ones.",
      location: "pets",
      image: "dog",
      route: "/in/profile",
      targetSelector: "div:has(> h1:contains('Your Pets')), div:has(> h2:contains('Your Pets'))"
    },
    {
      title: "Add a New Pet",
      description: "Click this button to add information about a new pet to your profile.",
      location: "button",
      image: "cat",
      route: "/in/profile",
      targetSelector: "button:has(.IoMdAddCircleOutline), button:contains('Add Pet')"
    },
    {
      title: "Your Posts",
      description: "This section shows all the posts you've shared with the community.",
      location: "posts",
      image: "dog",
      route: "/in/profile",
      targetSelector: "div:has(> h1:contains('Your Posts')), div:has(> h2:contains('Your Posts'))"
    },
    {
      title: "All Done!",
      description: "Great job! Now you know how to manage your profile and pets. Happy connecting!",
      location: "center",
      image: "cat",
      route: "/in/profile",
      targetSelector: null
    }
  ];

  // Memoize tour steps to prevent unnecessary re-renders
  const tourSteps = React.useMemo(() => {
    switch (tourType) {
      case 'messaging':
        return messagingTourSteps;
      case 'posting':
        return postingTourSteps;
      case 'profile':
        return profileTourSteps;
      case 'general':
      default:
        return generalTourSteps;
    }
  }, [tourType]);

  // Navigate to the correct route for each step
  useEffect(() => {
    let isMounted = true;
    
    // Store original scroll position and disable scrolling when tour starts
    if (currentStep === 0) {
      setOriginalScrollPosition(window.scrollY);
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0);
    }
    
    if (tourSteps[currentStep]?.route) {
      const currentPath = window.location.pathname;
      const targetRoute = tourSteps[currentStep].route;
      
      // Only navigate if we're not already on the correct route
      if (currentPath !== targetRoute) {
        navigate(targetRoute);
        // Ensure we're at the top of the page after navigation
        window.scrollTo(0, 0);
      }
    }
    
    return () => {
      isMounted = false;
      // Re-enable scrolling when component unmounts
      if (currentStep === tourSteps.length - 1) {
        document.body.style.overflow = '';
        window.scrollTo(0, originalScrollPosition);
      }
    };
  }, [currentStep, navigate, tourSteps, originalScrollPosition]);

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
      
      for (const selector of selectors) {
        try {
          const element = document.querySelector(selector);
          if (element) {
            targetElement = element;
            break;
          }
        } catch (error) {
          console.error(`Invalid selector: ${selector}`, error);
        }
      }
      
      // Special case handling for navigation step
      if (tourType === 'general' && (currentStep === 4 || currentStep === 5)) {
        // Try more specific selectors for the navigation
        targetElement = document.querySelector('.fixed.z-10') || 
                        document.querySelector('nav') ||
                        document.querySelector('.sidenav') ||
                        document.querySelector('div[class*="fixed z-10"]');
                        
        // If we found the nav element
        if (targetElement && isMounted) {
          const rect = targetElement.getBoundingClientRect();
          
          // Only update if we have valid dimensions
          if (rect.width > 0 && rect.height > 0) {
            // Use fixed positioning for the nav highlight
            setHighlightPosition({
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: Math.min(rect.height, window.innerHeight * 0.8), // Limit height
              fixed: true // Mark as fixed position
            });
            
            // Clear the interval once we've found the element
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }
            return;
          }
        }
      }
      
      // Handle other elements normally
      if (targetElement && isMounted) {
        const rect = targetElement.getBoundingClientRect();
        
        // Only update if we have valid dimensions
        if (rect.width > 0 && rect.height > 0) {
          setHighlightPosition({
            top: rect.top + window.scrollY,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            fixed: false
          });
          
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
      
      // Special case for navigation bar in general tour (steps 4 and 5)
      if (tourType === 'general' && (currentStep === 4 || currentStep === 5)) {
        // For mobile (bottom nav bar)
        if (window.innerWidth <= 1024) { // lg breakpoint in Tailwind
          // Position tooltip above the bottom nav bar
          top = windowHeight - highlightPosition.height - tooltipRect.height - 20;
          left = windowWidth / 2 - tooltipRect.width / 2;
        } else {
          // For desktop (side nav bar)
          left = highlightPosition.left + highlightPosition.width + 20;
          top = Math.min(
            windowHeight - tooltipRect.height - 20,
            highlightPosition.top + (highlightPosition.height / 2) - (tooltipRect.height / 2)
          );
        }
      } else {
        // Default positioning for other steps
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
      }
      
      // Use direct DOM manipulation to avoid React re-renders
      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
      tooltip.style.transform = 'none'; // Remove the default transform
      tooltip.style.zIndex = '9999'; // Ensure tooltip is above everything
      tooltip.style.opacity = '1'; // Make sure tooltip is visible
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
      document.body.style.overflow = '';
      window.scrollTo(0, originalScrollPosition);
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
    document.body.style.overflow = '';
    window.scrollTo(0, originalScrollPosition);
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
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 overflow-hidden">
      {/* Highlight overlay */}
      {highlightPosition && (
        <div
          className="absolute rounded-lg ring-4 ring-primary pointer-events-none animate-tourPulse shadow-tourHighlight transition-all duration-300 ease-out-expo brightness-125"
          style={{
            top: highlightPosition.top,
            left: highlightPosition.left,
            width: highlightPosition.width,
            height: highlightPosition.height,
            position: highlightPosition.fixed ? 'fixed' : 'absolute',
            zIndex: 9998
          }}
        />
      )}
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute bg-base-100 p-4 rounded-xl shadow-xl max-w-md w-full z-[9999] pointer-events-auto transition-all duration-500 ease-out-expo"
        style={{
          position: 'fixed',
          zIndex: 9999
        }}
      >
        {/* Tooltip content */}
        <div className="flex items-center gap-4 mb-4">
          {renderImage()}
          <h3 className="text-xl font-bold">{tourSteps[currentStep]?.title}</h3>
        </div>
        
        <p className="mb-4">{tourSteps[currentStep]?.description}</p>
        
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

