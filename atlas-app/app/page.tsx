export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-navy">ATLAS</h1>
          <div className="flex gap-2 sm:gap-4">
            <a
              href="/login"
              className="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-text hover:text-navy transition-colors"
            >
              Sign in
            </a>
            <a
              href="/signup"
              className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-teal text-white rounded-lg hover:bg-teal/90 transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-12 sm:py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy mb-4 sm:mb-6 leading-tight">
            Every Opportunity.
            <br />
            <span className="text-teal mt-1 sm:mt-2 inline-block">One Place.</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-text mb-6 sm:mb-8 px-2">
            Find internships, hackathons, scholarships, and more. Personalized
            to your school, major, and interests. Apply in 30 seconds.
          </p>
          <div className="flex justify-center px-4 sm:px-0">
            <a
              href="/signup"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-teal text-white rounded-lg text-base sm:text-lg font-medium hover:bg-teal/90 transition-colors text-center"
            >
              Start Finding Opportunities
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 sm:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="text-center p-4 sm:p-6">
            <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg
                className="w-6 h-6 text-teal"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-navy mb-2">
              One Feed, Everything
            </h3>
            <p className="text-sm sm:text-base text-gray-text">
              Stop searching 10 different sites. Get all opportunities in one
              personalized feed.
            </p>
          </div>

          <div className="text-center p-4 sm:p-6">
            <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg
                className="w-6 h-6 text-teal"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-navy mb-2">
              Matched For You
            </h3>
            <p className="text-sm sm:text-base text-gray-text">
              See your match score for every opportunity based on your skills
              and interests.
            </p>
          </div>

          <div className="text-center p-4 sm:p-6">
            <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg
                className="w-6 h-6 text-teal"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-navy mb-2">
              Apply in 30 Seconds
            </h3>
            <p className="text-sm sm:text-base text-gray-text">
              Quick Apply with your saved profile. No more filling out the same
              forms.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-12 sm:mt-24 bg-gray-light rounded-xl sm:rounded-2xl p-6 sm:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center">
            <div>
              <p className="text-2xl sm:text-4xl font-bold text-teal">500+</p>
              <p className="text-xs sm:text-base text-gray-text">Opportunities</p>
            </div>
            <div>
              <p className="text-2xl sm:text-4xl font-bold text-teal">100+</p>
              <p className="text-xs sm:text-base text-gray-text">CA Schools</p>
            </div>
            <div>
              <p className="text-2xl sm:text-4xl font-bold text-teal">30s</p>
              <p className="text-xs sm:text-base text-gray-text">Apply Time</p>
            </div>
            <div>
              <p className="text-2xl sm:text-4xl font-bold text-teal">Free</p>
              <p className="text-xs sm:text-base text-gray-text">Always</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-12 sm:mt-20">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 text-center text-gray-text text-sm sm:text-base">
          <p>&copy; 2024 ATLAS. Built for students, by students.</p>
        </div>
      </footer>
    </div>
  );
}
