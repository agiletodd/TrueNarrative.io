import React from "react";
import { Lightbulb, MessageSquare, ThumbsUp, Send } from "lucide-react";

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-center space-y-10">
      <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
        Welcome to <span className="text-indigo-600">TrueNarrative</span>
      </h1>
      <p className="text-lg text-gray-600 max-w-xl mx-auto">
        TrueNarrative helps teams gather, vote on, and discuss ideas that matter
        most. Whether you're shipping a new product or refining your roadmap, we
        make feedback visible and actionable.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
        <Feature
          icon={<Lightbulb className="w-6 h-6 text-indigo-600" />}
          title="Share Ideas"
          text="Users can easily suggest new features, improvements, or pain points."
        />
        <Feature
          icon={<ThumbsUp className="w-6 h-6 text-indigo-600" />}
          title="Vote on What Matters"
          text="Quick up/down voting helps highlight what resonates across your team or user base."
        />
        <Feature
          icon={<MessageSquare className="w-6 h-6 text-indigo-600" />}
          title="Start Conversations"
          text="Comment threads keep feedback collaborative and context-rich."
        />
        <Feature
          icon={<Send className="w-6 h-6 text-indigo-600" />}
          title="Drive Action"
          text="Track progress and close the loop with those who care most."
        />
      </div>

      <div className="pt-10">
        <a
          href="/register"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          Get Started for Free
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
