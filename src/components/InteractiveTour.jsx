import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import cat from "../Assets/cat.png";
import dog from "../Assets/dog.png";
import { useTour } from "../context/TourContext";

const InteractiveTour = ({ onClose, tourType = "general" }) => {
  const { currentStep, setCurrentStep, endTour } = useTour();
  const navigate = useNavigate();
  const tooltipRef = useRef(null);
  const [highlightPosition, setHighlightPosition] = useState(null);
  
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
      description: "This is your home feed where you can see posts from other pet owners. You can like, comment, and interact with the community here!",
      location: "feed",
      image: "dog",
      route: "/in/home",
      targetSelector: ".post-feed-container"
    },
    {
      title: "Create a Post",
      description: "Share your pet's adventures by creating posts! Click the 'New Post' button to share photos and stories.",
      location: "post",
      image: "cat",
      route: "/in/home",
      targetSelector: ".new-post-button"
    },
    {
      title: "Your Profile",
      description: "This is your profile page where you can add information about yourself and your pets!",
      location: "profile",
      image: "dog",
      route: "/in/profile",
      targetSelector: ".profile-container"
    },
    {
      title: "Add Your Pets",
      description: "Don't forget to add your furry friends to your profile! Click 'Add Pet' to get started.",
      location: "pets",
      image: "cat",
      route: "/in/profile",
      targetSelector: ".add-pet-button"
    },
    {
      title: "Messages",
      description: "Connect with other pet owners through our messaging feature!",
      location: "messages",
      image: "dog",
      route: "/in/messages",
      targetSelector: ".messages-container"
    },
    {
      title: "AI Chat",
      description: "Have questions about pet care? Our AI assistant is here to help!",
      location: "ai",
      image: "cat",
      route: "/in/ai-chat",
      targetSelector: ".ai-chat-container"
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

  const messagingTourSteps = [
    {
      title: "Sending Your First Message",
      description: "Let me show you how to connect with other pet owners through messages!",
      location: "center",
      image: "cat",
      route: "/in/messages",
      targetSelector: null
    },
    {
      title: "Start a Conversation",
      description: "Click the 'Start a Conversation' button to begin messaging another pet owner.",
      location: "messages-new",
      image: "dog",
      route: "/in/messages",
      targetSelector: ".start-conversation-button"
    },
    {
      title: "Find a User",
      description: "Search for users by name or handle to start a conversation with them.",
      location: "messages-search",
      image: "cat",
      route: "/in/messages",
      targetSelector: ".user-search-input"
    },
    {
      title: "Send a Message",
      description: "Type your message and hit send to start the conversation!",
      location: "messages-send",
      image: "dog",
      route: "/in/messages",
      targetSelector: ".message-input"
    }
  ];

  const postingTourSteps = [
    {
      title: "Creating Your First Post",
      description: "Let me show you how to share your pet's adventures with the community!",
      location: "center",
      image: "dog",
      route: "/in/home",
      targetSelector: null
    },
    {
      title: "New Post Button",
      description: "Click the 'New Post' button to start creating your post.",
      location: "post-button",
      image: "cat",
      route: "/in/home",
      targetSelector: ".new-post-button"
    },
    {
      title: "Add a Title",
      description: "Give your post a catchy title that describes what you're sharing.",
      location: "post-title",
      image: "dog",
      route: "/in/home",
      targetSelector: ".post-title-input"
    },
    {
      title: "Write Content",
      description: "Share your story or experience in the content area.",
      location: "post-content",
      image: "cat",
      route: "/in/home",
      targetSelector: ".post-content-input"
    },
    {
      title: "Add an Image",
      description: "Click the image icon to upload a photo of your pet.",
      location: "post-image",
      image: "dog",
      route: "/in/home",
      targetSelector: ".post-image-upload"
    },
    {
      title: "Set Severity",
      description: "If you're asking for help, set the severity level to indicate urgency.",
      location: "post-severity",
      image: "cat",
      route: "/in/home",
      targetSelector: ".post-severity-slider"
    },
    {
      title: "Submit Post",
      description: "Click 'Post' to share your content with the community!",
      location: "post-submit",
      image: "dog",
      route: "/in/home",
      targetSelector: ".post-submit-button"
    }
  ];

  const profileEditTourSteps = [
    {
      title: "Editing Your Profile",
      description: "Let me show you how to personalize your profile!",
      location: "center",
      image: "cat",
      route: "/in/profile",
      targetSelector: null
    },
    {
      title: "Edit Profile Button",
      description: "Click the 'Edit Profile' button to start making changes.",
      location: "profile-edit-button",
      image: "dog",
      route: "/in/profile",
      targetSelector: ".edit-profile-button"
    },
    {
      title: "Update Your Name",
      description: "Change your display name to what you'd like others to see.",
      location: "profile-name",
      image: "cat",
      route: "/in/profile",
      targetSelector: ".profile-name-input"
    },
    {
      title: "Set Your Handle",
      description: "Your handle is your unique username on PetConnect.",
      location: "profile-handle",
      image: "dog",
      route: "/in/profile",
      targetSelector: ".profile-handle-input"
    },
    {
      title: "Write Your Bio",
      description: "Tell the community about yourself and your pets!",
      location: "profile-bio",
      image: "cat",
      route: "/in/profile",
      targetSelector: ".profile-bio-input"
    },
    {
      title: "Change Profile Picture",
      description: "Upload a new profile picture by clicking on your current photo.",
      location: "profile-picture",
      image: "dog",
      route: "/in/profile",
      targetSelector: ".profile-picture-container"
    },
    {
      title: "Save Changes",
      description: "Don't forget to save your changes when you're done!",
      location: "profile-save",
      image: "cat",
      route: "/in/profile",
      targetSelector: ".profile-save-button"
    }
  ];

  // Select the appropriate tour steps based on tour type
  const getTourSteps = () => {
    switch(tourType) {
      case "messaging":
        return messagingTourSteps;
      case "posting":
        return postingTourSteps;
      case "profile":
        return profileEditTourSteps;
      default:
        return generalTourSteps;
    }
  };

  const tourSteps = getTourSteps();

  // Handle navigation when step changes
  useEffect(() => {
    const goToRoute = () => {
      const targetRoute = tourSteps[currentStep].route;
      console.log("Navigating to:", targetRoute);
      navigate(targetRoute);
    };
    
    // Use setTimeout to ensure the navigation happens after render
    const timer = setTimeout(goToRoute, 100);
    return () => clearTimeout(timer);
  }, [currentStep, navigate, tourSteps]);

  // Find and highlight the target element
  useEffect(() => {
    const findTargetElement = () => {
      const targetSelector = tourSteps[currentStep].targetSelector;
      if (!targetSelector) {
        setHighlightPosition(null);
        return;
      }

      const targetElement = document.querySelector(targetSelector);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setHighlightPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });

        // Position the tooltip relative to the target element
        if (tooltipRef.current) {
          const tooltipRect = tooltipRef.current.getBoundingClientRect();
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;
          
          // Calculate optimal position
          let tooltipTop, tooltipLeft;
          
          // Try to position below the element first
          if (rect.bottom + tooltipRect.height + 20 < windowHeight) {
            tooltipTop = rect.bottom + 10;
            tooltipLeft = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
          } 
          // Otherwise try above
          else if (rect.top - tooltipRect.height - 20 > 0) {
            tooltipTop = rect.top - tooltipRect.height - 10;
            tooltipLeft = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
          }
          // Otherwise position to the side
          else {
            tooltipTop = Math.max(10, rect.top);
            if (rect.right + tooltipRect.width + 20 < windowWidth) {
              tooltipLeft = rect.right + 10;
            } else {
              tooltipLeft = rect.left - tooltipRect.width - 10;
            }
          }
          
          // Ensure tooltip stays within viewport
          tooltipLeft = Math.max(10, Math.min(windowWidth - tooltipRect.width - 10, tooltipLeft));
          tooltipTop = Math.max(10, Math.min(windowHeight - tooltipRect.height - 10, tooltipTop));
          
          tooltipRef.current.style.top = `${tooltipTop}px`;
          tooltipRef.current.style.left = `${tooltipLeft}px`;
          tooltipRef.current.style.position = 'fixed';
          tooltipRef.current.style.transform = 'none';
        }
      } else {
        setHighlightPosition(null);
      }
    };

    // Wait for the DOM to update after navigation
    const timer = setTimeout(findTargetElement, 500);
    
    // Set up a periodic check for the target element
    const interval = setInterval(findTargetElement, 1000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [currentStep, tourSteps]);

  const handleNext = () => {
    console.log("Next clicked, current step:", currentStep);
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      endTour();
      onClose();
    }
  };

  const handlePrevious = () => {
    console.log("Previous clicked, current step:", currentStep);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    console.log("Skip clicked");
    endTour();
    onClose();
  };

  // Determine which mascot image to show
  const renderMascot = () => {
    const { image } = tourSteps[currentStep];
    
    if (image === "cat") {
      return <img src={cat} alt="Cat mascot" className="w-16 h-16 object-contain" />;
    } else {
      return <img src={dog} alt="Dog mascot" className="w-16 h-16 object-contain" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 pointer-events-auto">
      {/* Highlight for the target element */}
      {highlightPosition && (
        <div 
          className="absolute border-4 border-primary rounded-lg pointer-events-none z-[10000] animate-pulse"
          style={{
            top: highlightPosition.top + 'px',
            left: highlightPosition.left + 'px',
            width: highlightPosition.width + 'px',
            height: highlightPosition.height + 'px',
            position: 'fixed'
          }}
        />
      )}
      
      {/* Tour popup */}
      <div 
        ref={tooltipRef}
        className={`bg-base-100 p-6 rounded-xl shadow-xl w-80 max-w-[90vw] transition-all duration-500 ease-in-out ${!highlightPosition ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}`}
        style={{ zIndex: 10001 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-primary">{tourSteps[currentStep].title}</h3>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={handleSkip}
          >
            ✕
          </button>
        </div>
        
        <div className="flex items-center mb-4">
          {renderMascot()}
          <p className="ml-4 text-sm">{tourSteps[currentStep].description}</p>
        </div>
        
        <div className="flex justify-between mt-4">
          <button 
            className="btn btn-sm btn-outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </button>
          
          <div>
            <button 
              className="btn btn-sm btn-outline mr-2"
              onClick={handleSkip}
            >
              Skip
            </button>
            <button 
              className="btn btn-sm btn-primary"
              onClick={handleNext}
            >
              {currentStep === tourSteps.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
        
        <div className="flex justify-center mt-4">
          <div className="flex space-x-1">
            {tourSteps.map((_, index) => (
              <div 
                key={index}
                className={`w-2 h-2 rounded-full ${index === currentStep ? 'bg-primary' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveTour;

