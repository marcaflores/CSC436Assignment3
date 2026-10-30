// Letters that aren't a base letter plus an accent, so NFD can't simplify them.
const SPECIAL_LETTERS = { ø: 'o', æ: 'ae', œ: 'oe', ß: 'ss', ł: 'l', đ: 'd', ı: 'i' }

// Lowercase and strip accents so "martinez" finds "Martínez" and "odegaard" finds "Ødegaard".
export function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[øæœßłđı]/g, (letter) => SPECIAL_LETTERS[letter])
}
