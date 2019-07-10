import { Prisma, models, ClientConstructor } from '../../../generated/prisma-client-ts/index';
import {
  buildSchema,
  GraphQLNamedType,
  GraphQLObjectType,
  NonNullTypeNode,
  NamedTypeNode,
  ListTypeNode,
  TypeNode
} from 'graphql';
import { typeDefs } from '../../../generated/prisma-client-ts/prisma-schema';
const schema = buildSchema(typeDefs);

function isObjectType(object: GraphQLNamedType): object is GraphQLObjectType {
  return object.astNode.kind === 'ObjectTypeDefinition';
}
function isNamed(object: NamedTypeNode | ListTypeNode): object is NamedTypeNode {
  return object.kind === 'NamedType';
}
function isNonNull(object: TypeNode): object is NonNullTypeNode {
  return object.kind === 'NonNullType';
}
export interface BaseCtx<T extends string>{
  modelName: T; 
  modelNameFnEnding:string;
}

export abstract class Hook<
CreateCtx extends BaseCtx<string> = BaseCtx<string>,
UpdateCtx extends BaseCtx<string> = BaseCtx<string>,
DeleteCtx extends BaseCtx<string> = BaseCtx<string>
> {
  abstract models: { [k: string]: string };
  createAfter: (data: string[], ctx: CreateCtx) => Promise<any>;
  updateBefore: (data: string[], ctx: UpdateCtx) => Promise<any>;
  updateAfter: (data: string[], ctx: UpdateCtx) => Promise<any>;

  deleteBefore: (data: string[], ctx: DeleteCtx) => Promise<any>;
  deleteAfter: (data: string[], ctx: DeleteCtx) => Promise<any>;

  constructor() {}
  public runChecks() {
    let notExists = Object.keys(this.models).reduce((arr, modelName) => {
      if (!models.find(el => el.name === modelName)) {
        arr.push(modelName);
      }
      return arr;
    }, []);

    if (notExists.length > 0) throw Error(`Models ${notExists.join(',')} don't exist in prisma schema`);

    let noIds = Object.keys(this.models).reduce((arr, modelName) => {
      let Type = schema.getType(modelName);
      if (!isObjectType(Type)) {
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
  }
}
