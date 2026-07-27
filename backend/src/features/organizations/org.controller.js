import { ApiResponse } from '#src/utils/ApiResponse.js';
import { asyncHandler } from '#src/utils/asyncHandler.js';
import Organization from './org.model.js';

export const getAllOrgs = asyncHandler(async (req, res) => {
  const orgs = await Organization.find({ verificationStatus: 'approved' })
    .select('_id name logo type')
    .sort({ name: 1 });
  return res
    .status(200)
    .json(new ApiResponse(200, orgs, 'orgs fetched successfully'));
});
