import { cn } from '@/lib/utils';

export function Title({ className, ...props }: React.ComponentProps<'h1'>) {
  return (
    <h1
      className={cn(
        'scroll-m-20 text-balance text-center font-medium text-4xl tracking-tight',
        className
      )}
      {...props}
    />
  );
}

export function Heading({ className, ...props }: React.ComponentProps<'h2'>) {
  return (
    <h2
      className={cn(
        'scroll-m-20 font-semibold text-3xl tracking-tight first:mt-0',
        className
      )}
      {...props}
    />
  );
}

export function Subheading({
  className,
  ...props
}: React.ComponentProps<'h3'>) {
  return (
    <h3
      className={cn(
        'scroll-m-20 font-semibold text-2xl tracking-tight',
        className
      )}
      {...props}
    />
  );
}

export function Text({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('not-first:mt-6 leading-7', className)} {...props} />;
}

export function Blockquote({
  className,
  ...props
}: React.ComponentProps<'blockquote'>) {
  return (
    <blockquote
      className={cn('mt-6 border-primary/50 border-l-2 pl-6', className)}
      {...props}
    />
  );
}

export function List({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      className={cn('my-6 ml-6 list-disc [&>li]:mt-2', className)}
      {...props}
    />
  );
}

export function Lead({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p className={cn('text-muted-foreground text-xl', className)} {...props} />
  );
}

export function Large({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('font-semibold text-lg', className)} {...props} />;
}

export function Small({ className, ...props }: React.ComponentProps<'small'>) {
  return (
    <small
      className={cn('font-medium text-sm leading-none', className)}
      {...props}
    />
  );
}

export function Muted({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p className={cn('text-muted-foreground text-sm', className)} {...props} />
  );
}
