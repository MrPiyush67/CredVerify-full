import { useState, useRef } from 'react';
import { X, Download, Save } from 'lucide-react';
import { Button } from '@common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import PortfolioPreview from './PortfolioPreview.jsx';

export default function PortfolioGeneratorModal({
  isOpen,
  onClose,
  platformProfile = {},
  userName = 'Your Name',
  userBio = 'Software Engineer',
  mode = 'portfolio' // 'portfolio' or 'credential'
}) {
  const portfolioRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  // Generate portfolio data from platform profile
  const generatePortfolioData = () => {
    // Get verified platforms
    const platforms = Object.entries(platformProfile || {})
      .filter(([key, data]) => data?.isVerified && typeof data === 'object' && data.handle)
      .map(([id, data]) => ({
        name: getPlatformName(id),
        status: 'ok',
        domain: getPlatformDomain(id),
        handle: data.handle
      }));

    // Aggregate stats from verified platforms
    let totalSolved = 0;
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;
    let contestRating = 0;
    let maxContestRating = 0;
    let globalRank = 0;
    let activeDays = 0;
    let contestsAttended = 0;

    // LeetCode stats
    const leetcodeStats = platformProfile?.leetcode?.isVerified ? platformProfile.leetcode.stats : null;
    if (leetcodeStats) {
      totalSolved += leetcodeStats.totalSolved || 0;
      easySolved += leetcodeStats.easySolved || 0;
      mediumSolved += leetcodeStats.mediumSolved || 0;
      hardSolved += leetcodeStats.hardSolved || 0;
      if (leetcodeStats.ranking) globalRank = leetcodeStats.ranking;
    }

    // Codeforces stats
    const cfStats = platformProfile?.codeforces?.isVerified ? platformProfile.codeforces.stats : null;
    if (cfStats) {
      if (cfStats.rating) {
        contestRating = cfStats.rating;
        maxContestRating = Math.max(maxContestRating, cfStats.maxRating || cfStats.rating);
      }
    }

    // CodeChef stats
    const ccStats = platformProfile?.codechef?.isVerified ? platformProfile.codechef.stats : null;
    if (ccStats) {
      if (ccStats.rating) {
        contestRating = Math.max(contestRating, ccStats.rating);
        maxContestRating = Math.max(maxContestRating, ccStats.rating);
      }
      contestsAttended += ccStats.contestsAttended || 0;
    }

    // GFG stats
    const gfgStats = platformProfile?.geeksforgeeks?.isVerified ? platformProfile.geeksforgeeks.stats : null;
    if (gfgStats) {
      totalSolved += gfgStats.problemsSolved || 0;
    }

    // GitHub stats
    const githubHandle = platformProfile?.github?.isVerified ? platformProfile.github.handle : null;

    return {
      platforms,
      githubHandle,
      problems: {
        fundamentals: { 
          value: easySolved, 
          total: easySolved > 0 ? Math.max(300, easySolved) : 300, 
          difficulty: { Easy: easySolved, Medium: 0, Hard: 0 } 
        },
        dsa: { 
          value: totalSolved, 
          total: totalSolved > 0 ? Math.max(1500, totalSolved) : 1500, 
          difficulty: { Easy: easySolved, Medium: mediumSolved, Hard: hardSolved } 
        },
        cp: { 
          value: totalSolved, 
          total: totalSolved > 0 ? Math.max(250, totalSolved) : 250, 
          difficulty: { Easy: easySolved, Medium: mediumSolved, Hard: hardSolved } 
        },
      },
      dsaTopics: totalSolved > 0 ? [
        { label: 'Arrays', value: Math.floor(totalSolved * 0.35) },
        { label: 'Dynamic Programming', value: Math.floor(totalSolved * 0.15) },
        { label: 'Strings', value: Math.floor(totalSolved * 0.13) },
        { label: 'Hashing & Sets', value: Math.floor(totalSolved * 0.12) },
        { label: 'Trees', value: Math.floor(totalSolved * 0.10) },
        { label: 'DFS & Graphs', value: Math.floor(totalSolved * 0.08) },
        { label: 'Stack', value: Math.floor(totalSolved * 0.07) },
      ] : [],
      contests: { 
        codechef: ccStats?.contestsAttended || 0, 
        codeforces: cfStats?.contestsAttended || 0 
      },
      contestRating: contestRating || 0,
      maxContestRating: maxContestRating || 0,
      contestRank: ccStats?.rank || cfStats?.rank || 'N/A',
      awards: platforms.map(p => ({ name: p.name })),
      ratingHistory: contestRating > 0 ? [contestRating] : [],
      totalQuestions: totalSolved || 0,
      activeDays: activeDays || 0,
      globalRank: globalRank || 0,
      maxRank: maxContestRating || 0,
      leetcodeHandle: platformProfile?.leetcode?.handle || null,
      codeforcesHandle: platformProfile?.codeforces?.handle || null,
      codechefHandle: platformProfile?.codechef?.handle || null
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
            <h3 className="text-lg font-semibold text-gray-800">
              {mode === 'credential' ? 'Platform Credential Generator' : 'DSA Portfolio Preview'}
            </h3>
            <p className="text-sm text-gray-600">
              {mode === 'credential' 
                ? 'Generate a verifiable credential from your platform achievements' 
                : 'Review and download your competitive programming portfolio'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {mode === 'portfolio' && (
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
            )}
            <Button
              size="sm"
              onClick={mode === 'credential' ? handleDownloadPDF : handleSaveAsCredential}
              disabled={isExporting || isSaving}
              className="gap-2 bg-[#116466] text-white hover:bg-[#0e4f50]"
            >
              {mode === 'credential' ? <Download className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {isExporting || isSaving ? 'Processing...' : (mode === 'credential' ? 'Generate Credential' : 'Save as Credential')}
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
            <span className="font-semibold">Note:</span> Portfolio data is generated from your verified platform profiles.
          </p>
        </div>
      </div>
    </div>
  );
}
