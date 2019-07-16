function spellNumbersOut(word: string) {
  if (word) {
    return word.replace(/(\s){1,}/g, '.').split('').join(' ').replace(/ [\/\.]/g, '.');
  }
  return word;
}

export { spellNumbersOut };
