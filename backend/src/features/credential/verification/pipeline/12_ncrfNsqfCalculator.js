import { calculateNcrfAndNsqf } from '../../services/courseAnalysis.service.js';

/**
 * Stage 12: NCrF/NSQF Calculator
 * Calculates NCrF credits and determines NSQF level
 *
 * @param {Object} courseData - Scraped course data
 * @returns {Promise<Object>} - NCrF and NSQF calculation results
 */
export async function calculateNcrfNsqf(courseData) {
  console.log(`📊 [STAGE 12: NCRF-NSQF-CALCULATOR] Calculating NCrF credits and NSQF level...`);

  if (!courseData) {
    console.warn(`⚠️  [STAGE 12] No course data available for calculations`);
    return {
      success: false,
      ncrf: null,
      nsqf: null,
      warning: 'No course data available for NCrF/NSQF calculations',
    };
  }

  try {
    // Call combined endpoint for efficiency
    const result = await calculateNcrfAndNsqf(courseData);

    if (result.success) {
      const { ncrf, nsqf } = result;

      console.log(`✅ [STAGE 12] Calculations complete`);
      console.log(`   NCrF Credits:`);
      console.log(`     - Raw: ${ncrf.credits_raw}`);
      console.log(`     - Rounded: ${ncrf.credits_rounded}`);
      console.log(`     - Floor: ${ncrf.credits_floor}`);
      console.log(`     - Ceiling: ${ncrf.credits_ceiling}`);

      if (ncrf.can_compute) {
        console.log(`     - Source: ${ncrf.source}`);
        console.log(`     - Estimated Hours: ${ncrf.duration_parsed?.estimated_hours || 'N/A'}`);
      } else {
        console.warn(`     ⚠️  Could not compute NCrF credits: ${ncrf.error || 'Unknown reason'}`);
      }

      console.log(`   NSQF Level:`);
      console.log(`     - Level: ${nsqf.level} (${nsqf.level_descriptor})`);
      console.log(`     - Confidence: ${(nsqf.confidence * 100).toFixed(0)}%`);
      console.log(`     - Method: ${nsqf.method}`);

      return {
        success: true,
        ncrf: {
          credits_raw: ncrf.credits_raw,
          credits_floor: ncrf.credits_floor,
          credits_rounded: ncrf.credits_rounded,
          credits_ceiling: ncrf.credits_ceiling,
          duration_parsed: ncrf.duration_parsed,
          can_compute: ncrf.can_compute,
          source: ncrf.source,
          formula: ncrf.formula,
          reference: ncrf.reference,
        },
        nsqf: {
          level: nsqf.level,
          level_descriptor: nsqf.level_descriptor,
          justification: nsqf.justification,
          confidence: nsqf.confidence,
          method: nsqf.method,
        },
      };
    } else {
      throw new Error(result.error || 'Calculation failed');
    }

  } catch (error) {
    console.error(`❌ [STAGE 12] NCrF/NSQF calculations failed:`, error.message);

    // Check if it's a service availability issue
    if (error.message.includes('unavailable')) {
      console.error(`   ⚠️  Python NCrF/NSQF calculator service is not running`);
      console.error(`   ⚠️  Make sure to start it with: cd backend/ncrf-nsqf-service && python3 app.py`);
    }

    // Provide fallback values
    console.warn(`   ⚠️  Using fallback values (NCrF: null, NSQF: 5)`);

    return {
      success: false,
      error: error.message,
      ncrf: {
        credits_raw: 0,
        credits_floor: 0,
        credits_rounded: 0,
        credits_ceiling: 0,
        can_compute: false,
        source: 'calculation_failed',
      },
      nsqf: {
        level: 5, // Default to intermediate
        level_descriptor: 'Intermediate',
        confidence: 0.3,
        method: 'fallback',
        justification: {
          process: 'Could not determine',
          professional_knowledge: 'Could not determine',
          professional_skills: 'Could not determine',
          core_skills: 'Could not determine',
          responsibility: 'Could not determine',
        },
      },
      warning: 'NCrF/NSQF calculations failed but fallback values assigned',
    };
  }
}

/**
 * Validate NCrF/NSQF calculation results
 * @param {Object} result - Calculation result
 * @returns {boolean} - True if results are valid
 */
export function validateCalculationResults(result) {
  if (!result || !result.success) {
    return false;
  }

  // Check NCrF results
  if (result.ncrf) {
    if (result.ncrf.can_compute) {
      if (typeof result.ncrf.credits_rounded !== 'number' || result.ncrf.credits_rounded < 0) {
        console.warn(`⚠️  [STAGE 12] Invalid NCrF credits: ${result.ncrf.credits_rounded}`);
        return false;
      }
    }
  }

  // Check NSQF results
  if (result.nsqf) {
    if (typeof result.nsqf.level !== 'number' || result.nsqf.level < 1 || result.nsqf.level > 10) {
      console.warn(`⚠️  [STAGE 12] Invalid NSQF level: ${result.nsqf.level}`);
      return false;
    }
  }

  return true;
}
