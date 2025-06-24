import React from "react";
import { Lightbulb, ThumbsUp, Send, Users, Brain, Rocket } from "lucide-react";

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-center space-y-10">
      {/* Hero Section */}
      <header>
        <p className="uppercase text-sm font-semibold text-indigo-600 tracking-wide mb-2">
          Learn by Building
        </p>
        <h1 className="text-4xl font-bold text-gray-800 tracking-tight leading-tight">
          Learn AI. Build Real Products. <br /> Create a{" "}
          <span className="text-indigo-600">True Narrative</span>.
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto mt-4">
          TrueNarrative is a live, collaborative platform where developers,
          product managers, and students build AI-powered features in a real
          product environment. Learn by doing, ship real features, and help
          shape what comes next.
        </p>
      </header>

      {/* Features Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
        <Feature
          icon={<Rocket className="w-6 h-6 text-indigo-600" />}
          title="Software with AI Course"
          text="Developers implement real features using modern AI frameworks — in a shared, working product."
        />
        <Feature
          icon={<Brain className="w-6 h-6 text-indigo-600" />}
          title="Product with AI Course"
          text="PMs define, evaluate, and prioritize AI-driven ideas that solve real-world problems."
        />
        <Feature
          icon={<Users className="w-6 h-6 text-indigo-600" />}
          title="Live Product Community"
          text="This is not a sandbox. Your ideas and code go live — and real users help test what you build."
        />
        <Feature
          icon={<Lightbulb className="w-6 h-6 text-indigo-600" />}
          title="Idea Sharing"
          text="Students, mentors, and users submit and explore new feature ideas collaboratively."
        />
        <Feature
          icon={<ThumbsUp className="w-6 h-6 text-indigo-600" />}
          title="Crowd Voting"
          text="Vote on ideas, prioritize the roadmap, and shape what gets built together."
        />
        <Feature
          icon={<Send className="w-6 h-6 text-indigo-600" />}
          title="Launch with Confidence"
          text="Track progress, get feedback, and ship features with full visibility."
        />
      </section>

      {/* Call to Action */}
      <div className="pt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
        <a
          href="https://www.tickettailor.com/events/agileforhumansllc/1754402"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          🎓 Join the Next Cohort
        </a>
        <a
          href="https://github.com/agiletodd/TrueNarrative.io"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-100 transition"
        >
          ⭐ View the Code on GitHub
        </a>
      </div>
    </main>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="bg-white rounded-lg p-5 shadow border border-gray-100 flex items-start space-x-4">
      <div className="mt-1" aria-hidden="true">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-500 text-sm">{text}</p>
      </div>
    </div>
  );
}
