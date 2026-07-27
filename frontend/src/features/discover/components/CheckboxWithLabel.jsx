import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export function CheckboxWithLabel({ id = 1, label, ...props }) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id={id} {...props} />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
}
