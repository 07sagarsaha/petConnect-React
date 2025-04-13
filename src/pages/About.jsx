import React from "react";

function About() {
  return (
    <div className="flex flex-col w-full p-4 bg-base-200 text-primary-focus items-center">
      <div className="w-full max-w-4xl bg-base-100 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-4 text-primary">About Us</h1>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-primary">
            Introduction to the Platform
          </h2>
          <p>
            Welcome to our platform! We are a team of final-year Computer
            Science students who’ve come together to create a space where
            technology meets passion. Whether you're here to explore, connect,
            or learn, our website is built to make your experience seamless and
            enjoyable.
          </p>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-primary">
            Mission Statement
          </h2>
          <p>
            Our mission is to bridge gaps and bring people closer through
            innovative technology, delivering user-centric solutions while
            constantly pushing our boundaries as budding software engineers.
          </p>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-primary">
            Features and Offerings
          </h2>
          <ul className="list-disc list-inside">
            <li>
              Interactive User Experience: Smooth navigation and an intuitive
              interface tailored to your needs.
            </li>
            <li>
              Robust Functionality: Scalable and reliable features that ensure
              efficiency and performance.
            </li>
            <li>
              Future-Proof Solutions: Built with adaptability in mind to
              accommodate evolving trends and user demands.
            </li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-primary">
            Why It’s Special
          </h2>
          <p>
            What makes this platform unique is the story behind its creation.
            Each feature and design element reflects not just technical skill
            but also the passion and determination of a young, dynamic team
            working together to bring this vision to life.
          </p>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-primary">
            The Inspiration Behind the Platform
          </h2>
          <p>
            This project began as a shared dream among three Computer Science
            students:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card w-full bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <h2 className="card-title">Sagar Saha</h2>
                <p>Developer & Team Lead</p>
                <p>Passionate about building scalable and user-friendly applications.</p>
              </div>
            </div>
            <div className="card w-full bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <h2 className="card-title">Shubham Chakraborty</h2>
                <p>Developer</p>
                <p>Focused on creating efficient and maintainable code.</p>
              </div>
            </div>
            <div className="card w-full bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <h2 className="card-title">Rajdeep Majumdar</h2>
                <p>Developer</p>
                <p>Dedicated to delivering high-quality and innovative solutions.</p>
              </div>
            </div>
          </div>
          <p>
            Our goal was to design something meaningful, impactful, and scalable
            while challenging ourselves to apply the knowledge and creativity
            we’ve cultivated over the years.
          </p>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-primary">
            Commitment to Pets and Owners
          </h2>
          <p>
            "Our commitment extends to every pet and owner who visits our
            platform. We aim to provide resources, tools, and a community to
            support and celebrate the bond between pets and their families."
          </p>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-primary">
            Contact Information
          </h2>
          <p>
            We value your feedback and would love to hear from you! Reach out to
            us with your thoughts, suggestions, or questions.
          </p>
          <ul className="list-none">
            <li>📧 Email: [your email]</li>
            <li>📱 Phone: [your phone number]</li>
            <li>🌐 Social Media: [your links]</li>
          </ul>
        </section>
        <p>
          Thank you for supporting our journey. Together, we’re building a
          platform that inspires and empowers!
        </p>
      </div>
    </div>
  );
}

export default About;
