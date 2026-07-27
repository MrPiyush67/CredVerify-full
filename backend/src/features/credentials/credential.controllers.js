import { ApiResponse } from '#src/utils/ApiResponse.js';
import { asyncHandler } from '#src/utils/asyncHandler.js';
import { Credential } from './credential.model.js';

export const getCredentials = asyncHandler(async (req, res) => {
  const credentials = await Credential.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(req.user._id) } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: '$type', credentials: { $push: '$$ROOT' } } },
    { $project: { _id: 0, type: '$_id', credentials: 1 } },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, credentials, 'credentials fetched successfully'),
    );
});
