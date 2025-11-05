import { prisma } from "../db.js";

export const addEvent = async (req, res) => {
  try {
    const { nome, descricao, horario, local, pastor, aoVivo, link, date } = req.body;
    const event = await prisma.event.create({
      data: {
        nome,
        descricao,
        horario,
        local,
        pastor,
        aoVivo: !!aoVivo,
        link,
        date: date ? new Date(date) : null,
      }
    });
    res.json({ msg: "Evento criado", event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const listEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({ include: { attendees: true } });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const confirmPresence = async (req, res) => {
  const { eventId } = req.body;
  const userId = req.userId;

  const event = await prisma.event.update({
    where: { id: Number(eventId) },
    data: { attendees: { connect: { id: userId } } },
    include: { attendees: true }
  });
  res.json({ msg: "Presença confirmada", event });
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, horario, local, pastor, aoVivo, link, date } = req.body;
    const event = await prisma.event.update({
      where: { id: Number(id) },
      data: {
        ...(nome !== undefined && { nome }),
        ...(descricao !== undefined && { descricao }),
        ...(horario !== undefined && { horario }),
        ...(local !== undefined && { local }),
        ...(pastor !== undefined && { pastor }),
        ...(aoVivo !== undefined && { aoVivo }),
        ...(link !== undefined && { link }),
        ...(date !== undefined && { date: date ? new Date(date) : null }),
      }
    });
    res.json({ msg: "Evento atualizado", event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.event.delete({ where: { id: Number(id) } });
    res.json({ msg: "Evento excluído" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
