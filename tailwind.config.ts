import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				note: {
					DEFAULT: '#f9fafb',
					hover: '#f3f4f6',
					selected: '#e5e7eb',
					border: '#e2e8f0'
				}
			},
			typography: {
				DEFAULT: {
					css: {
						maxWidth: 'none',
						color: 'var(--tw-prose-body)',
						'[class~="lead"]': {
							color: 'var(--tw-prose-lead)'
						},
						a: {
							color: 'var(--tw-prose-links)',
							textDecoration: 'underline',
							fontWeight: '500'
						},
						strong: {
							color: 'var(--tw-prose-bold)',
							fontWeight: '600'
						},
						'ol[type="A"]': {
							'--list-counter-style': 'upper-alpha'
						},
						'ol[type="a"]': {
							'--list-counter-style': 'lower-alpha'
						},
						'ol[type="A" s]': {
							'--list-counter-style': 'upper-alpha'
						},
						'ol[type="a" s]': {
							'--list-counter-style': 'lower-alpha'
						},
						'ol[type="I"]': {
							'--list-counter-style': 'upper-roman'
						},
						'ol[type="i"]': {
							'--list-counter-style': 'lower-roman'
						},
						'ol[type="I" s]': {
							'--list-counter-style': 'upper-roman'
						},
						'ol[type="i" s]': {
							'--list-counter-style': 'lower-roman'
						},
						'ol[type="1"]': {
							'--list-counter-style': 'decimal'
						},
						'ol > li': {
							position: 'relative'
						},
						'ol > li::before': {
							content: 'counter(list-item, var(--list-counter-style, decimal)) "."',
							position: 'absolute',
							fontWeight: '400',
							color: 'var(--tw-prose-counters)'
						},
						'ul > li': {
							position: 'relative'
						},
						'ul > li::before': {
							content: '""',
							position: 'absolute',
							backgroundColor: 'var(--tw-prose-bullets)',
							borderRadius: '50%'
						},
						hr: {
							borderColor: 'var(--tw-prose-hr)',
							borderTopWidth: 1
						},
						blockquote: {
							fontWeight: '500',
							fontStyle: 'italic',
							color: 'var(--tw-prose-quotes)',
							borderLeftWidth: '0.25rem',
							borderLeftColor: 'var(--tw-prose-quote-borders)',
							quotes: '"\\201C""\\201D""\\2018""\\2019"'
						},
						'blockquote p:first-of-type::before': {
							content: 'open-quote'
						},
						'blockquote p:last-of-type::after': {
							content: 'close-quote'
						},
						h1: {
							color: 'var(--tw-prose-headings)',
							fontWeight: '800'
						},
						'h1 strong': {
							fontWeight: '900',
							color: 'inherit'
						},
						h2: {
							color: 'var(--tw-prose-headings)',
							fontWeight: '700'
						},
						'h2 strong': {
							fontWeight: '800',
							color: 'inherit'
						},
						h3: {
							color: 'var(--tw-prose-headings)',
							fontWeight: '600'
						},
						'h3 strong': {
							fontWeight: '700',
							color: 'inherit'
						},
						h4: {
							color: 'var(--tw-prose-headings)',
							fontWeight: '600'
						},
						'h4 strong': {
							fontWeight: '700',
							color: 'inherit'
						},
						code: {
							color: 'var(--tw-prose-code)',
							fontWeight: '600'
						},
						'code::before': {
							content: '"`"'
						},
						'code::after': {
							content: '"`"'
						},
						'a code': {
							color: 'inherit'
						},
						'h1 code': {
							color: 'inherit'
						},
						'h2 code': {
							color: 'inherit'
						},
						'h3 code': {
							color: 'inherit'
						},
						'h4 code': {
							color: 'inherit'
						},
						'blockquote code': {
							color: 'inherit'
						},
						'thead': {
							color: 'var(--tw-prose-headings)',
							fontWeight: '600',
							borderBottomWidth: '1px',
							borderBottomColor: 'var(--tw-prose-th-borders)'
						},
						'thead th': {
							verticalAlign: 'bottom'
						},
						'tbody tr': {
							borderBottomWidth: '1px',
							borderBottomColor: 'var(--tw-prose-td-borders)'
						},
						'tbody tr:last-child': {
							borderBottomWidth: '0'
						},
						'tbody td': {
							verticalAlign: 'baseline'
						}
					}
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				'slide-up': {
					from: { transform: 'translateY(10px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' }
				},
				'pulse': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
				'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
