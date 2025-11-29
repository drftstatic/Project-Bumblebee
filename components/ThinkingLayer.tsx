
import React from 'react';
import { ThinkingData } from '../types';

interface ThinkingLayerProps {
  thinking: ThinkingData;
}

const ThinkingLayer: React.FC<ThinkingLayerProps> = ({ thinking }) => {
  return (
    <div className="mt-4 p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-xs text-gray-300 animate-fade-in">
      <div className="space-y-4">
        <div>
          <h4 className="font-bold text-yellow-400 mb-1 uppercase tracking-wider">My Interpretation</h4>
          <p className="text-gray-300 font-mono">{thinking.interpretation}</p>
        </div>
        <div>
          <h4 className="font-bold text-yellow-400 mb-1 uppercase tracking-wider">Visual Approach</h4>
          <p className="text-gray-300 font-mono">{thinking.visualApproach}</p>
        </div>
        <div>
          <h4 className="font-bold text-yellow-400 mb-1 uppercase tracking-wider">Prompts sent to Nano Banana</h4>
          <ul className="list-disc list-inside space-y-2 pl-2">
            {thinking.prompts.map((prompt, index) => (
              <li key={index} className="font-mono text-gray-400 bg-gray-900 p-2 rounded">
                <span className="text-gray-500 mr-2">Image {index + 1}:</span>{prompt}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-yellow-400 mb-1 uppercase tracking-wider">Style Considerations</h4>
          <p className="text-gray-300 font-mono">{thinking.styleConsiderations}</p>
        </div>
      </div>
    </div>
  );
};

export default ThinkingLayer;
