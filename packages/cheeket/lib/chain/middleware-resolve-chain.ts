import EventEmitter from "events";

import { Token } from "../token";
import { Middleware } from "../middleware";
import { Context } from "../context";
import ContextAdapter from "./context-adapter";
import ResolveChain from "./resolve-chain";

class MiddlewareResolveChain implements ResolveChain {
  constructor(
    readonly middlewareProvider: () => Middleware<unknown, unknown>,
    private readonly container: EventEmitter,
    private readonly next?: ResolveChain
  ) {}

  async resolve<T>(
    token: Token<T>,
    parent?: Context<unknown, unknown>
  ): Promise<T> {
    const context = new ContextAdapter(this, this.container, token, parent);
    const middleware = this.middlewareProvider();

    let nextValue: T | undefined;
    await middleware(context, async () => {
      if (this.next == null || context.response != null) {
        return;
      }
      nextValue = await this.next.resolve(token, context);
    });

    const value = context.response ?? nextValue;
    if (value != null) {
      return value;
    }

    throw new Error(`Can't resolve ${token.toString()}`);
  }
}

export default MiddlewareResolveChain;
