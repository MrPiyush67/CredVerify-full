import React from 'react';
import { MapPin, ShieldCheck, Building2, User as UserIcon, Layers } from 'lucide-react';
import { Badge } from '@common/ui/Badge.jsx';
import { BentoCard } from './BentoGrid';

const ValidantCard = ({ data }) => (
  <BentoCard title="Authority Status" icon={ShieldCheck} className="col-span-1" delay={0.2}>
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
        <span className="text-sm text-gray-600">Authority ID</span>
        <span className="font-mono text-xs font-bold bg-gray-100 text-gray-800 px-2 py-1 rounded">
          {data.verificationAuthorityId || 'N/A'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-center">
          <p className="text-2xl font-bold text-emerald-600">{data.verifiedCount || 0}</p>
          <p className="text-xs text-gray-500 font-medium">Verified</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-center">
          <p className="text-2xl font-bold text-red-500">{data.rejectedCount || 0}</p>
          <p className="text-xs text-gray-500 font-medium">Rejected</p>
        </div>
      </div>
      <div className="text-xs text-center text-gray-700 font-medium bg-gray-50 p-2 rounded-lg">
        {data.institution || 'Independent Verifier'}
      </div>
    </div>
  </BentoCard>
);

const CuratorCard = ({ data }) => (
  <BentoCard title="Company Info" icon={Building2} className="col-span-1" delay={0.2}>
    <div className="space-y-4">
      <div>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Organization</p>
        <p className="font-bold text-gray-900 text-lg leading-tight">{data.companyName || 'Company Name'}</p>
      </div>
      <div className="space-y-2">
        {[
          { icon: Layers, text: data.industry || 'Tech' },
          { icon: UserIcon, text: `${data.companySize || '10-50'} employees` },
          { icon: MapPin, text: data.companyLocation || 'Remote' }
        ].map(({ icon: Icon, text }, idx) => (
          <div key={idx} className="flex items-center text-sm text-gray-600">
            <Icon size={14} className="mr-2 text-gray-400" />
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  </BentoCard>
);

const CredentialistCard = ({ data }) => (
  <BentoCard title="Profile Status" icon={UserIcon} className="col-span-1" delay={0.2}>
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
        <span className="text-sm font-medium text-gray-600">Visibility</span>
        <Badge variant={data.isPublic ? "default" : "secondary"} className={data.isPublic ? "bg-green-500 hover:bg-green-600" : ""}>
          {data.isPublic ? "Public" : "Private"}
        </Badge>
      </div>
      <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-xs text-blue-700 font-medium mb-1">Profile Completion</p>
        <div className="w-full bg-blue-200 rounded-full h-2 mb-1">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
        </div>
        <p className="text-right text-xs text-blue-600 font-bold">85%</p>
      </div>
    </div>
  </BentoCard>
);

export const RoleDetailsCard = ({ user, roleProfile }) => {
  const data = { ...user, ...roleProfile };

  const roleCards = {
    validant: ValidantCard,
    curator: CuratorCard,
    credentialist: CredentialistCard
  };

  const CardComponent = roleCards[user.role] || CredentialistCard;
  return <CardComponent data={data} />;
};
