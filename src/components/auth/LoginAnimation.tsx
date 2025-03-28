
import { AnimatedAgents } from "../ui/animated-agents";

export const LoginAnimation = () => {
  return (
    <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <AnimatedAgents />
      </div>
      <div className="relative z-10 p-12 flex flex-col justify-center items-center w-full">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4 animate-fade-in">
            Willkommen bei IntellyWave
          </h1>
          <p className="text-xl text-blue-100 mb-8 animate-fade-in">
            Ihre intelligente Plattform für Business Intelligence und Analytics
          </p>
          <div className="animate-pulse mt-12">
            <svg
              className="w-24 h-24 mx-auto text-blue-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
