import type { Context, Env } from 'hono'

export type HonoContext<E extends Env = Env> = Context<E>