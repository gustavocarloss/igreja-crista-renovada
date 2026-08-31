export const bibleVerses = [
  "Tudo posso naquele que me fortalece. (Filipenses 4:13)",
  "O Senhor é o meu pastor; de nada terei falta. (Salmos 23:1)",
  "Confie no Senhor de todo o seu coração. (Provérbios 3:5)",
  "Alegrem-se sempre no Senhor. (Filipenses 4:4)",
  "O choro pode persistir uma noite, mas de manhã irrompe a alegria. (Salmos 30:5)",
  "Ainda que eu ande pelo vale da sombra da morte, não temerei mal nenhum. (Salmos 23:4)",
  "Lancem sobre ele toda a sua ansiedade, porque ele tem cuidado de vocês. (1 Pedro 5:7)",
  "Mil poderão cair ao seu lado; dez mil, à sua direita, mas nada o atingirá. (Salmos 91:7)",
  "Não fui eu que ordenei a você? Seja forte e corajoso! (Josué 1:9)",
  "Busquem, pois, em primeiro lugar o Reino de Deus. (Mateus 6:33)"
]

export const getRandomVerse = () => {
  const randomIndex = Math.floor(Math.random() * bibleVerses.length)
  return bibleVerses[randomIndex]
}
