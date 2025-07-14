import React from "react";

export default function CollegeNoticeBoard() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 py-12">
      <h1 className="text-3xl font-bold mb-10 text-gray-800 text-center">College Notice Board</h1>
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl flex flex-col items-center">
        <div className="flex items-center gap-4 mb-2">
          <img
            src="https://www.gpawasari.ac.in/Images/logo.PNG"
            alt="Government Polytechnic Awasari Logo"
            className="h-16 w-16 object-contain rounded-full border border-gray-200 shadow"
          />
          <div>
            <div className="text-xl font-semibold text-gray-900">Government Polytechnic, Awasari (Kh)</div>
            <div className="text-sm text-gray-500">An Autonomous Institute of Government of Maharashtra</div>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-2 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-sm w-full">
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
          <span className="text-gray-800 font-medium">All students are requested to check the latest exam schedule on the notice board.</span>
        </div>
      </div>
    </div>
  );
} 