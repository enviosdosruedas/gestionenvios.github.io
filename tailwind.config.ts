import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
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
        'royal-blue-traditional': {
          DEFAULT: '#00296b',
          100: '#000815',
          200: '#00102b',
          300: '#001940',
          400: '#002156',
          500: '#00296b', // same as DEFAULT
          600: '#0048bc',
          700: '#0d6aff',
          800: '#5e9cff',
          900: '#aecdff'
        },
        'marian-blue': {
          DEFAULT: '#003f88',
          100: '#000d1c',
          200: '#001a37',
          300: '#002753',
          400: '#00336e',
          500: '#003f88', // same as DEFAULT
          600: '#0063d4',
          700: '#2088ff',
          800: '#6ab0ff',
          900: '#b5d7ff'
        },
        'polynesian-blue': {
          DEFAULT: '#00509d',
          100: '#001020',
          200: '#00213f',
          300: '#00315f',
          400: '#00417e',
          500: '#00509d', // same as DEFAULT
          600: '#0076e4',
          700: '#2c99ff',
          800: '#72bbff',
          900: '#b9ddff'
        },
        'mikado-yellow': {
          DEFAULT: '#fdc500',
          100: '#332800',
          200: '#665000',
          300: '#997800',
          400: '#cca000',
          500: '#fdc500', // same as DEFAULT
          600: '#ffd333',
          700: '#ffde66',
          800: '#ffe999',
          900: '#fff4cc'
        },
        'gold': {
          DEFAULT: '#ffd500',
          100: '#332b00',
          200: '#665500',
          300: '#998000',
          400: '#ccaa00',
          500: '#ffd500', // same as DEFAULT
          600: '#ffdd33',
          700: '#ffe666',
          800: '#ffee99',
          900: '#fff6cc'
        }
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
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
