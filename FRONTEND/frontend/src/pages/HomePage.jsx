import React from 'react'

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold text-white text-center mb-4">
          Welcome to VideoHUB
        </h1>
        <p className="text-xl text-gray-200 text-center mb-8">
          Your ultimate video streaming platform
        </p>
        
        {/* Test Tailwind Buttons */}
        <div className="flex justify-center gap-4 mb-12">
          <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg">
            Get Started
          </button>
          <button className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-all">
            Learn More
          </button>
        </div>

        {/* Test Tailwind Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-xl p-6 shadow-2xl transform hover:scale-105 transition-transform">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🎬</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">HD Quality</h3>
            <p className="text-gray-600">Stream videos in stunning HD quality</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-2xl transform hover:scale-105 transition-transform">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">⚡</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Fast Streaming</h3>
            <p className="text-gray-600">Lightning-fast video loading</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-2xl transform hover:scale-105 transition-transform">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">📱</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Any Device</h3>
            <p className="text-gray-600">Watch on any device, anywhere</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage