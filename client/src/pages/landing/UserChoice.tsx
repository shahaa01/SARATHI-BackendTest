import React, { useEffect } from 'react';
import { Link } from 'wouter';

const UserChoice: React.FC = () => {
  // Fade out intro if present
  useEffect(() => {
    const intro = document.querySelector('.intro-container');
    if (intro) {
      setTimeout(() => {
        intro.classList.add('opacity-0', 'transition-opacity', 'duration-800', 'ease-in-out');
        
        setTimeout(() => {
          intro.classList.add('hidden');
        }, 800);
      }, 1500);
    }
  }, []);

  return (
    <div className="h-screen w-full bg-[url('https://source.unsplash.com/random/1920x1080/?kathmandu')] bg-center bg-cover flex flex-col items-center justify-center p-6 text-center">
      <header>
        <h1 className="text-3xl md:text-4xl font-semibold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent mb-3 tracking-wide">
          Welcome to Sarathi
        </h1>
        <p className="text-gray-600 mb-8 text-lg">Your Trusted Service Partner in Kathmandu</p>
      </header>

      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col justify-center items-center">
        <div className="user-choice w-full">
          <Link href="/auth?tab=register&role=customer" className="user flex items-center justify-center w-4/5 mx-auto h-12 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-lg mb-4 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            Join as Customer
          </Link>
          
          <Link href="/auth?tab=register&role=provider" className="sarathi flex items-center justify-center w-4/5 mx-auto h-12 bg-gray-100 text-gray-800 hover:bg-[#0B6A50] hover:text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
            Join as Service Provider
          </Link>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-2">Already have an account?</p>
            <Link href="/auth?tab=login" className="text-primary font-medium hover:underline">
              Login Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserChoice;
