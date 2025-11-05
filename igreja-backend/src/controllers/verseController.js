import { prisma } from "../db.js";

export const getVerseOfDay = async (req, res) => {
  const verses = await prisma.verse.findMany({ take: 1000 });
  if (verses.length === 0) return res.json({ msg: "Nenhum versículo cadastrado" });

  const random = verses[Math.floor(Math.random() * verses.length)];
  res.json(random);
};

export const addVerse = async (req, res) => {
  const { bookId, chapter, verse, text } = req.body;
  const verseRec = await prisma.verse.create({ data: { bookId: Number(bookId), chapter: Number(chapter), verse: Number(verse), text } });
  res.json({ msg: "Versículo adicionado", verse: verseRec });
};

export const importVerses = async (req, res) => {
  res.status(501).json({ msg: "Use o script prisma/seed.js ou importe manualmente um JSON de versos conforme o README." });
};
