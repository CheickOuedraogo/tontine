import React, { forwardRef } from 'react';
import { type LucideIcon } from 'lucide-react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: LucideIcon;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, icon: Icon, className = '', ...props }, ref) => {
    return (
        <div className={`input-group ${className}`}>
            {label && <label className="input-label">{label}</label>}
            <div className={`input-container ${error ? 'input-error' : ''}`}>
                {Icon && <Icon className="input-icon" size={20} />}
                <input
                    ref={ref}
                    className="input-field"
                    {...props}
                />
            </div>
            {error && <span className="error-text">{error}</span>}
        </div>
    );
});

Input.displayName = 'Input';
