import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import "./Button.css";

// "group/button" has no declarations of its own (it's a marker for group-hover/button: on
// children), so it stays a literal class here rather than folding into .btn via @apply.
const buttonVariants = cva("btn group/button", {
    variants: {
        variant: {
            default: "btn--default",
            outline: "btn--outline",
            secondary: "btn--secondary",
            ghost: "btn--ghost",
            destructive: "btn--destructive",
            link: "btn--link",
        },
        size: {
            default: "btn--size-default",
            xs: "btn--size-xs",
            sm: "btn--size-sm",
            lg: "btn--size-lg",
            icon: "btn--size-icon",
            "icon-xs": "btn--size-icon-xs",
            "icon-sm": "btn--size-icon-sm",
            "icon-lg": "btn--size-icon-lg",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});

type ButtonProps = ButtonPrimitive.Props &
    VariantProps<typeof buttonVariants> & { scale?: number };

function Button({
    className,
    variant = "default",
    size = "default",
    scale,
    style,
    ...props
}: ButtonProps) {
    return (
        <ButtonPrimitive
            data-slot="button"
            className={cn(buttonVariants({ variant, size, className }), scale != null && "btn--scaled")}
            style={scale != null ? ({ ...style, "--btn-scale": scale } as CSSProperties) : style}
            {...props}
        />
    );
}

export { Button, buttonVariants };
export type { ButtonProps };
