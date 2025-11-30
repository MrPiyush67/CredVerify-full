import { useState, useRef } from 'react';
import { X, Download, Save } from 'lucide-react';
import { Button } from '@common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import PortfolioPreview from './PortfolioPreview.jsx';

export default function PortfolioGeneratorModal({
  isOpen,
  onClose,
  submittedPlatforms = {},
  userName = 'Your Name',
  userBio = 'Software Engineer'
}) {
  const portfolioRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  // Generate portfolio data from submitted platforms
  const generatePortfolioData = () => {
    // This will be replaced with actual API calls when backend is ready
    // For now, using mock data
    const platforms = Object.entries(submittedPlatforms).map(([id, data]) => ({
      name: getPlatformName(id),
      status: data.verified ? 'ok' : 'pending',
      domain: getPlatformDomain(id)
    }));

    return {
      platforms,
      // Mock data - will be replaced with actual fetched data
      problems: {
        fundamentals: { value: 174, total: 300, difficulty: { Easy: 99, Medium: 65, Hard: 10 } },
        dsa: { value: 936, total: 1500, difficulty: { Easy: 254, Medium: 557, Hard: 125 } },
        cp: { value: 119, total: 250, difficulty: { Easy: 27, Medium: 92, Hard: 0 } },
      },
      dsaTopics: [
        { label: 'Arrays', value: 414 },
        { label: 'Dynamic Programming', value: 185 },
        { label: 'Strings', value: 162 },
        { label: 'Hashing & Sets', value: 142 },
        { label: 'Trees', value: 121 },
        { label: 'DFS & Graphs', value: 95 },
        { label: 'Stack', value: 83 },
        { label: 'Greedy Algorithms', value: 79 },
        { label: 'Math', value: 70 },
      ],
      contests: { codechef: 8, codeforces: 10 },
      awards: [
        { name: 'Star' }, { name: '100 Days' }, { name: 'Knight' }, { name: 'Contest' }, { name: 'Diamond' }
      ],
      ratingHistory: [1500, 1520, 1550, 1600, 1625, 1670, 1718],
      totalQuestions: '1229',
      activeDays: '493',
      globalRank: '2087',
      maxRank: '1794'
    };
  };

  const getPlatformName = (id) => {
    const names = {
      leetcode: 'LeetCode',
      codeforces: 'CodeForces',
      codechef: 'CodeChef',
      geeksforgeeks: 'GeeksForGeeks',
      interviewbit: 'InterviewBit',
      codestudio: 'CodeStudio',
      hackerrank: 'HackerRank',
      hackerearth: 'HackerEarth',
      atcoder: 'AtCoder',
      topcoder: 'TopCoder'
    };
    return names[id] || id;
  };

  const getPlatformDomain = (id) => {
    const domains = {
      leetcode: 'leetcode.com',
      codeforces: 'codeforces.com',
      codechef: 'codechef.com',
      geeksforgeeks: 'geeksforgeeks.org',
      interviewbit: 'interviewbit.com',
      codestudio: 'naukri.com',
      hackerrank: 'hackerrank.com',
      hackerearth: 'hackerearth.com',
      atcoder: 'atcoder.jp',
      topcoder: 'topcoder.com'
    };
    return domains[id] || '';
  };

  const handleDownloadPDF = async () => {
    if (!portfolioRef.current) return;

    setIsExporting(true);
    try {
      const element = portfolioRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`DSA_Portfolio_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveAsCredential = async () => {
    if (!portfolioRef.current) return;

    setIsSaving(true);
    try {
      const element = portfolioRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Failed to create image blob');
        }

        // Create a File object from the blob
        const file = new File([blob], `DSA_Portfolio_${new Date().getTime()}.png`, { type: 'image/png' });

        // TODO: Integrate with credential upload API
        // For now, we'll just trigger a download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);

        alert('Portfolio saved! This will be integrated with the credential system once the backend is ready.');
        onClose();
      }, 'image/png');
    } catch (error) {
      console.error('Save as credential failed:', error);
      alert('Failed to save as credential. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const portfolioData = generatePortfolioData();

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-[95%] max-w-7xl max-h-[90vh] overflow-hidden border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">DSA Portfolio Preview</h3>
            <p className="text-sm text-gray-600">Review and download your competitive programming portfolio</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadPDF}
              disabled={isExporting || isSaving}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Download PDF'}
            </Button>
            <Button
              size="sm"
              onClick={handleSaveAsCredential}
              disabled={isExporting || isSaving}
              className="gap-2 bg-[#116466] text-white hover:bg-[#0e4f50]"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save as Credential'}
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              disabled={isExporting || isSaving}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Portfolio Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div ref={portfolioRef}>
            <PortfolioPreview
              portfolioData={portfolioData}
              userName={userName}
              userBio={userBio}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 text-center">
          <p className="text-xs text-gray-500">
            <span className="font-semibold">Note:</span> This portfolio uses placeholder data. Real platform statistics will be fetched when you integrate with the backend API.
          </p>
        </div>
      </div>
    </div>
  );
}
