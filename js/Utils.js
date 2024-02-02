/** List of prefixes for Roman numerals */
const romanNumerals = [
    ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"],
    ["", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"],
    ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"],
    ["", "M", "MM", "MMM"]
]

/**
 * Converts a number to Roman numerals.
 * @param {number} num Number to convert.
 * @returns {string} Number as a Roman numeral.
 */
export function toRoman(num) {
    const thousands = Math.floor(num / 1000)
    const hundreds = Math.floor((num % 1000) / 100)
    const tens = Math.floor((num % 100) / 10)
    const ones = num % 10

    return (
        romanNumerals[3][thousands] +
        romanNumerals[2][hundreds] +
        romanNumerals[1][tens] +
        romanNumerals[0][ones]
    )
}
