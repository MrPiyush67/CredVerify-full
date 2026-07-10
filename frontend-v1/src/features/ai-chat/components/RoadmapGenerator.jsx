/**
 * Roadmap Generator Component
 * Generates HTML roadmap matching the RoadmapViewer styling
 */

export const generateRoadmapHTML = (roadmapData) => {
  const { title, description, steps, selectionPath } = roadmapData;
  
  // Normalize topics to always be arrays
  const normalizedSteps = (steps || []).map(step => ({
    ...step,
    topics: Array.isArray(step.topics) 
      ? step.topics 
      : typeof step.topics === 'string' 
        ? step.topics.split(',').map(t => t.trim()).filter(t => t)
        : []
  }));
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || 'Learning Roadmap'}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #ffffff;
            min-height: 100vh;
            padding: 2rem 1rem;
        }

        .container {
            max-width: 100%;
            margin: 0 auto;
            width: 100%;
        }

        .header {
            text-align: center;
            margin-bottom: 3rem;
            max-width: 100%;
            margin-left: auto;
            margin-right: auto;
        }

        .header h1 {
            font-size: 1.875rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: #111827;
        }

        .header p {
            font-size: 0.875rem;
            color: #6b7280;
            margin-bottom: 1rem;
            line-height: 1.5;
        }

        .download-note {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: linear-gradient(to right, #dcfce7, #bbf7d0);
            border: 2px solid #86efac;
            border-radius: 9999px;
            padding: 0.625rem 1.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            font-size: 0.875rem;
            font-weight: 600;
            color: #047857;
            margin-top: 1rem;
        }

        .roadmap-container {
            position: relative;
            width: 100%;
            margin: 0 auto;
        }

        .timeline {
            display: none;
        }

        @media (min-width: 1024px) {
            .timeline {
                display: block;
                position: absolute;
                left: 50%;
                top: 0;
                bottom: 0;
                width: 2px;
                background: linear-gradient(to bottom, transparent, #bfdbfe, transparent);
                transform: translateX(-50%);
            }
        }

        .step {
            position: relative;
            margin-bottom: 2rem;
            animation: fadeInUp 0.6s ease backwards;
        }

        @media (min-width: 1024px) {
            .step {
                margin-bottom: 2.5rem;
            }

            .step.left .step-wrapper {
                margin-right: 52%;
                padding-right: 3rem;
            }

            .step.right .step-wrapper {
                margin-left: 52%;
                padding-left: 3rem;
            }
        }

        .step:nth-child(1) { animation-delay: 0.1s; }
        .step:nth-child(2) { animation-delay: 0.2s; }
        .step:nth-child(3) { animation-delay: 0.3s; }
        .step:nth-child(4) { animation-delay: 0.4s; }
        .step:nth-child(5) { animation-delay: 0.5s; }
        .step:nth-child(6) { animation-delay: 0.6s; }
        .step:nth-child(7) { animation-delay: 0.7s; }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .step-wrapper {
            position: relative;
        }

        .connector-dot {
            display: none;
            position: absolute;
            top: 2rem;
            width: 1rem;
            height: 1rem;
            background: #60a5fa;
            border-radius: 50%;
            border: 4px solid white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        @media (min-width: 1024px) {
            .connector-dot {
                display: block;
            }

            .step.left .connector-dot {
                right: -8.5%;
            }

            .step.right .connector-dot {
                left: -8.5%;
            }
        }

        .step-card {
            background: white;
            border-radius: 1rem;
            border: 1px solid #e5e7eb;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            padding: 1.25rem;
            position: relative;
            transition: all 0.3s ease;
        }

        .step-card:hover {
            transform: translateY(-0.5rem);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
        }

        .thumbnail {
            position: absolute;
            top: -1rem;
            width: 3.5rem;
            height: 3.5rem;
            border-radius: 50%;
            padding: 2px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            background: linear-gradient(to bottom right, #a855f7, #9333ea);
        }

        @media (min-width: 1024px) {
            .step:nth-child(odd) .thumbnail {
                right: 1.5rem;
            }

            .step:nth-child(even) .thumbnail {
                left: 1.5rem;
            }
        }

        .step:nth-child(even) .thumbnail,
        .step:nth-child(odd) .thumbnail {
            right: 1.5rem;
        }

        .thumbnail-inner {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }

        .category-tag {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            background: #f3e8ff;
            color: #6b21a8;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .step-title {
            font-size: 1rem;
            font-weight: 700;
            color: #111827;
            margin-bottom: 0.5rem;
            line-height: 1.375;
            padding-right: 3rem;
        }

        .step-bullets {
            list-style: none;
            margin: 0;
            padding: 0;
        }

        .bullet-item {
            display: flex;
            align-items: flex-start;
            gap: 0.5rem;
            margin-bottom: 0.375rem;
            font-size: 0.875rem;
            color: #374151;
            line-height: 1.5;
        }

        .bullet-dot {
            color: #9ca3af;
            margin-top: 0.125rem;
        }

        .duration-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            background: #f9fafb;
            padding: 0.25rem 0.75rem;
            border-radius: 0.5rem;
            font-size: 0.75rem;
            color: #4b5563;
            margin-top: 0.75rem;
        }

        .connector-line {
            display: flex;
            justify-content: center;
            margin: 1rem 0;
        }

        .connector-line-inner {
            width: 1px;
            height: 2rem;
            background: linear-gradient(to bottom, #93c5fd, #bfdbfe, transparent);
            border-radius: 9999px;
        }

        .completion {
            text-align: center;
            margin-top: 2rem;
        }

        .completion-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            background: linear-gradient(to right, #dcfce7, #bbf7d0);
            border: 2px solid #86efac;
            border-radius: 9999px;
            padding: 0.625rem 1.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .completion-icon {
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            background: #22c55e;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }

        .completion-text {
            font-size: 0.875rem;
            font-weight: 700;
            color: #047857;
        }

        @media (max-width: 1023px) {
            .header h1 {
                font-size: 1.5rem;
            }

            .step-card {
                padding: 1rem;
            }

            .thumbnail {
                width: 3rem;
                height: 3rem;
            }
        }

        @media print {
            body {
                background: white;
                padding: 1rem;
            }

            .step-card {
                page-break-inside: avoid;
                box-shadow: none;
            }

            .step-card:hover {
                transform: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${title || 'Your Learning Roadmap'}</h1>
            <p>${description || 'A comprehensive, step-by-step guide to mastering your chosen path.'}</p>
            <div class="download-note">
                ✅ Roadmap Downloaded Successfully - Generated by CredVerify AI
            </div>
        </div>

        <div class="roadmap-container">
            <div class="timeline"></div>
            
            ${normalizedSteps.map((step, index) => `
            <div class="step ${index % 2 === 0 ? 'left' : 'right'}">
                <div class="step-wrapper">
                    <div class="connector-dot"></div>
                    
                    <div class="step-card">
                        <div class="thumbnail">
                            <div class="thumbnail-inner">📚</div>
                        </div>
                        
                        <div class="category-tag">
                            ${step.category || 'Learning'}
                        </div>
                        
                        <h3 class="step-title">${step.title}</h3>
                        
                        <ul class="step-bullets">
                            ${step.description ? `
                            <li class="bullet-item">
                                <span class="bullet-dot">•</span>
                                <span>${step.description}</span>
                            </li>
                            ` : ''}
                            ${step.topics && step.topics.length > 0 ? step.topics.slice(0, 3).map(topic => `
                            <li class="bullet-item">
                                <span class="bullet-dot">•</span>
                                <span>${topic}</span>
                            </li>
                            `).join('') : ''}
                        </ul>
                        
                        ${step.duration ? `
                        <div class="duration-badge">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10" stroke-width="2"/>
                                <path d="M12 6v6l4 2" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            <span>${step.duration}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            ${index < normalizedSteps.length - 1 ? `
            <div class="connector-line">
                <div class="connector-line-inner"></div>
            </div>
            ` : ''}
            `).join('')}
        </div>

        <div class="completion">
            <div class="completion-badge">
                <div class="completion-icon">✓</div>
                <span class="completion-text">Complete All Steps to Master Your Goal</span>
            </div>
        </div>
    </div>
</body>
</html>`;

  return html;
};

export const downloadRoadmapHTML = (roadmapData) => {
  const html = generateRoadmapHTML(roadmapData);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(roadmapData.title || 'learning-roadmap').toLowerCase().replace(/\s+/g, '-')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
