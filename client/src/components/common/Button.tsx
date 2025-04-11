import React from 'react';
import { Link } from 'wouter';

interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'text';
    size?: 'small' | 'medium' | 'large';
    href?: string;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    className?: string;
    fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'medium',
    href,
    onClick,
    type = 'button',
    disabled = false,
    className = '',
    fullWidth = false,
}) => {
    const baseClasses = 'button';
    const variantClasses = `button-${variant}`;
    const sizeClasses = `button-${size}`;
    const widthClass = fullWidth ? 'button-full-width' : '';
    const disabledClass = disabled ? 'button-disabled' : '';

    const classes = `${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass} ${disabledClass} ${className}`.trim();

    if (href) {
        return (
            <Link href={href} className={classes}>
                {children}
            </Link>
        );
    }

    return (
        <button
            type={type}
            className={classes}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button; 