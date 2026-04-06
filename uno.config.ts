import { defineConfig, presetIcons, presetUno } from 'unocss'

export default defineConfig({
  theme: {
    colors: {
      primary: 'var(--color-primary)',
      secondary: 'var(--color-secondary)',
      danger: 'var(--color-danger)',
      background: 'var(--color-bg)'
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
    }
  },
  shortcuts: {
    'btn': 'p-2 h-9 bg-[#dc7f02] text-[#5e2c2a] rounded-sm border-2 border-solid border-[#662800]',
    'input': 'border-2 border-solid border-[#662800] text-[#5e2c2a] bg-transparent rounded-sm focus:outline-none disabled:bg-[#d7a76d] disabled:border-[#a66d3a] disabled:text-[#7b5a47] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm',
    'input-base': 'cursor-pointer rounded-sm border-2 border-solid border-[#662800] bg-[#dc7f02] text-[#5e2c2a] text-left hover:bg-[#e08a16] hover:border-[#7a3500] focus:outline-none focus:bg-[#e2941e] focus:border-[#8a3d00] disabled:bg-[#d7a76d] disabled:border-[#a66d3a] disabled:text-[#7b5a47] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm'
  },
  presets: [
    presetUno(),
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle'
      }
    })
  ]
})
