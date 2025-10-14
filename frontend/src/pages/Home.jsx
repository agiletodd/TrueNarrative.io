import React from "react";
import { Lightbulb, ThumbsUp, Send, Users, Brain, Rocket } from "lucide-react";

export default function Home() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16 text-center space-y-12">
      {/* Hero Section */}
      <header>
        <p className="uppercase text-sm font-semibold text-indigo-600 tracking-wide mb-2">
          Product Feedback Platform
        </p>
        <h1 className="text-4xl font-bold text-gray-800 tracking-tight leading-tight">
          Capture Ideas. Gather Feedback. <br /> Shape Better Products with{" "}
          <span className="text-indigo-600">True Narrative</span>.
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-4">
          TrueNarrative helps product teams collect and prioritize user
          feedback. Create products, gather ideas from your community, and let
          users vote on what matters most. Built for transparency and
          collaboration.
        </p>
      </header>

      {/* Current Features Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Current Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
          <Feature
            icon={<Users className="w-6 h-6 text-indigo-600" />}
            title="User Authentication"
            text="Secure email-based registration and login system. Users can create accounts, log in, and manage their sessions."
          />
          <Feature
            icon={<Rocket className="w-6 h-6 text-indigo-600" />}
            title="Product Management"
            text="Create and manage multiple products. Each product owner can add, edit, and delete their products with unique shareable links."
          />
          <Feature
            icon={<Lightbulb className="w-6 h-6 text-indigo-600" />}
            title="Idea Submission"
            text="Users can submit feature ideas for any product. Each idea includes a title and description, automatically tracked by submission date."
          />
          <Feature
            icon={<ThumbsUp className="w-6 h-6 text-indigo-600" />}
            title="Voting System"
            text="Community members can vote ideas up or down. Vote counts are tracked per user to prevent duplicate voting on the same idea."
          />
          <Feature
            icon={<Send className="w-6 h-6 text-indigo-600" />}
            title="Idea Status Tracking"
            text="Ideas can be categorized as New, Done, or Retired. Product owners can filter and view ideas by status."
          />
          <Feature
            icon={<Brain className="w-6 h-6 text-indigo-600" />}
            title="Admin Dashboard"
            text="Administrators can view platform statistics including user counts, idea metrics, vote statistics, and top contributors."
          />
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="bg-gray-50 rounded-lg p-8 text-left">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Technical Implementation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Frontend</h3>
            <ul className="text-gray-600 text-sm space-y-1">
              <li>React with Vite for fast development</li>
              <li>Tailwind CSS for responsive styling</li>
              <li>React Router for navigation</li>
              <li>Context API for authentication state</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Backend</h3>
            <ul className="text-gray-600 text-sm space-y-1">
              <li>Express.js REST API</li>
              <li>Prisma ORM with SQLite/PostgreSQL</li>
              <li>JWT authentication</li>
              <li>Role-based access control</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {/* <div className="pt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
        <a
          href="https://github.com/agiletodd/TrueNarrative.io"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          View the Code on GitHub
        </a>
      </div> */}
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
