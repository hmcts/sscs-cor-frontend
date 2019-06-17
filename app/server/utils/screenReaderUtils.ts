function spellNumbersOut(word: string) {
  return word.replace(/(\s){1,}/g, '.').split('').join(' ').replace(/ [\/\.]/g, '.');
}

export { spellNumbersOut };
