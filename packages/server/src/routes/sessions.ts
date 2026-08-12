import { Hono } from "hono";
import { createSessionValidator } from "../schemas/sessionStream";
import {  prisma } from "@nightcode/database/client";
import type { AuthenticatedEnv } from "../middleware/requireAuth";
import { requiredCreditsBalance } from '../middleware/requireCeditsBalance'



const app = new Hono<AuthenticatedEnv>()
  .get("/", async (c) => {
    const userId = c.get("userId")
    const sessions = await prisma.session.findMany({
      where: { userId },
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
    const id = c.req.param("id");
    const userId = c.get('userId')
    const session = await prisma.session.findUnique({
      where: { id, userId },
    
    });

 
    return c.json(session);
  })

  .post("/", requiredCreditsBalance, createSessionValidator, async (c) => {
    const {  ...data } = c.req.valid("json");
    const userId = c.get("userId")
    const session = await prisma.session.create({
      data: {
        ...data,
        userId
      }  
    })

    return c.json(session, 201);
  });

export default app;
