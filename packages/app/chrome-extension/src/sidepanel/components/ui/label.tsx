import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';

import { cn } from '../../lib/utils.js';

/**
 * shadcn/ui Label 컴포넌트이다.
 */
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  );
}

export { Label };
