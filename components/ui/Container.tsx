import { cn } from '@/lib/utils';

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
    as?: React.ElementType;
}

export function Container({ children, className, as: Component = 'div' }: ContainerProps) {
    return (
        <Component className={cn('container-custom', className)}>
            {children}
        </Component>
    );
}
