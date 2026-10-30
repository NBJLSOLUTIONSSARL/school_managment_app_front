/**
 * Utility function to combine CSS classes cleanly, filtering falsy values.
 * Lightweight alternative to clsx/tailwind-merge.
 *
 * @param {...(string|boolean|null|undefined|Record<string, boolean>)} args
 * @returns {string} Combined class names string
 */
export function cn(...args) {
  const classes = []

  for (const arg of args) {
    if (!arg) continue

    if (typeof arg === 'string' || typeof arg === 'number') {
      classes.push(arg)
    } else if (Array.isArray(arg)) {
      const inner = cn(...arg)
      if (inner) classes.push(inner)
    } else if (typeof arg === 'object') {
      for (const [key, value] of Object.entries(arg)) {
        if (value) classes.push(key)
      }
    }
  }

  return classes.join(' ')
}

export default cn
