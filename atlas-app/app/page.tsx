export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-navy">ATLAS</h1>
          <div className="flex gap-4">
            <a
              href="/login"
              className="px-4 py-2 text-gray-text hover:text-navy transition-colors"
            >
              Sign in
            </a>
            <a
              href="/signup"
              className="px-4 py-2 bg-teal text-white rounded-lg hover:bg-teal/90 transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-navy mb-6 leading-tight">
            Every Opportunity.
            <br />
            <span className="text-teal mt-2 inline-block">One Place.</span>
          </h2>
          <p className="text-xl text-gray-text mb-8">
            Find internships, hackathons, scholarships, and more. Personalized
            to your school, major, and interests. Apply in 30 seconds.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/signup"
              className="px-8 py-3 bg-teal text-white rounded-lg text-lg font-medium hover:bg-teal/90 transition-colors"
            >
              Start Finding Opportunities
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center mx-auto mb-4">
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
            <h3 className="text-lg font-semibold text-navy mb-2">
              One Feed, Everything
            </h3>
            <p className="text-gray-text">
              Stop searching 10 different sites. Get all opportunities in one
              personalized feed.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center mx-auto mb-4">
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
            <h3 className="text-lg font-semibold text-navy mb-2">
              Matched For You
            </h3>
            <p className="text-gray-text">
              See your match score for every opportunity based on your skills
              and interests.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center mx-auto mb-4">
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
            <h3 className="text-lg font-semibold text-navy mb-2">
              Apply in 30 Seconds
            </h3>
            <p className="text-gray-text">
              Quick Apply with your saved profile. No more filling out the same
              forms.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-24 bg-gray-light rounded-2xl p-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-teal">500+</p>
              <p className="text-gray-text">Opportunities</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-teal">100+</p>
              <p className="text-gray-text">California Schools</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-teal">30s</p>
              <p className="text-gray-text">Average Apply Time</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-teal">Free</p>
              <p className="text-gray-text">Always</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-text">
          <p>&copy; 2024 ATLAS. Built for students, by students.</p>
        </div>
      </footer>
    </div>
  );
}
