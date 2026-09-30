// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

// @nuxt/eslint leaves formatting alone by default (stylistic rules are opt-in),
// so Prettier owns formatting and the two never disagree.
export default withNuxt()
