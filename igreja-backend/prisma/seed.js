import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  // Clear existing data (development only)
  await prisma.event.deleteMany();
  await prisma.verse.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();

  const booksData = [{"name": "Gênesis", "order": 1}, {"name": "Êxodo", "order": 2}, {"name": "Levítico", "order": 3}, {"name": "Números", "order": 4}, {"name": "Deuteronômio", "order": 5}, {"name": "Josué", "order": 6}, {"name": "Juízes", "order": 7}, {"name": "Rute", "order": 8}, {"name": "1 Samuel", "order": 9}, {"name": "2 Samuel", "order": 10}, {"name": "1 Reis", "order": 11}, {"name": "2 Reis", "order": 12}, {"name": "1 Crônicas", "order": 13}, {"name": "2 Crônicas", "order": 14}, {"name": "Esdras", "order": 15}, {"name": "Neemias", "order": 16}, {"name": "Ester", "order": 17}, {"name": "Jó", "order": 18}, {"name": "Salmos", "order": 19}, {"name": "Provérbios", "order": 20}, {"name": "Eclesiastes", "order": 21}, {"name": "Cânticos", "order": 22}, {"name": "Isaías", "order": 23}, {"name": "Jeremias", "order": 24}, {"name": "Lamentações", "order": 25}, {"name": "Ezequiel", "order": 26}, {"name": "Daniel", "order": 27}, {"name": "Oseias", "order": 28}, {"name": "Joel", "order": 29}, {"name": "Amós", "order": 30}, {"name": "Obadias", "order": 31}, {"name": "Jonas", "order": 32}, {"name": "Miquéias", "order": 33}, {"name": "Naum", "order": 34}, {"name": "Habacuque", "order": 35}, {"name": "Sofonias", "order": 36}, {"name": "Ageu", "order": 37}, {"name": "Zacarias", "order": 38}, {"name": "Malaquias", "order": 39}, {"name": "Mateus", "order": 40}, {"name": "Marcos", "order": 41}, {"name": "Lucas", "order": 42}, {"name": "João", "order": 43}, {"name": "Atos", "order": 44}, {"name": "Romanos", "order": 45}, {"name": "1 Coríntios", "order": 46}, {"name": "2 Coríntios", "order": 47}, {"name": "Gálatas", "order": 48}, {"name": "Efésios", "order": 49}, {"name": "Filipenses", "order": 50}, {"name": "Colossenses", "order": 51}, {"name": "1 Tessalonicenses", "order": 52}, {"name": "2 Tessalonicenses", "order": 53}, {"name": "1 Timóteo", "order": 54}, {"name": "2 Timóteo", "order": 55}, {"name": "Tito", "order": 56}, {"name": "Filemom", "order": 57}, {"name": "Hebreus", "order": 58}, {"name": "Tiago", "order": 59}, {"name": "1 Pedro", "order": 60}, {"name": "2 Pedro", "order": 61}, {"name": "1 João", "order": 62}, {"name": "2 João", "order": 63}, {"name": "3 João", "order": 64}, {"name": "Judas", "order": 65}, {"name": "Apocalipse", "order": 66}];

  for (const b of booksData) {
    await prisma.book.create({ data: b });
  }

  // Create a test user
  const password = await bcrypt.hash("senha123", 8);
  await prisma.user.create({ data: { name: "Teste", email: "teste@exemplo.com", password } });

  // Create two test events
  await prisma.event.create({
    data: {
      nome: "Culto Familiar",
      descricao: "Culto semanal para toda a família.",
      horario: "Domingo 19h",
      local: "Templo Principal - Barueri",
      pastor: "Pastor João Silva",
      aoVivo: true,
      link: "https://www.youtube.com/@igrejacristarenovadabarueri",
      date: new Date(new Date().getTime() + 24*60*60*1000)
    }
  });

  await prisma.event.create({
    data: {
      nome: "Reunião de Jovens",
      descricao: "Encontro de jovens para estudo bíblico.",
      horario: "Sexta 20h",
      local: "Salão dos Jovens",
      pastor: "Pastor Marcos",
      aoVivo: false,
      date: new Date(new Date().getTime() + 3*24*60*60*1000)
    }
  });

  console.log("Seed finalizado.");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => { await prisma.$disconnect(); });
