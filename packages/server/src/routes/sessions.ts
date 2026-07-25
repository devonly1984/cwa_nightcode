import { Hono } from "hono";
import { createSessionValidator } from "../schemas/sessionStream";
import {  prisma } from "@nightcode/database/client";
import { MessageStatus } from "@nightcode/database/enums";
import * as Sentry from "@sentry/hono/bun";
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
    Sentry.logger.info("Listed sessions", {
      count: sessions.length,
    });
    return c.json(sessions);
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!session) {
      Sentry.logger.warn("Session not found", {
        sessionId: id,
        userId: "mock-user"
      });
      return c.json({ error: "Session not found" }, 404);
    }
    Sentry.logger.info("Loaded session",{
      sessionID: session.id,
      messageCount: session.messages.length
    })
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
    Sentry.logger.info("Created session",{
      sessionId: session.id,
      title: session.title,

    })
    return c.json(session, 201);
  });

export default app;
