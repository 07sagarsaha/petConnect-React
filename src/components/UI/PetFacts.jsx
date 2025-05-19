import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiOutlineInfoCircle, AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaCat, FaDog, FaDove, FaFish, FaHorse } from "react-icons/fa6";
import { GiRabbit } from "react-icons/gi";

const PetFacts = () => {
  const [petFacts, setPetFacts] = useState([]);
  const [isLoadingFacts, setIsLoadingFacts] = useState(true);
  const [error, setError] = useState(null);
  const ANIMALS_API_KEY = import.meta.env.VITE_NINJAS_API_KEY;

  const petTypes = {
    cat: { icon: FaCat, name: "Cat" },
    dog: { icon: FaDog, name: "Dog" },
    bird: { icon: FaDove, name: "Bird" },
    fish: { icon: FaFish, name: "Fish" },
    rabbit: { icon: GiRabbit, name: "Rabbit" },
    horse: { icon: FaHorse, name: "Horse" },
  };

  useEffect(() => {
    const fetchPetFacts = async () => {
      setIsLoadingFacts(true);
      try {
        // Get facts for multiple animals
        const animals = ["cat", "dog", "bird", "fish", "rabbit", "horse"];
        const factsPromises = animals.map((animal) =>
          axios.get(`https://api.api-ninjas.com/v1/animals?name=${animal}`, {
            headers: { "X-Api-Key": ANIMALS_API_KEY },
          })
        );

        const responses = await Promise.all(factsPromises);
        const facts = responses.flatMap((response, index) => {
          const animal = animals[index];
          return response.data
            .map((animalData) => ({
              id: Math.random(),
              type: animal,
              content: generateFact(animalData),
            }))
            .slice(0, 2); // Get 2 facts per animal
        });

        // Shuffle the facts
        const shuffledFacts = facts.sort(() => Math.random() - 0.5);
        setPetFacts(shuffledFacts.slice(0, 8)); // Show only 8 facts total
      } catch (err) {
        console.error("Error fetching pet facts:", err);
        setError("Failed to load pet facts");
        // Fallback facts
        setPetFacts([
          {
            id: 1,
            type: "cat",
            content: "Cats can jump up to six times their length.",
          },
          {
            id: 2,
            type: "dog",
            content:
              "Dogs have a sense of time and can differentiate between 5 minutes and 2 hours.",
          },
          {
            id: 3,
            type: "bird",
            content:
              "Parrots can mimic human speech and understand over 100 words.",
          },
          {
            id: 4,
            type: "fish",
            content:
              "Goldfish can remember things for months, despite popular belief about their short memory.",
          },
          {
            id: 5,
            type: "rabbit",
            content:
              "Rabbits can see behind themselves without turning their heads.",
          },
          {
            id: 6,
            type: "hamster",
            content:
              "Hamsters can run up to 8 miles at night using their exercise wheel.",
          },
        ]);
      } finally {
        setIsLoadingFacts(false);
      }
    };

    const generateFact = (animalData) => {
      // Create interesting facts from the API data
      const facts = [
        animalData.characteristics?.diet &&
          `Diet: ${animalData.characteristics.diet}`,
        animalData.characteristics?.habitat &&
          `Habitat: ${animalData.characteristics.habitat}`,
        animalData.characteristics?.lifespan &&
          `Lifespan: ${animalData.characteristics.lifespan}`,
        animalData.characteristics?.behavior &&
          `Behavior: ${animalData.characteristics.behavior}`,
      ].filter(Boolean);

      return (
        facts[Math.floor(Math.random() * facts.length)] ||
        "This pet makes a wonderful companion!"
      );
    };

    fetchPetFacts();

    // Refresh facts every 10 minutes
    const interval = setInterval(fetchPetFacts, 600000);
    return () => clearInterval(interval);
  }, []);

  const getFactIcon = (type) => {
    const petType = petTypes[type] || petTypes.dog;
    const Icon = petType.icon;
    return <Icon className="text-lg text-primary" />;
  };

  return (
    <>
      {/* Pet Facts section - only visible on large screens */}
      <div className="hidden lg:block lg:w-1/3">
        <div className="bg-base-100 rounded-lg shadow-lg p-6 fixed top-4 z-0 right-4 w-[26%] lg:h-[96vh] border-2 border-base-300">
          <div className="flex items-center gap-2 mb-4">
            <AiOutlineInfoCircle className="text-2xl text-primary" />
            <h2 className="text-xl font-semibold text-primary">
              {"Pet Facts"}
            </h2>
          </div>

          {isLoadingFacts ? (
            <div className="flex justify-center p-4">
              <AiOutlineLoading3Quarters className="animate-spin text-2xl text-base-content" />
            </div>
          ) : error ? (
            <div className="text-error p-4 text-center">{error}</div>
          ) : (
            <div className="flex flex-col justify-between gap-4 overflow-y-auto">
              {petFacts.map((fact) => (
                <div
                  key={fact.id}
                  className="bg-base-200 p-4 rounded-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {getFactIcon(fact.type)}
                    <h3 className="text-base-content font-bold capitalize">
                      {petTypes[fact.type]?.name || "Pet"} Fact
                    </h3>
                  </div>
                  <p className="text-sm text-base-content">{fact.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PetFacts;
