import { useState } from 'react';
import { X, Chrome, Download, Folder, Puzzle, CheckCircle2 } from 'lucide-react';
import { Button } from '@common';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExtensionInstallModal({ isOpen, onClose }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: 'Download Extension',
      icon: Download,
      description: 'Download the CredVerify Extension ZIP file',
      action: (
        <Button
          onClick={() => {
            // Trigger download
            const link = document.createElement('a');
            link.href = '/credverify-extension.zip';
            link.download = 'credverify-extension.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setActiveStep(1);
          }}
          className="bg-[#116466] text-white hover:bg-[#0e4f50]"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Extension
        </Button>
      ),
    },
    {
      title: 'Extract ZIP File',
      icon: Folder,
      description: 'Extract the downloaded ZIP file to a folder on your computer',
      details: (
        <div className="text-sm text-gray-600 mt-2">
          <p className="mb-2">Right-click the downloaded ZIP file and select:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Windows:</strong> "Extract All..." → Choose location</li>
            <li><strong>Mac:</strong> Double-click the ZIP file</li>
            <li><strong>Linux:</strong> Right-click → "Extract Here"</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Open Chrome Extensions',
      icon: Chrome,
      description: 'Navigate to Chrome Extensions page',
      details: (
        <div className="text-sm text-gray-600 mt-2">
          <p className="mb-2">Option 1: Enter in address bar:</p>
          <code className="bg-gray-100 px-2 py-1 rounded block mb-3">
            chrome://extensions/
          </code>
          <p className="mb-2">Option 2: Through menu:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Click three dots (⋮) in top-right corner</li>
            <li>Hover over "Extensions"</li>
            <li>Click "Manage Extensions"</li>
          </ol>
        </div>
      ),
    },
    {
      title: 'Enable Developer Mode',
      icon: Puzzle,
      description: 'Turn on Developer mode in Chrome Extensions',
      details: (
        <div className="text-sm text-gray-600 mt-2">
          <p>Look for a toggle switch in the top-right corner that says <strong>"Developer mode"</strong> and turn it ON.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
            <p className="text-blue-800 font-medium">💡 Tip:</p>
            <p className="text-blue-700 text-sm mt-1">
              This allows you to install extensions from your local computer.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Load Extension',
      icon: CheckCircle2,
      description: 'Install the CredVerify Extension',
      details: (
        <div className="text-sm text-gray-600 mt-2">
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Click the <strong>"Load unpacked"</strong> button</li>
            <li>Navigate to the extracted extension folder</li>
            <li>Select the <strong>entire folder</strong> (not individual files)</li>
            <li>Click <strong>"Select Folder"</strong></li>
          </ol>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
            <p className="text-green-800 font-medium">✅ Success!</p>
            <p className="text-green-700 text-sm mt-1">
              The extension should now appear in your extensions list with a green checkmark.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Install CredVerify Extension
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Follow these steps to install the browser extension
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Steps Progress */}
              <div className="px-6 py-4 bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${index <= activeStep
                          ? 'bg-[#116466] text-white'
                          : 'bg-gray-200 text-gray-500'
                          }`}
                      >
                        {index < activeStep ? '✓' : index + 1}
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`w-12 h-1 mx-2 transition-colors ${index < activeStep ? 'bg-[#116466]' : 'bg-gray-200'
                            }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[500px] scrollbar-thin">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={index}
                      className={`mb-6 ${index !== activeStep ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${index <= activeStep ? 'bg-[#116466] text-white' : 'bg-gray-100 text-gray-400'
                          }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            Step {index + 1}: {step.title}
                          </h3>
                          <p className="text-gray-600 mb-3">{step.description}</p>
                          {step.action && index === activeStep && (
                            <div className="mt-3">{step.action}</div>
                          )}
                          {step.details && index === activeStep && (
                            <div className="mt-3">{step.details}</div>
                          )}
                          {index === activeStep && index > 0 && (
                            <div className="mt-4 flex gap-2">
                              <Button
                                onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                                className="bg-[#116466] text-white hover:bg-[#0e4f50]"
                              >
                                {index === steps.length - 1 ? 'Done' : 'Next Step'}
                              </Button>
                              {index > 1 && (
                                <Button
                                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                                  variant="outline"
                                >
                                  Previous
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Need help? Check our{' '}
                    <a href="#" className="text-[#116466] hover:underline">
                      documentation
                    </a>
                  </p>
                  <Button
                    onClick={onClose}
                    variant="outline"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
