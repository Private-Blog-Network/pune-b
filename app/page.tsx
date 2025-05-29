import Link from "next/link"
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#edf2f7] to-[#dbeafe] flex items-center justify-center px-4">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
        {/* Left Content */}
        <div className="text-center md:text-left">
          <img
            src="/pbetb-landing.jpg"
            alt="PBETB Logo"
            className="h-20 mx-auto md:mx-0 mb-4"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Pune Business Education Training Board
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Admin access portal to manage and monitor activities under PBETB.
          </p>
          <Link
            href="/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-3 px-6 rounded-xl transition"
          >
            Login as Admin
          </Link>
        </div>

        {/* Right Illustration (optional image) */}
        <div className="hidden md:block">
          <img
            src="https://img.freepik.com/free-vector/secure-login-concept-illustration_114360-4574.jpg?w=740"
            alt="Login Illustration"
            className="w-[400px] rounded-xl shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
