import React from "react";
import {
  Lightbulb,
  MessageSquare,
  ThumbsUp,
  Send,
  Users,
  Brain,
  Rocket,
} from "lucide-react";

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-center space-y-10">
      <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
        Learn AI. Build Products. <br /> Create a{" "}
        <span className="text-indigo-600">True Narrative</span>
      </h1>
      <p className="text-lg text-gray-600 max-w-xl mx-auto">
        TrueNarrative is a one-of-a-kind platform where students, developers,
        and product managers collaborate to build AI-powered products in real
        time. Learn by doing, launch something real, and help shape what comes
        next.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
        <Feature
          icon={<Rocket className="w-6 h-6 text-indigo-600" />}
          title="Building Software with AI Course"
          text="Developers dive into building features using AI frameworks directly in our live product environment."
        />
        <Feature
          icon={<Brain className="w-6 h-6 text-indigo-600" />}
          title="Product Management with AI Course"
          text="Product managers learn to define, evaluate, and prioritize AI-driven ideas that solve real problems."
        />
        <Feature
          icon={<Users className="w-6 h-6 text-indigo-600" />}
          title="Live Product Community"
          text="Your work doesn't stay in the classroom — it ships. Real users test and validate what you build."
        />
        <Feature
          icon={<Lightbulb className="w-6 h-6 text-indigo-600" />}
          title="Idea Sharing"
          text="Contributors and users suggest and explore what's worth building next."
        />
        <Feature
          icon={<ThumbsUp className="w-6 h-6 text-indigo-600" />}
          title="Crowd Voting"
          text="Vote on the best ideas to shape the roadmap together."
        />
        <Feature
          icon={<Send className="w-6 h-6 text-indigo-600" />}
          title="Launch with Confidence"
          text="Track progress and ship features with real visibility."
        />
      </div>

      <div className="pt-10">
        <a
          href="/register"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          Join the Next Cohort
        </a>
      </div>
    </main>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="bg-white rounded-lg p-5 shadow border border-gray-100 flex items-start space-x-4">
      <div className="mt-1">{icon}</div>
      <div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-500 text-sm">{text}</p>
      </div>
    </div>
  );
}
