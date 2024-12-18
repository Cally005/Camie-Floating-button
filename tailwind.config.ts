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
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
		  animation: {
			bounce: "bounce 0.3s infinite",
			animate: 'animate 3s linear infinite',
			rotate: 'rotate 0.9s linear infinite',
			// wave: "wave 1.2s infinite"
				blink: 'blink 1s infinite',
			waveLeft: "waveLeft 2s infinite ease-in-out",
			waveRight: "waveRight 2s infinite ease-in-out",
		  },
		  keyframes: {
			animate: {
			  '0%': { backgroundPosition: '-800px 0' },
			  '100%': { backgroundPosition: '800px 0' },
			  
			},
			rotate: {
				'100%': { transform: 'rotate(360deg)' },
			  },

			//   wave: {
			// 	'0%, 100%': { transform: 'scaleX(1)', opacity: '0.5' },
			// 	'50%': { transform: 'scaleX(1.5)', opacity: '1' },
			//   },
			waveLeft: {
				"0%, 100%": { transform: "translateX(-50%) scaleX(1)", opacity: "0.5" },
				"50%": { transform: "translateX(0) scaleX(2)", opacity: "1" },
			  },
			  waveRight: {
				"0%, 100%": { transform: "translateX(50%) scaleX(1)", opacity: "0.5" },
				"50%": { transform: "translateX(0) scaleX(2)", opacity: "1" },
			  },
			  blink: {
				'0%, 100%': { opacity: '0' },
				'50%': { opacity: '1' },
			  }
		  },
		 
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
