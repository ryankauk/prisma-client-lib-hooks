
import { provoke } from './hooks/index';
import { Model, Client as BaseClient, BaseClientOptions } from 'prisma-client-lib';
import { print } from 'graphql';

import { Hook, isObjectType, isNamed, isNonNull, BaseCtx } from './hooks/types';

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
      hooks.forEach(hook => {
        let notExists = Object.keys(hook.models).reduce((arr, modelName) => {

          if (!models.find(el => el.name === modelName)) {
            arr.push(modelName);
          }
          return arr;
        }, []);

        if (notExists.length > 0) throw Error(`Models ${notExists.join(',')} don't exist in prisma schema`);

        let noIds = Object.keys(hook.models).reduce((arr, modelName) => {
          let Type = this._schema.getType(modelName);
          if (!Type || !isObjectType(Type)) {
            arr.push(modelName);
            return arr;
          }
          let idType = Type.getFields()['id'];
          if (
            !idType ||
            !isNonNull(idType.astNode.type) ||
            !isNamed(idType.astNode.type.type) ||
            idType.astNode.type.type.name.value !== 'ID'
          ) {
            arr.push(modelName);
            return arr;
          }

          return arr;
        }, []);
        if (noIds.length > 0) throw Error(`Models ${noIds.join(',')} don't implement field id: ID!`);
      });
    }

    async execute(operation: any, document: any, variables: any) { // TODO: remove any

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

export { Hook, BaseCtx }