import { useState } from 'react';
import { Download, Folder, Puzzle, CheckCircle2 } from 'lucide-react';
import {FaChrome} from 'react-icons/fa'
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
            const link = document.createElement('a');
            link.href = '/credverify-extension.zip';
            link.download = 'credverify-extension.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setActiveStep(1);
          }}
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
        <div className="text-sm text-muted-foreground mt-2">
          <p className="mb-2">Right-click the downloaded ZIP file and select:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong className="text-foreground">Windows:</strong> "Extract All..." → Choose location</li>
            <li><strong className="text-foreground">Mac:</strong> Double-click the ZIP file</li>
            <li><strong className="text-foreground">Linux:</strong> Right-click → "Extract Here"</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Open Chrome Extensions',
      icon: FaChrome,
      description: 'Navigate to Chrome Extensions page',
      details: (
        <div className="text-sm text-muted-foreground mt-2">
          <p className="mb-2">Option 1: Enter in address bar:</p>
          <code className="bg-muted px-2 py-1 rounded block mb-3 text-foreground">
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
        <div className="text-sm text-muted-foreground mt-2 space-y-3">
          <p>
            Look for a toggle switch in the top-right corner that says{' '}
            <strong className="text-foreground">"Developer mode"</strong> and
            turn it ON.
          </p>
          <Alert>
            <AlertTitle>💡 Tip</AlertTitle>
            <AlertDescription>
              This allows you to install extensions from your local computer.
            </AlertDescription>
          </Alert>
        </div>
      ),
    },
    {
      title: 'Load Extension',
      icon: CheckCircle2,
      description: 'Install the CredVerify Extension',
      details: (
        <div className="text-sm text-muted-foreground mt-2 space-y-3">
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Click the <strong className="text-foreground">"Load unpacked"</strong> button</li>
            <li>Navigate to the extracted extension folder</li>
            <li>Select the <strong className="text-foreground">entire folder</strong> (not individual files)</li>
            <li>Click <strong className="text-foreground">"Select Folder"</strong></li>
          </ol>
          <Alert>
            <AlertTitle>✅ Success!</AlertTitle>
            <AlertDescription>
              The extension should now appear in your extensions list with a
              green checkmark.
            </AlertDescription>
          </Alert>
        </div>
      ),
    },
  ];

  const handleClose = () => {
    setActiveStep(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="p-6 border-b">
          <DialogTitle>Install CredVerify Extension</DialogTitle>
          <DialogDescription>
            Follow these steps to install the browser extension
          </DialogDescription>
        </DialogHeader>

        {/* Step Progress */}
        <div className="px-6 py-4 bg-muted/50 border-b">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    index <= activeStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index < activeStep ? '✓' : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-1 mx-2 transition-colors ${
                      index < activeStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className={`mb-6 last:mb-0 ${index !== activeStep ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-lg ${
                      index <= activeStep
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">
                      Step {index + 1}: {step.title}
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      {step.description}
                    </p>
                    {step.action && index === activeStep && (
                      <div className="mt-3">{step.action}</div>
                    )}
                    {step.details && index === activeStep && (
                      <div className="mt-3">{step.details}</div>
                    )}
                    {index === activeStep && index > 0 && (
                      <div className="mt-4 flex gap-2">
                        <Button
                          onClick={() =>
                            setActiveStep(
                              Math.min(steps.length - 1, activeStep + 1),
                            )
                          }
                        >
                          {index === steps.length - 1 ? 'Done' : 'Next Step'}
                        </Button>
                        {index > 1 && (
                          <Button
                            variant="outline"
                            onClick={() =>
                              setActiveStep(Math.max(0, activeStep - 1))
                            }
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

        <DialogFooter className="px-6 py-4 bg-muted/50 border-t sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Need help? Check our{' '}
            <a href="#" className="text-primary hover:underline">
              documentation
            </a>
          </p>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
