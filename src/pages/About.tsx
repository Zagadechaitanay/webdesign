import React from "react";

const About = () => {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4">
      {/* Hero Section */}
      <section className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-blue-700">About Digi Gurukul Connect</h1>
        <p className="text-xl text-slate-600 mb-6">Empowering Diploma Engineering Students with Resources, Community, and Support</p>
      </section>

      {/* Mission Statement */}
      <section className="max-w-2xl mx-auto mb-12 bg-blue-50 rounded-2xl shadow-card p-8">
        <h2 className="text-2xl font-bold mb-2 text-blue-700">Our Mission</h2>
        <p className="text-slate-700 text-lg">Digi Gurukul Connect aims to bridge the gap in diploma engineering education by providing easy access to quality study materials, fostering a collaborative student community, and supporting academic and career growth.</p>
      </section>

      {/* Goals & Impact Section */}
      <section className="max-w-3xl mx-auto mb-12 bg-pink-50 rounded-2xl shadow-card p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-pink-600">Our Goals & Impact</h2>
        <p className="text-slate-700 text-lg mb-6">We strive to empower every diploma engineering student with the resources and support they need to succeed. Our platform is growing rapidly and making a real difference in the academic journey of thousands of students.</p>
        {/* Animated User Count */}
        <div className="flex flex-col items-center justify-center mb-4">
          <span className="text-5xl font-extrabold text-blue-700 animate-pulse-slow">10,000+</span>
          <span className="text-lg text-slate-600">Registered Users</span>
        </div>
        <ul className="text-slate-600 text-left mx-auto max-w-xl list-disc pl-6">
          <li>Over 10,000 students supported across 7 branches and 6 semesters</li>
          <li>Hundreds of study materials and resources available for free</li>
          <li>Active community with Q&A, peer support, and regular updates</li>
          <li>Continuous growth and new features based on student feedback</li>
        </ul>
      </section>

      {/* Features List */}
      <section className="max-w-4xl mx-auto mb-12">
        <h2 className="text-2xl font-bold mb-6 text-pink-600 text-center">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-card p-6 border-t-4 border-blue-500">
            <h3 className="font-semibold text-blue-700 mb-2">Study Materials</h3>
            <p className="text-slate-600">Access PDFs, PPTs, and handwritten notes for all branches and semesters.</p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-6 border-t-4 border-pink-500">
            <h3 className="font-semibold text-pink-600 mb-2">Community Support</h3>
            <p className="text-slate-600">Join a vibrant student community for discussions, Q&A, and peer learning.</p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-6 border-t-4 border-blue-500">
            <h3 className="font-semibold text-blue-700 mb-2">Official Notices</h3>
            <p className="text-slate-600">Stay updated with the latest college and exam notices in one place.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-3xl mx-auto mb-12">
        <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Meet the Team</h2>
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
          <div className="bg-blue-50 rounded-xl p-6 flex-1 text-center shadow-card">
            <div className="w-20 h-20 mx-auto rounded-full bg-blue-200 mb-3" />
            <h4 className="font-semibold text-blue-700">Chaitanya Zagade</h4>
            <p className="text-slate-600 text-sm">Founder & Developer</p>
          </div>
          <div className="bg-pink-50 rounded-xl p-6 flex-1 text-center shadow-card">
            <div className="w-20 h-20 mx-auto rounded-full bg-pink-200 mb-3" />
            <h4 className="font-semibold text-pink-600">Yash Pawar</h4>
            <p className="text-slate-600 text-sm">Co-Founder</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About; 