import { Card, CardContent } from '@/components/ui/card.jsx';
import { Field, FieldLabel } from '@/components/ui/field.jsx';
import React from 'react';
import { CheckboxWithLabel } from './CheckboxWithLabel.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Button } from '@/components/ui/button.jsx';
import toast from 'react-hot-toast';

const Filters = ({ showFilters }) => {
  return (
    <div
      className={`grid transition-all duration-300 ${
        showFilters
          ? 'grid-rows-[1fr] opacity-100'
          : 'grid-rows-[0fr] opacity-0'
      }`}
    >
      <div className="overflow-hidden">
        <Card>
          <CardContent className="space-y-8 p-6">
            {/* Row 1 */}
            <div className="grid gap-6 lg:grid-cols-4">
              <Field>
                <FieldLabel>Role</FieldLabel>

                <div className="space-y-2">
                  <CheckboxWithLabel label="Learner" />
                  <CheckboxWithLabel label="Issuer" />
                  <CheckboxWithLabel label="Regulator" />
                  <CheckboxWithLabel label="Organization Admin" />
                </div>
              </Field>

              <Field>
                <FieldLabel>Organization</FieldLabel>
                <Input placeholder="Google, Microsoft, MANIT..." />
              </Field>

              <Field>
                <FieldLabel>Location</FieldLabel>
                <Input placeholder="Bhopal, India" />
              </Field>

              <Field>
                <FieldLabel>Keywords</FieldLabel>
                <Input placeholder="Blockchain, AI, React..." />
              </Field>
            </div>

            {/* Row 2 */}
            <div className="grid gap-6 lg:grid-cols-4">
              <Field>
                <FieldLabel>Education</FieldLabel>
                <Input placeholder="Institution name" />
              </Field>

              <Field>
                <FieldLabel>Degree</FieldLabel>
                <Input placeholder="B.Tech, M.Tech, MBA..." />
              </Field>

              <Field>
                <FieldLabel>Experience</FieldLabel>

                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="0">0 - 2 Years</SelectItem>
                    <SelectItem value="2">2 - 5 Years</SelectItem>
                    <SelectItem value="5">5 - 10 Years</SelectItem>
                    <SelectItem value="10">10+ Years</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Skills</FieldLabel>
                <Input placeholder="React, Node.js, AWS..." />
              </Field>
            </div>

            {/* Row 3 */}
            <div className="grid gap-6 lg:grid-cols-4">
              <Field>
                <FieldLabel>Joined Between</FieldLabel>

                <div className="flex gap-2">
                  <Input type="date" placeholder="dd/mm/yyyy" />

                  <Input type="date" placeholder="dd/mm/yyyy" />
                </div>
              </Field>

              <Field>
                <FieldLabel>Sort By</FieldLabel>

                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Most Relevant" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="relevance">Most Relevant</SelectItem>

                    <SelectItem value="recent">Recently Joined</SelectItem>

                    <SelectItem value="credentials">
                      Most Credentials
                    </SelectItem>

                    <SelectItem value="name">Alphabetical</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Profile Status</FieldLabel>

                <div className="space-y-2">
                  <CheckboxWithLabel label="Public Profile" />
                  <CheckboxWithLabel label="Has Portfolio" />
                  <CheckboxWithLabel label="Has LinkedIn" />
                </div>
              </Field>

              <Field>
                <FieldLabel>Actions</FieldLabel>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => toast('Coming soon')}>
                    Reset
                  </Button>

                  <Button className="flex-1" onClick={() => toast('Coming soon')}>
                    Apply
                  </Button>
                </div>
              </Field>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Filters;
