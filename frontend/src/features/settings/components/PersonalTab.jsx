import { useState } from 'react';
import { Plus, Trash2, GraduationCap, Briefcase } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

let tempIdCounter = 0;
const nextTempId = () => `temp-${Date.now()}-${tempIdCounter++}`;

const EMPTY_EDUCATION = () => ({
  _id: nextTempId(),
  institution: '',
  degree: '',
  fieldOfStudy: '',
  startYear: '',
  endYear: '',
  current: false,
});

const EMPTY_EXPERIENCE = () => ({
  _id: nextTempId(),
  company: '',
  position: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
});

// Trims Mongo's ISO date strings down to yyyy-MM-dd for <input type="date">.
function toDateInputValue(date) {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 10);
}

/**
 * @param {Object} props
 * @param {Object} props.user
 * @param {(data: Object) => void} props.onSave - called with the updated fields
 */
export function PersonalTab({ user, onSave }) {
  const [form, setForm] = useState({
    name: user?.name ?? '',
    username: user?.username ?? '',
    email: user?.email ?? '',
    phoneNo: user?.phoneNo ?? '',
    location: user?.location ?? '',
    bio: user?.bio ?? '',
    skills: (user?.skills ?? []).join(', '),
    linkedin: user?.socialLinks?.linkedin ?? '',
    github: user?.socialLinks?.github ?? '',
    portfolio: user?.socialLinks?.portfolio ?? '',
    website: user?.socialLinks?.website ?? '',
  });

  const [education, setEducation] = useState(
    (user?.education ?? []).length
      ? user.education.map((entry) => ({
          ...entry,
          _id: entry._id ?? nextTempId(),
        }))
      : [],
  );

  const [experience, setExperience] = useState(
    (user?.experience ?? []).length
      ? user.experience.map((entry) => ({
          ...entry,
          _id: entry._id ?? nextTempId(),
          startDate: toDateInputValue(entry.startDate),
          endDate: toDateInputValue(entry.endDate),
        }))
      : [],
  );

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const updateEducationField = (id, field) => (e) => {
    const value = e.target.value;
    setEducation((prev) =>
      prev.map((entry) =>
        entry._id === id ? { ...entry, [field]: value } : entry,
      ),
    );
  };

  const toggleEducationCurrent = (id) => (checked) => {
    setEducation((prev) =>
      prev.map((entry) =>
        entry._id === id
          ? {
              ...entry,
              current: checked,
              endYear: checked ? '' : entry.endYear,
            }
          : entry,
      ),
    );
  };

  const addEducation = () =>
    setEducation((prev) => [...prev, EMPTY_EDUCATION()]);
  const removeEducation = (id) =>
    setEducation((prev) => prev.filter((entry) => entry._id !== id));

  const updateExperienceField = (id, field) => (e) => {
    const value = e.target.value;
    setExperience((prev) =>
      prev.map((entry) =>
        entry._id === id ? { ...entry, [field]: value } : entry,
      ),
    );
  };

  const toggleExperienceCurrent = (id) => (checked) => {
    setExperience((prev) =>
      prev.map((entry) =>
        entry._id === id
          ? {
              ...entry,
              current: checked,
              endDate: checked ? '' : entry.endDate,
            }
          : entry,
      ),
    );
  };

  const addExperience = () =>
    setExperience((prev) => [...prev, EMPTY_EXPERIENCE()]);
  const removeExperience = (id) =>
    setExperience((prev) => prev.filter((entry) => entry._id !== id));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.({
      name: form.name,
      username: form.username,
      email: form.email,
      phoneNo: form.phoneNo,
      location: form.location,
      bio: form.bio,
      skills: form.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      socialLinks: {
        linkedin: form.linkedin,
        github: form.github,
        portfolio: form.portfolio,
        website: form.website,
      },
      education: education.map(({ _id, ...rest }) => ({
        ...rest,
        startYear: rest.startYear ? Number(rest.startYear) : undefined,
        endYear: rest.endYear ? Number(rest.endYear) : undefined,
      })),
      experience: experience.map(({ _id, ...rest }) => ({
        ...rest,
        startDate: rest.startDate ? new Date(rest.startDate) : undefined,
        endDate: rest.endDate ? new Date(rest.endDate) : undefined,
      })),
    });
  };

  return (
    <TabsContent value="personal">
      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>
            Update your personal details and profile information.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={form.name} onChange={update('name')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={form.username}
                  onChange={update('username')}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNo">Phone</Label>
                <Input
                  id="phoneNo"
                  value={form.phoneNo}
                  onChange={update('phoneNo')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location}
                onChange={update('location')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={4}
                value={form.bio}
                onChange={update('bio')}
                placeholder="Tell others a bit about yourself"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Input
                id="skills"
                value={form.skills}
                onChange={update('skills')}
                placeholder="React, Node.js, Solidity"
              />
              <p className="text-xs text-muted-foreground">
                Separate each skill with a comma.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Social links</h3>
                <p className="text-sm text-muted-foreground">
                  Where people can find you outside the platform.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={form.linkedin}
                    onChange={update('linkedin')}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    value={form.github}
                    onChange={update('github')}
                    placeholder="https://github.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolio">Portfolio</Label>
                  <Input
                    id="portfolio"
                    value={form.portfolio}
                    onChange={update('portfolio')}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={form.website}
                    onChange={update('website')}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <h3 className="text-sm font-medium">Education</h3>
                    <p className="text-sm text-muted-foreground">
                      Schools and programs you've attended.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEducation}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add education
                </Button>
              </div>

              {education.length === 0 && (
                <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                  No education added yet.
                </p>
              )}

              {education.map((entry, index) => (
                <div
                  key={entry._id}
                  className="space-y-4 rounded-md border p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">
                      Entry {index + 1}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeEducation(entry._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Institution</Label>
                      <Input
                        value={entry.institution}
                        onChange={updateEducationField(
                          entry._id,
                          'institution',
                        )}
                        placeholder="University name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Degree</Label>
                      <Input
                        value={entry.degree}
                        onChange={updateEducationField(entry._id, 'degree')}
                        placeholder="B.Tech, M.Sc, ..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Field of study</Label>
                    <Input
                      value={entry.fieldOfStudy}
                      onChange={updateEducationField(entry._id, 'fieldOfStudy')}
                      placeholder="Computer Science"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Start year</Label>
                      <Input
                        value={entry.startYear}
                        onChange={updateEducationField(entry._id, 'startYear')}
                        placeholder="2019"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End year</Label>
                      <Input
                        value={entry.endYear}
                        onChange={updateEducationField(entry._id, 'endYear')}
                        placeholder="2023"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`edu-current-${entry._id}`}
                      checked={entry.current}
                      onCheckedChange={toggleEducationCurrent(entry._id)}
                    />
                    <Label
                      htmlFor={`edu-current-${entry._id}`}
                      className="text-sm font-normal"
                    >
                      I'm currently studying here
                    </Label>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <h3 className="text-sm font-medium">Experience</h3>
                    <p className="text-sm text-muted-foreground">
                      Roles you've held.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addExperience}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add experience
                </Button>
              </div>

              {experience.length === 0 && (
                <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                  No experience added yet.
                </p>
              )}

              {experience.map((entry, index) => (
                <div
                  key={entry._id}
                  className="space-y-4 rounded-md border p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">
                      Entry {index + 1}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeExperience(entry._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input
                        value={entry.company}
                        onChange={updateExperienceField(entry._id, 'company')}
                        placeholder="Company name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Input
                        value={entry.position}
                        onChange={updateExperienceField(entry._id, 'position')}
                        placeholder="Software Engineer"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Start date</Label>
                      <Input
                        type="date"
                        value={entry.startDate}
                        onChange={updateExperienceField(entry._id, 'startDate')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End date</Label>
                      <Input
                        type="date"
                        value={entry.endDate}
                        onChange={updateExperienceField(entry._id, 'endDate')}
                        disabled={entry.current}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`exp-current-${entry._id}`}
                      checked={entry.current}
                      onCheckedChange={toggleExperienceCurrent(entry._id)}
                    />
                    <Label
                      htmlFor={`exp-current-${entry._id}`}
                      className="text-sm font-normal"
                    >
                      I currently work here
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      rows={3}
                      value={entry.description}
                      onChange={updateExperienceField(entry._id, 'description')}
                      placeholder="What did you work on?"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
