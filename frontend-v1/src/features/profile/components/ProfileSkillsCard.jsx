import { Badge, Card, CardContent } from '@/shared/ui';

export default function ProfileSkillsCard({ skills = [] }) {
  if (!skills.length) return null;

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Skills
        </h3>

        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
