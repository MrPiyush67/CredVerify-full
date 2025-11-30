import React from 'react';
import { Layers, Briefcase, GraduationCap, Award, Building2, Calendar } from 'lucide-react';
import { BentoCard } from './BentoGrid';

export const SkillsCard = ({ skills = [] }) => (
  <BentoCard title="Skills & Expertise" icon={Layers} className="col-span-1 md:col-span-2" delay={0.3}>
    <div className="flex flex-wrap gap-2">
      {skills.length > 0 ? (
        skills.map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-colors cursor-default"
          >
            {skill}
          </span>
        ))
      ) : (
        <p className="text-gray-400 text-sm italic">No skills listed yet.</p>
      )}
    </div>
  </BentoCard>
);

export const ExperienceCard = ({ experience = [] }) => (
  <BentoCard title="Experience" icon={Briefcase} className="col-span-1 md:col-span-2 row-span-2" delay={0.4}>
    <div className="space-y-6 relative pl-2">
      <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
      {experience.length > 0 ? (
        experience.map((exp, index) => (
          <div key={index} className="relative flex gap-4 group">
            <div className="mt-1.5 relative z-10">
              <div className="w-3 h-3 rounded-full bg-white border-2 border-gray-400 group-hover:scale-125 transition-transform shadow-sm"></div>
            </div>
            <div className="flex-1 pb-2">
              <h4 className="text-base font-bold text-gray-900">{exp.position}</h4>
              <p className="text-sm font-medium text-gray-700 mb-1">{exp.company}</p>
              <div className="flex items-center text-xs text-gray-400 mb-2">
                <Calendar size={12} className="mr-1" />
                {new Date(exp.startDate).getFullYear()} - {exp.current ? 'Present' : new Date(exp.endDate).getFullYear()}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100 group-hover:border-gray-200 transition-colors">
                {exp.description}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-400 text-sm italic pl-6">No experience listed.</p>
      )}
    </div>
  </BentoCard>
);

export const EducationCard = ({ education = [] }) => (
  <BentoCard title="Education" icon={GraduationCap} className="col-span-1 md:col-span-2" delay={0.5}>
    <div className="space-y-4">
      {education.length > 0 ? (
        education.map((edu, index) => (
          <div key={index} className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
            <div className="p-2 bg-gray-50 text-gray-600 rounded-lg mt-1">
              <Building2 size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">{edu.institution}</h4>
              <p className="text-sm text-gray-700">{edu.degree} in {edu.fieldOfStudy}</p>
              <p className="text-xs text-gray-400 mt-1">
                {edu.startYear} - {edu.endYear}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-400 text-sm italic">No education listed.</p>
      )}
    </div>
  </BentoCard>
);

export const AchievementsCard = ({ achievements = [] }) => (
  <BentoCard title="Achievements" icon={Award} className="col-span-1 md:col-span-2" delay={0.6}>
    <div className="grid grid-cols-1 gap-3">
      {achievements.length > 0 ? (
        achievements.map((ach, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-600">
              <Award size={20} />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-gray-900 truncate">{ach.title}</h4>
              <p className="text-xs text-gray-600 truncate">{ach.issuer} • {new Date(ach.date).getFullYear()}</p>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-6 text-gray-400 text-sm italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
          No achievements added yet.
        </div>
      )}
    </div>
  </BentoCard>
);
