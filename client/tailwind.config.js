/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            animation: {
                'splash-pulse': 'splashPulse 2s ease-in-out infinite',
                'float-pumpkin': 'floatPumpkin 8s ease-in-out infinite',
                'float-ghost': 'floatGhost 9s ease-in-out infinite',
                'fade-in-down': 'fadeInDown 1s ease-out',
                'fade-in-up': 'fadeInUp 1s ease-out 0.3s both',
                'title-glow': 'titleGlow 3s ease-in-out infinite',
                'icon-float': 'iconFloat 2s ease-in-out infinite',
                'spin': 'spin 1s linear infinite',
                'pulse': 'pulse 2s ease-in-out infinite',
                'slide-in-right': 'slideInRight 0.3s ease-out',
                'stat-flash': 'statFlash 0.5s ease-out',
                'value-increase': 'valueIncrease 0.6s ease-out',
                'value-decrease': 'valueDecrease 0.6s ease-out',
                'change-indicator-float': 'changeIndicatorFloat 1.5s ease-out forwards',
                'float': 'float 4s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'bounce': 'bounce 0.6s ease-out',
            },
            keyframes: {
                splashPulse: {
                    '0%, 100%': { opacity: '0.6' },
                    '50%': { opacity: '1' },
                },
                floatPumpkin: {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '25%': { transform: 'translateY(-30px) rotate(3deg)' },
                    '50%': { transform: 'translateY(-15px) rotate(-3deg)' },
                    '75%': { transform: 'translateY(-25px) rotate(2deg)' },
                },
                floatGhost: {
                    '0%, 100%': { transform: 'translateY(0px) translateX(0px)', opacity: '0.2' },
                    '25%': { transform: 'translateY(-25px) translateX(10px)', opacity: '0.3' },
                    '50%': { transform: 'translateY(-10px) translateX(-10px)', opacity: '0.25' },
                    '75%': { transform: 'translateY(-20px) translateX(5px)', opacity: '0.3' },
                },
                fadeInDown: {
                    from: { opacity: '0', transform: 'translateY(-30px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                titleGlow: {
                    '0%, 100%': {
                        textShadow: '0 0 20px rgba(255, 107, 53, 0.8), 0 0 40px rgba(255, 107, 53, 0.6), 0 0 60px rgba(255, 107, 53, 0.4), 0 0 80px rgba(255, 107, 53, 0.2), 4px 4px 8px rgba(0, 0, 0, 0.9)'
                    },
                    '50%': {
                        textShadow: '0 0 30px rgba(255, 107, 53, 1), 0 0 50px rgba(255, 107, 53, 0.8), 0 0 70px rgba(255, 107, 53, 0.6), 0 0 90px rgba(255, 107, 53, 0.4), 4px 4px 8px rgba(0, 0, 0, 0.9)'
                    },
                },
                fadeInUp: {
                    from: { opacity: '0', transform: 'translateY(30px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                iconFloat: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
                spin: {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                },
                pulse: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.6' },
                },
                slideInRight: {
                    from: { opacity: '0', transform: 'translateX(100%)' },
                    to: { opacity: '1', transform: 'translateX(0)' },
                },
                statFlash: {
                    '0%': { filter: 'brightness(1)' },
                    '50%': { filter: 'brightness(1.3)' },
                    '100%': { filter: 'brightness(1)' },
                },
                valueIncrease: {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.2)' },
                },
                valueDecrease: {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(0.9)' },
                },
                changeIndicatorFloat: {
                    '0%': { opacity: '0', transform: 'translateY(0) scale(0.8)' },
                    '20%': { opacity: '1', transform: 'translateY(-0.5rem) scale(1)' },
                    '80%': { opacity: '1', transform: 'translateY(-1.5rem) scale(1)' },
                    '100%': { opacity: '0', transform: 'translateY(-2rem) scale(0.8)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                glow: {
                    '0%': {
                        textShadow: '0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.6), 0 0 30px rgba(255, 215, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.5)'
                    },
                    '100%': {
                        textShadow: '0 0 20px rgba(255, 215, 0, 1), 0 0 30px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.6), 0 4px 8px rgba(0, 0, 0, 0.5)'
                    },
                },
                bounce: {
                    '0%': { transform: 'scale(0.3)', opacity: '0' },
                    '50%': { transform: 'scale(1.05)' },
                    '70%': { transform: 'scale(0.9)' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}