import { FaGithub, FaLinkedin } from "react-icons/fa";
import { CiGlobe } from "react-icons/ci";
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-slate-100 px-4">
      {/* Main Heading */}
      <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-4">
        This is Home
      </h1>
      
      <p className="text-slate-400 text-lg mb-8 max-w-md text-center">
        Connect with me through any of the channels below.
      </p>

      {/* Social Links Container */}
      <div className="flex flex-wrap items-center justify-center gap-4 max-w-xl">
        
        {/* GitHub */}
        <a 
          href="https://github.com/rahulthapa9024" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-5 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all group"
        >
          <FaGithub className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          <span className="font-medium">GitHub</span>
        </a>

        {/* LinkedIn */}
        <a 
          href="https://www.linkedin.com/in/rahul-thapa-02a168320/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-5 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all group"
        >
          <FaLinkedin className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
          <span className="font-medium">LinkedIn</span>
        </a>

        {/* Email */}
        <a 
          href="https://portfolio-ten-xi-mee38qjyjs.vercel.app/" 
          target="_blank"
          className="flex items-center gap-3 px-5 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all group"
        >
          <CiGlobe className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
          <span className="font-medium">Portfolio</span>
        </a>

      </div>
    </div>
  );
}