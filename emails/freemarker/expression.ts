export const exp = <T = never>(name: T, sanitize = true) =>
  sanitize ? '${kcSanitize(' + name + ')?no_esc}' : '${' + name + '}'
