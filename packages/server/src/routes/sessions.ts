import { Hono } from "hono";

import { createSessionValidator } from "../schemas";
import { MessageStatus, prisma } from "@nightcode/database";

const app = new Hono()
  .get("/", async (c) => {
    const sessions = await prisma.session.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
    });
    return c.json(sessions);
  })
  .get("/:id", async (c) => {
    //MOCK
    //await new Promise((r) => setTimeout(r, 5000));

    /*throw new HTTPException(
        500,{
            message: "Mock error: session loading failed"
        }
    )*/
    const id = c.req.param("id");
    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }
    return c.json(session);
  })
  .post("/", createSessionValidator, async (c) => {
    const { initialMessage, ...data } = c.req.valid("json");
    const session = await prisma.session.create({
      data: {
        ...data,
        userId: "mock-user",
        ...(initialMessage && {
          messages: {
            create: {
              ...initialMessage,
              status: MessageStatus.COMPLETE,
            },
          },
        }),
      },
      include: { messages: true },
    });
    return c.json(session, 201);
  });

export default app;
