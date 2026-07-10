import mongoose, { mongo } from 'mongoose';

const employerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  companyName: {
    type: String,
    default: null,
  },
  industry: {
    type: String,
    default: null,
  },
  companySize: {
    type: String,
    default: null,
  },
  companyDescription: {
    type: String,
    maxlength: 1000,
    default: null,
  },
  companyLocation: {
    type: String,
    default: null,
  },
});

const EmployerPorfile = mongoose.model(
  'EmployerProfile',
  employerProfileSchema,
);

export default EmployerPorfile;
