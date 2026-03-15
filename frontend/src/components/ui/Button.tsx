import { type LucideIcon } from 'lucide-react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    isLoading?: boolean;
    icon?: LucideIcon;
}

export const Button = ({ title, variant = 'primary', isLoading, icon: Icon, className = '', disabled, ...props }: ButtonProps) => {
    return (
        <button
            className={`btn btn-${variant} ${isLoading ? 'btn-loading' : ''} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="spinner"></div>
            ) : (
                <>
                    {Icon && <Icon size={18} />}
                    <span>{title}</span>
                </>
            )}
        </button>
    );
};
