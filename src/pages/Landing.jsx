import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface-50 text-surface-900 flex flex-col relative overflow-hidden font-sans">
      {/* Header */}
      <header className="px-8 py-8 flex items-center justify-between relative z-10 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-surface-300 bg-white flex items-center justify-center text-surface-900 font-bold shadow-minimal">
            M
          </div>
          <span className="font-semibold text-lg tracking-tight">
            Mind Over Money
          </span>
        </div>
        <Link 
          to="/signin"
          className="text-sm font-medium text-surface-600 hover:text-surface-900 transition"
        >
          Sign In
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 text-center -mt-16">
        <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight mb-8 text-surface-900 leading-none">
          Understand before <br />
          you invest.
        </h1>
        
        <p className="text-lg md:text-xl text-surface-600 max-w-2xl mb-12 font-medium leading-relaxed">
          The ultimate educational platform for first-time investors. Learn financial concepts, assess risks, and practice investing in a zero-risk sandbox.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            to="/signup"
            className="flex items-center justify-center gap-2 bg-surface-900 hover:bg-surface-800 text-white px-8 py-4 rounded-full font-medium text-lg transition shadow-minimal group min-w-[200px]"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform stroke-[1.5]" />
          </Link>
          <Link
            to="/signin"
            className="flex items-center justify-center gap-2 bg-white hover:bg-surface-100 border border-surface-200 text-surface-900 px-8 py-4 rounded-full font-medium text-lg transition shadow-minimal min-w-[200px]"
          >
            Sign In
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="mt-24 flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 bg-white border border-surface-200 px-5 py-2.5 rounded-full text-sm font-medium text-surface-700 shadow-minimal">
            <span className="text-surface-400 font-serif text-lg leading-none mt-1">*</span>
            Learn First
          </div>
          <div className="flex items-center gap-2 bg-white border border-surface-200 px-5 py-2.5 rounded-full text-sm font-medium text-surface-700 shadow-minimal">
            <span className="text-surface-400 font-serif text-lg leading-none mt-1">*</span>
            Practice Safely
          </div>
          <div className="flex items-center gap-2 bg-white border border-surface-200 px-5 py-2.5 rounded-full text-sm font-medium text-surface-700 shadow-minimal">
            <span className="text-surface-400 font-serif text-lg leading-none mt-1">*</span>
            Decide with Confidence
          </div>
        </div>
      </main>
    </div>
  );
}
