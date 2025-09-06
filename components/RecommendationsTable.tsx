import React from 'react';
import { MakeupRecommendation } from '../App';

interface RecommendationsTableProps {
  recommendations: MakeupRecommendation[];
}

const ImportanceBadge: React.FC<{ importance: string }> = ({ importance }) => {
    let bgColor = 'bg-gray-200';
    let textColor = 'text-gray-800';

    switch (importance?.toLowerCase()) {
        case 'high':
            bgColor = 'bg-red-100';
            textColor = 'text-red-800';
            break;
        case 'normal':
            bgColor = 'bg-blue-100';
            textColor = 'text-blue-800';
            break;
        case 'optional':
            bgColor = 'bg-green-100';
            textColor = 'text-green-800';
            break;
    }

    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${bgColor} ${textColor}`}>
            {importance}
        </span>
    );
};

export const RecommendationsTable: React.FC<RecommendationsTableProps> = ({ recommendations }) => {
  const tableHeaders = ["Face Part", "Improvement To Be Done", "Importance", "Possible Products", "Shop"];

  // Ensure recommendations for all face parts are present and in order
  const facePartOrder = [
    "Foundation", "Concealer", "Contour", "Blush", "Highlighter", 
    "Lipstick", "Lipgloss", "Eyeliner", "Mascara", "Eye shadow"
  ];
  
  const sortedRecommendations = facePartOrder.map(part => {
    return recommendations.find(rec => rec.facePart === part) || {
        facePart: part,
        improvement: "N/A",
        importance: "N/A",
        products: "N/A",
        sephoraLink: "#"
    };
  });


  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            {tableHeaders.map((header) => (
              <th key={header} className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedRecommendations.map((rec) => (
            <tr key={rec.facePart} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rec.facePart}</td>
              <td className="px-6 py-4 whitespace-normal text-sm text-gray-700">{rec.improvement}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                <ImportanceBadge importance={rec.importance} />
              </td>
              <td className="px-6 py-4 whitespace-normal text-sm text-gray-700">{rec.products}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <a 
                  href={rec.sephoraLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-red-600 hover:text-red-800 font-semibold transition-colors"
                >
                  Buy Now
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};