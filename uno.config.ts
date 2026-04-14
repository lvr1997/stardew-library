import { defineConfig, presetIcons, presetWind3 } from 'unocss'

export default defineConfig({
  theme: {
    colors: {
      primary: '#dc7f02',
      secondary: '#ffe7bb',
      danger: '#dc2626',
    },
    fontSize: {
      xs: '.75rem',
      sm: '.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem'
    },
    spacing: {
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      5: '1.25rem'
    },
    keyframes: {
      'popover-in': {
        '0%': {
          opacity: '0',
          transform: 'scale(0.96)',
        },
        '100%': {
          opacity: '1',
          transform: 'scale(1)',
        },
      },
      'popover-out': {
        '0%': {
          opacity: '1',
          transform: 'scale(1)',
        },
        '100%': {
          opacity: '0',
          transform: 'scale(0.96)',
        },
      },
    },
    animation: {
      'popover-in': 'popover-in 180ms cubic-bezier(0.16, 1, 0.3, 1)',
      'popover-out': 'popover-out 140ms ease-in',
    },
  },
  shortcuts: {
    'input-base': 'cursor-pointer rounded-sm border-2 border-solid border-[#662800] bg-primary text-[#5e2c2a] text-left hover:bg-[#e08a16] hover:border-[#7a3500] focus:outline-none focus:bg-[#e2941e] focus:border-[#8a3d00] disabled:bg-[#d7a76d] disabled:border-[#a66d3a] disabled:text-[#7b5a47] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm',
    'bg-backdrop': 'backdrop-blur bg-white/50',
  },
  presets: [
    presetWind3(),
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle'
      }
    })
  ]
})
