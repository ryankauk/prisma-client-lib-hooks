import { provoke } from './hooks/index';
import { Model, Client as BaseClient, BaseClientOptions } from 'prisma-client-lib';
import { print } from 'graphql';
import { DocumentNode, OperationTypeNode } from 'graphql';
import { Hook } from './hooks/types';
export function makePrismaClientClass<T>({
  typeDefs,
  endpoint,
  secret,
  models,
  hooks
}: {
  typeDefs: string;
  endpoint: string;
  secret?: string;
  models: Model[];
  hooks: Hook[];
}): T {
  return class Client extends BaseClient {
    hooks: Hook[] = hooks;
    constructor(options: BaseClientOptions) {
      super({ typeDefs, endpoint, secret, models, ...options });
      provoke.bind(this);
      hooks.forEach(hook => hook.runChecks());
    }

    async execute(operation, document, variables) {

      let query = print(document);
      let resolve = () => {
        return super.execute(operation, document, variables);
      };
      // return super.execute(operation, document, variables);
      if (provoke) {

        
        super.execute.bind(this);
        return provoke(this, resolve, operation, document, variables);
      } else {

        return super.execute(operation, document, variables);
      }
    }
  } as any;
}
