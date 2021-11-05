import ProviderStorage from "../provider-storage";
import Provider from "../provider";
import InternalTokens from "../internal-tokens";

function proxy(storage: ProviderStorage): Provider<unknown> {
  return async (context, next) => {
    const middleware = storage.get(InternalTokens.Middleware);
    await middleware?.(context, next);
  };
}

export default proxy;
