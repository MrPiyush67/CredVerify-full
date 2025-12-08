import { useState, useRef } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@common';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import PortfolioPreview from './PortfolioPreview.jsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function PortfolioGeneratorModal({
  isOpen,
  onClose,
  platformProfile = {},
  userName = 'Your Name',
  userBio = 'Software Engineer',
  userAvatar = null,
  mode = 'portfolio' // 'portfolio' or 'credential'
}) {
  const portfolioRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  // Generate portfolio data from platform profile
  const generatePortfolioData = () => {
    // Get verified platforms
    const platforms = Object.entries(platformProfile || {})
      .filter(([_key, data]) => data?.isVerified && typeof data === 'object' && data.handle)
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
    let contributions = 0;

    // LeetCode stats
    const leetcodeStats = platformProfile?.leetcode?.isVerified ? platformProfile.leetcode.stats : null;
    if (leetcodeStats) {
      totalSolved += leetcodeStats.totalSolved || 0;
      easySolved += leetcodeStats.easySolved || 0;
      mediumSolved += leetcodeStats.mediumSolved || 0;
      hardSolved += leetcodeStats.hardSolved || 0;
      if (leetcodeStats.ranking) globalRank = leetcodeStats.ranking;
      activeDays += leetcodeStats.activeDays || 0; // SUM, not MAX
    }

    // Codeforces stats
    const cfStats = platformProfile?.codeforces?.isVerified ? platformProfile.codeforces.stats : null;
    if (cfStats) {
      if (cfStats.rating) {
        contestRating = cfStats.rating;
        maxContestRating = Math.max(maxContestRating, cfStats.maxRating || cfStats.rating);
      }
      activeDays += cfStats.activeDays || 0; // SUM, not MAX
    }

    // CodeChef stats
    const ccStats = platformProfile?.codechef?.isVerified ? platformProfile.codechef.stats : null;
    if (ccStats) {
      if (ccStats.rating) {
        contestRating = Math.max(contestRating, ccStats.rating);
        maxContestRating = Math.max(maxContestRating, ccStats.rating);
      }
      activeDays += ccStats.activeDays || 0; // SUM, not MAX
    }

    // GFG stats
    const gfgStats = platformProfile?.geeksforgeeks?.isVerified ? platformProfile.geeksforgeeks.stats : null;
    if (gfgStats) {
      totalSolved += gfgStats.problemsSolved || 0;
    }

    // AtCoder stats
    const atcoderStats = platformProfile?.atcoder?.isVerified ? platformProfile.atcoder.stats : null;
    if (atcoderStats) {
      // Add any problems solved if available
      totalSolved += atcoderStats.problemsSolved || 0;
    }

    // HackerRank stats
    const hackerrankStats = platformProfile?.hackerrank?.isVerified ? platformProfile.hackerrank.stats : null;
    if (hackerrankStats) {
      totalSolved += hackerrankStats.problemsSolved || 0;
    }

    // GitHub stats
    const githubHandle = platformProfile?.github?.isVerified ? platformProfile.github.handle : null;
    const githubStats = platformProfile?.github?.isVerified ? platformProfile.github.stats : null;
    if (githubStats?.contributions) {
      contributions = githubStats.contributions;
    }

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
        // More realistic distribution based on common problem patterns
        { label: 'Arrays & Strings', value: Math.floor(totalSolved * 0.30) },
        { label: 'Dynamic Programming', value: Math.floor(totalSolved * 0.18) },
        { label: 'Trees & Graphs', value: Math.floor(totalSolved * 0.15) },
        { label: 'Hashing & Maps', value: Math.floor(totalSolved * 0.12) },
        { label: 'Linked Lists', value: Math.floor(totalSolved * 0.08) },
        { label: 'Stacks & Queues', value: Math.floor(totalSolved * 0.08) },
        { label: 'Searching & Sorting', value: Math.floor(totalSolved * 0.09) },
      ] : [],
      contests: {
        leetcode: leetcodeStats?.contestsAttended || 0,
        codechef: ccStats?.contestsAttended || 0,
        codeforces: cfStats?.contestsAttended || 0,
        atcoder: atcoderStats?.contestsAttended || 0,
      },
      contestRating: contestRating || 0,
      maxContestRating: maxContestRating || 0,
      contestRank: ccStats?.rank || cfStats?.rank || 'N/A',
      awards: platforms
        .map(p => {
          const platformKey = p.name.toLowerCase().replace(/\s+/g, '');
          const stats = platformProfile[platformKey]?.stats || {};

          // Check if platform has any non-zero stats
          const hasValidStats = Object.values(stats).some(val =>
            typeof val === 'number' && val > 0
          );

          return hasValidStats ? {
            name: p.name,
            category: 'platform',
            stats: stats
          } : null;
        })
        .filter(Boolean), // Remove null entries
      ratingHistory: contestRating > 0 ? [contestRating] : [],
      totalQuestions: totalSolved || 0,
      activeDays: activeDays || 0,
      globalRank: globalRank || 0,
      maxRank: maxContestRating || 0,
      leetcodeHandle: platformProfile?.leetcode?.handle || null,
      codeforcesHandle: platformProfile?.codeforces?.handle || null,
      codechefHandle: platformProfile?.codechef?.handle || null,
      contributions: contributions || 0,
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
    console.log('Starting PDF export...');

    if (!portfolioRef.current) {
      console.error('Portfolio preview not ready');
      toast.error('Portfolio preview not ready. Please try again.');
      return;
    }

    setIsExporting(true);

    try {
      const element = portfolioRef.current;
      const clonedElement = element.cloneNode(true);
      document.body.appendChild(clonedElement);
      clonedElement.style.position = 'absolute';
      clonedElement.style.left = '-9999px';
      clonedElement.style.top = '0';

      // Fix oklch colors
      const fixColors = (el) => {
        const styles = window.getComputedStyle(el);
        ['color', 'backgroundColor', 'borderColor'].forEach(prop => {
          const value = styles[prop];
          if (value && value.includes('oklch')) {
            el.style[prop] = 'transparent';
          }
        });

        Array.from(el.children).forEach(fixColors);
      };

      fixColors(clonedElement);

      // Capture the cloned element as a high-quality image
      const canvas = await html2canvas(clonedElement, {
        scale: 3, // Higher quality
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        width: clonedElement.scrollWidth,
        height: clonedElement.scrollHeight,
        windowWidth: clonedElement.scrollWidth,
        windowHeight: clonedElement.scrollHeight,
        scrollX: 0,
        scrollY: 0,
      });

      document.body.removeChild(clonedElement);

      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      if (!imgData || imgData === 'data:,') {
        throw new Error('Failed to generate image from portfolio');
      }

      // Create PDF with proper dimensions
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const isLandscape = imgWidth > imgHeight;
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'px',
        format: 'a4',
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Scale image to fit page width while maintaining aspect ratio
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;

      // Center the image on the page
      const xOffset = (pdfWidth - scaledWidth) / 2;
      const yOffset = (pdfHeight - scaledHeight) / 2;

      // Add the full image to PDF
      pdf.addImage(imgData, 'JPEG', xOffset, yOffset, scaledWidth, scaledHeight, undefined, 'FAST');

      const filename = `DSA_Portfolio_${userName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
      pdf.save(filename);

      console.log('PDF exported successfully');
      toast.success('Portfolio downloaded successfully!');
    } catch (error) {
      console.error('PDF export failed:', error.message);
      toast.error(`Failed to export PDF: ${error.message || 'Unknown error'}. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  }; const portfolioData = generatePortfolioData();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden border flex flex-col scrollbar-thin"
            onClick={(e) => e.stopPropagation()}
          >
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
                <Button
                  size="sm"
                  onClick={handleDownloadPDF}
                  disabled={isExporting}
                  className="gap-2 bg-[#116466] text-white hover:bg-[#0e4f50]"
                >
                  <Download className="h-4 w-4" />
                  {isExporting ? 'Exporting...' : 'Download PDF'}
                </Button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  disabled={isExporting}
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
                  userAvatar={userAvatar}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 text-center">
              <p className="text-xs text-gray-500">
                <span className="font-semibold">Note:</span> Portfolio data is generated from your verified platform profiles.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
