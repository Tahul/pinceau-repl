import { version } from 'pinceau'

export const PINCEAU_VERSION = version
export const defaultThemeFile = 'tokens.config.ts'
export const defaultTheme = `import { defineTheme } from 'pinceau'
import type { PinceauTheme, ThemeTokens } from 'pinceau'

export default defineTheme({
  media: {
    sm: '(min-width: 640px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
    xxl: '(min-width: 1536px)',
  },

  font: {
    primary: 'Supreme, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji'
  },

  color: {
    white: '#FFFFFF',
    black: '#191919',
    dimmed: 'rgba(0, 0, 0, .35)',
    dark: 'rgba(255, 255, 255, .15)',
    blue: {
      50: '#C5CDE8',
      100: '#B6C1E2',
      200: '#99A8D7',
      300: '#7B8FCB',
      400: '#5E77C0',
      500: '#4560B0',
      600: '#354A88',
      700: '#25345F',
      800: '#161E37',
      900: '#06080F',
    },
    red: {
      50: '#FCDFDA',
      100: '#FACFC7',
      200: '#F7AEA2',
      300: '#F48E7C',
      400: '#F06D57',
      500: '#ED4D31',
      600: '#D32F12',
      700: '#A0240E',
      800: '#6C1809',
      900: '#390D05',
    },
    green: {
      50: '#CDF4E5',
      100: '#BCF0DC',
      200: '#9AE9CB',
      300: '#79E2BA',
      400: '#57DAA8',
      500: '#36D397',
      600: '#26AB78',
      700: '#1B7D58',
      800: '#114F38',
      900: '#072117',
    },
    yellow: {
      50: '#FFFFFF',
      100: '#FFFFFF',
      200: '#FFFFFF',
      300: '#FFFFFF',
      400: '#FFFFFF',
      500: '#FBEFDE',
      600: '#F5D7AC',
      700: '#EFBE7A',
      800: '#E9A648',
      900: '#DE8D1B',
    },
    grey: {
      50: '#F7F7F7',
      100: '#EBEBEB',
      200: '#D9D9D9',
      300: '#C0C0C0',
      400: '#A8A8A8',
      500: '#979797',
      600: '#7E7E7E',
      700: '#656565',
      800: '#4D4D4D',
      900: '#2E2E2E',
    },
    primary: {
      100: {
        initial: '{color.red.100}',
        dark: '{color.red.900}',
      },
      200: {
        initial: '{color.red.200}',
        dark: '{color.red.800}',
      },
      300: {
        initial: '{color.red.300}',
        dark: '{color.red.700}',
      },
      400: {
        initial: '{color.red.400}',
        dark: '{color.red.600}',
      },
      500: {
        initial: '{color.red.500}',
        dark: '{color.red.500}',
      },
      600: {
        initial: '{color.red.600}',
        dark: '{color.red.400}',
      },
      700: {
        initial: '{color.red.700}',
        dark: '{color.red.300}',
      },
      800: {
        initial: '{color.red.800}',
        dark: '{color.red.200}',
      },
      900: {
        initial: '{color.red.900}',
        dark: '{color.red.100}',
      },
    },
  },

  shadow: {
    xs: '0 1px 2px 0 {color.grey.800}',
    sm: '0 1px 2px -1px {color.grey.800}, 0 1px 3px 0 {color.grey.800}',
    md: '0 2px 4px -2px {color.grey.800}, 0 4px 6px -1px {color.grey.800}',
    lg: '0 4px 6px -4px {color.grey.800}, 0 10px 15px -3px {color.grey.800}',
    xl: '0 8px 10px -6px {color.grey.800}, 0 20px 25px -5px {color.grey.800}',
    xxl: '0 25px 50px -12px {color.grey.800}',
  },

  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  fontSize: {
    'xs': '12px',
    'sm': '14px',
    'md': '16px',
    'lg': '18px',
    'xl': '20px',
    'xxl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px',
    '7xl': '72px',
    '8xl': '96px',
    '9xl': '128px',
  },

  letterSpacing: {
    tighter: '-.05em',
    tight: '-0025em',
    normal: '0em',
    wide: '0025em',
    wider: '.05em',
    widest: '0.1em',
  },

  lead: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  radii: {
    '2xs': '0.125rem',
    'xs': '0.25rem',
    'sm': '0.375rem',
    'md': '0.5rem',
    'lg': '1rem',
    'xl': '1rem',
    'xxl': '1.5rem',
    'full': '9999px',
  },

  size: {
    4: '4px',
    6: '6px',
    8: '8px',
    12: '12px',
    16: '16px',
    20: '20px',
    24: '24px',
    32: '32px',
    40: '40px',
    48: '48px',
    56: '56px',
    64: '64px',
    80: '80px',
    104: '104px',
    200: '200px',
  },

  space: {
    0: '0',
    1: '1px',
    2: '2px',
    4: '4px',
    6: '6px',
    8: '8px',
    10: '10px',
    12: '12px',
    16: '16px',
    20: '20px',
    24: '24px',
    32: '32px',
    40: '40px',
    44: '44px',
    48: '48px',
    56: '56px',
    64: '64px',
    80: '80px',
    104: '104px',
    140: '140px',
    200: '200px',
  },

  borderWidth: {
    noBorder: '0',
    sm: '1px',
    md: '2px',
    lg: '3px',
  },

  opacity: {
    noOpacity: '0',
    bright: '0.1',
    light: '0.15',
    soft: '0.3',
    medium: '0.5',
    high: '0.8',
    total: '1',
  },

  zIndex: {
    0: '0',
    1: '1px',
    2: '2px',
    4: '4px',
    6: '6px',
    8: '8px',
    10: '10px',
    12: '12px',
    16: '16px',
    20: '20px',
    24: '24px',
    32: '32px',
    40: '40px',
    44: '44px',
    48: '48px',
    56: '56px',
    64: '64px',
    80: '80px',
    104: '104px',
    140: '140px',
    200: '200px',
  },

  transition: {
    all: 'all .1s ease-in-out',
  },

  utils: {
    my: (v) => ({
      marginTop: v,
      marginBottom: v,
    }),
    mx: (v) => ({
      marginLeft: v,
      marginRight: v,
    }),
  },
})
`

export const defaultMainFile = 'App.vue'
export const defaultComponent = `<script setup lang="ts">
import MyButton from './MyButton.vue'
</script>

<template>
    <div>
      <MyButton color="primary">Hello World!</MyButton>
    </div>
</template>

<style lang="ts">
css({
  '#app': {
    padding: '{space.16}',
    backgroundColor: '#1e1e1e',
    display: 'flex',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw'
  }
})
</style>
`.trim()

export const defaultComponentFile = 'MyButton.vue'
export const buttonComponent = `<script setup lang="ts">
import type { PinceauTheme } from 'pinceau'
import { computedStyle } from 'pinceau/runtime'

defineProps({
  color: computedStyle<keyof PinceauTheme['color']>('red'),
  ...variants,
})
</script>

<template>
    <button class="my-button">
      <span>
        <slot />
      </span>
    </button>
</template>

<style scoped lang="ts">
css({
    '.my-button': {
        '--button-primary': (props) => \`{color.\${props.color}.600}\`,
        '--button-secondary': (props) => \`{color.\${props.color}.500}\`,
        display: 'inline-block',
        borderRadius: '{radii.xl}',
        transition: '{transition.all}',
        color: '{color.white}',
        boxShadow: \`0 5px 0 {button.primary}, 0 12px 16px {color.dimmed}\`,
        span: {
            display: 'inline-block',
            fontFamily: '{font.primary}',
            borderRadius: '{radii.lg}',
            fontSize: '{fontSize.xl}',
            lineHeight: '{lead.none}',
            transition: '{transition.all}',
            backgroundColor: '{button.primary}',
            boxShadow: 'inset 0 -1px 1px {color.dark}',
        },
        '&:hover': {
            span: {
                backgroundColor: '{button.secondary}',
            }
        },
        '&:active': {
            span: {
                transform: 'translateY({space.1})'
            }
        }
    },
    variants: {
        size: {
            sm: {
                span: {
                    padding: '{space.6} {space.8}'
                },
            },
            md: {
                span: {
                    padding: '{space.8} {space.12}'
                },
            },
            lg: {
                span: {
                    padding: '{space.12} {space.24}'
                },
            },
            options: {
                default: { initial: 'sm', md: 'md', lg: 'lg' },
            },
        },
    },
})
</style>`
