import React from 'react';
import { GradeResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface FinalGradeProps {
  result: GradeResult;
  onReset: () => void;
}

const FinalGrade: React.FC<FinalGradeProps> = ({ result, onReset }) => {
  const data = [
    { name: 'Score', value: result.score },
    { name: 'Remaining', value: 100 - result.score },
  ];

  const COLORS = [result.score >= 70 ? '#10B981' : result.score >= 50 ? '#F59E0B' : '#EF4444', '#E5E7EB'];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Interview Results</h2>
        <p className="text-gray-500 mt-2">Here is the detailed breakdown of your system design.</p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
        <div className="w-48 h-48 flex-shrink-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-3xl font-bold text-gray-800">{result.score}%</span>
            <span className="text-xs text-gray-500 uppercase tracking-wide">Accuracy</span>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Summary</h3>
          <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
            {result.summary}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-green-50 p-6 rounded-xl border border-green-100">
          <h3 className="text-green-800 font-semibold mb-3 flex items-center gap-2">
             <span className="bg-green-200 p-1 rounded">👍</span> Key Strengths
          </h3>
          <ul className="space-y-2">
            {result.strengths.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                <span className="text-green-500 mt-1">•</span> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-red-50 p-6 rounded-xl border border-red-100">
          <h3 className="text-red-800 font-semibold mb-3 flex items-center gap-2">
             <span className="bg-red-200 p-1 rounded">⚠️</span> Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {result.weaknesses.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                <span className="text-red-500 mt-1">•</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onReset}
          className="px-8 py-3 bg-gray-900 text-white rounded-full font-semibold shadow-lg hover:bg-black transition-transform transform hover:-translate-y-1"
        >
          Start New Practice Interview
        </button>
      </div>
    </div>
  );
};

export default FinalGrade;
