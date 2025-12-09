import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain,
  Code,
  Database,
  Palette,
  Network,
  GraduationCap,
  Target,
  Download
} from 'lucide-react';
import { downloadRoadmapHTML } from './RoadmapGenerator';
import toast from 'react-hot-toast';

const RoadmapViewer = ({ roadmapData }) => {
  // Validate roadmapData
  if (!roadmapData || typeof roadmapData !== 'object') {
    console.error('Invalid roadmapData:', roadmapData);
    return null;
  }

  if (!roadmapData.steps || !Array.isArray(roadmapData.steps)) {
    console.error('Invalid or missing steps array:', roadmapData.steps);
    return null;
  }

  // Map categories to icons and colors
  const getCategoryStyle = (title) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('generative') || titleLower.includes('ai') || titleLower.includes('machine learning')) {
      return { 
        icon: Brain, 
        tagBg: 'bg-purple-100', 
        tagText: 'text-purple-700',
        thumbnail: 'from-purple-500 via-fuchsia-500 to-pink-500'
      };
    }
    if (titleLower.includes('math') || titleLower.includes('calculus') || titleLower.includes('algebra')) {
      return { 
        icon: Target, 
        tagBg: 'bg-yellow-100', 
        tagText: 'text-yellow-700',
        thumbnail: 'from-yellow-400 via-amber-400 to-orange-400'
      };
    }
    if (titleLower.includes('code') || titleLower.includes('programming')) {
      return { 
        icon: Code, 
        tagBg: 'bg-blue-100', 
        tagText: 'text-blue-700',
        thumbnail: 'from-blue-500 via-cyan-500 to-teal-500'
      };
    }
    if (titleLower.includes('database') || titleLower.includes('data')) {
      return { 
        icon: Database, 
        tagBg: 'bg-green-100', 
        tagText: 'text-green-700',
        thumbnail: 'from-green-500 via-emerald-500 to-teal-500'
      };
    }
    if (titleLower.includes('design') || titleLower.includes('ui') || titleLower.includes('ux')) {
      return { 
        icon: Palette, 
        tagBg: 'bg-pink-100', 
        tagText: 'text-pink-700',
        thumbnail: 'from-pink-500 via-rose-500 to-red-500'
      };
    }
    if (titleLower.includes('neural') || titleLower.includes('deep')) {
      return { 
        icon: Network, 
        tagBg: 'bg-indigo-100', 
        tagText: 'text-indigo-700',
        thumbnail: 'from-indigo-500 via-purple-500 to-violet-500'
      };
    }
    return { 
      icon: GraduationCap, 
      tagBg: 'bg-purple-100', 
      tagText: 'text-purple-700',
      thumbnail: 'from-purple-500 via-violet-500 to-indigo-500'
    };
  };

  if (!roadmapData || !roadmapData.steps) {
    return null;
  }

  return (
    <div className="w-full bg-white py-4 px-2 sm:px-4 lg:px-6">
      {/* Header */}
      <div className="w-full mx-auto text-center mb-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
        >
          {roadmapData.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-gray-600 mx-auto mb-4"
        >
          {roadmapData.description}
        </motion.p>
        
        {/* Download Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            downloadRoadmapHTML(roadmapData);
            toast.success('Roadmap downloaded successfully!');
          }}
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition-all"
        >
          <Download className="w-5 h-5" />
          Download Roadmap
        </motion.button>
      </div>

      {/* Timeline Container */}
      <div className="w-full mx-auto relative">
        {/* Center line for desktop */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-blue-200 to-transparent transform -translate-x-1/2"></div>

        {roadmapData.steps.map((step, index) => {
          // Validate step object
          if (!step || typeof step !== 'object') {
            console.error('Invalid step at index', index, step);
            return null;
          }
          
          const isLeft = index % 2 === 0;
          const { icon: IconComponent, tagBg, tagText, thumbnail } = getCategoryStyle(step.title || 'Learning');
          
          return (
            <div key={`step-${index}`}>
              {/* Step Card */}
              <motion.div
                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`relative mb-8 lg:mb-10 ${
                  isLeft 
                    ? 'lg:mr-[52%] lg:pr-12' 
                    : 'lg:ml-[52%] lg:pl-12'
                }`}
              >
                {/* Connector Dot (Desktop) */}
                <div className="hidden lg:block absolute top-8 w-4 h-4 bg-blue-400 rounded-full border-4 border-white shadow-lg"
                  style={{
                    [isLeft ? 'right' : 'left']: '-8.5%',
                  }}
                ></div>

                {/* Curved Dotted Line (Desktop) */}
                <svg 
                  className="hidden lg:block absolute top-8"
                  style={{
                    [isLeft ? 'right' : 'left']: '-8%',
                    width: '8%',
                    height: '120px',
                    [isLeft ? 'transform' : 'transform']: isLeft ? 'scaleX(-1)' : 'none',
                  }}
                >
                  <path
                    d="M 0 0 Q 50 30, 100 60"
                    stroke="#93C5FD"
                    strokeWidth="2"
                    strokeDasharray="6,6"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Card */}
                <motion.div
                  whileHover={{ y: -8, boxShadow: "0 20px 50px rgba(0,0,0,0.08)" }}
                  transition={{ duration: 0.3 }}
                  className="relative bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 p-5 overflow-visible"
                >
                  {/* Circular Thumbnail */}
                  <div className={`absolute -top-4 ${isLeft ? 'lg:right-6 right-6' : 'lg:left-6 left-6'} w-14 h-14 rounded-full bg-gradient-to-br ${thumbnail} p-1 shadow-lg`}>
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                      <IconComponent className="w-8 h-8 text-gray-700" />
                    </div>
                  </div>

                  {/* Category Tag */}
                  <div className={`inline-flex items-center gap-1.5 ${tagBg} ${tagText} px-3 py-1 rounded-full text-xs font-semibold mb-2`}>
                    <IconComponent className="w-3 h-3" />
                    <span>{step.category || 'Learning'}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug pr-12">
                    {step.title}
                  </h3>

                  {/* Bullet Points */}
                  <ul className="space-y-1.5 text-gray-700 leading-relaxed text-sm">
                    {step.description && (
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400 mt-0.5 text-base">•</span>
                        <span className="flex-1">{step.description}</span>
                      </li>
                    )}
                    {step.topics && Array.isArray(step.topics) && step.topics.slice(0, 3).map((topic, i) => (
                      <li key={`topic-${index}-${i}`} className="flex items-start gap-2">
                        <span className="text-gray-400 mt-0.5 text-base">•</span>
                        <span className="flex-1">{topic}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Duration Badge */}
                  {step.duration && (
                    <div className="mt-3 inline-flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-md text-xs text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">{step.duration}</span>
                    </div>
                  )}
                </motion.div>
              </motion.div>

              {/* Connector between cards */}
              {index < roadmapData.steps.length - 1 && (
                <div className="flex justify-center my-4">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-300 via-blue-200 to-transparent rounded-full"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="w-full mx-auto mt-8 text-center"
      >
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-full px-6 py-2.5 shadow-lg">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm font-bold text-green-800">Complete All Steps to Master Your Goal</span>
        </div>
      </motion.div>
    </div>
  );
};

export default RoadmapViewer;
