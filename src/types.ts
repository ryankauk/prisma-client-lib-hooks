
import {
  GraphQLNamedType,
  GraphQLObjectType,
  NonNullTypeNode,
  NamedTypeNode,
  ListTypeNode,
  TypeNode
} from 'graphql';


export function isObjectType(object: GraphQLNamedType): object is GraphQLObjectType {
  return !!(object.astNode && object.astNode.kind === 'ObjectTypeDefinition');
}
export function isNamed(object: NamedTypeNode | ListTypeNode): object is NamedTypeNode {
  return object.kind === 'NamedType';
}
export function isNonNull(object: TypeNode): object is NonNullTypeNode {
  return object.kind === 'NonNullType';
}
export interface BaseCtx<T extends string> {
  modelName: T;
  modelNameFnEnding: string;
}

export abstract class Hook<
  CreateCtx extends BaseCtx<string> = BaseCtx<string>,
  UpdateCtx extends BaseCtx<string> = BaseCtx<string>,
  DeleteCtx extends BaseCtx<string> = BaseCtx<string>
  > {
  abstract models: { [k: string]: boolean };
  'createAfter'?: (data: string[], ctx: CreateCtx) => Promise<any>;
  'updateBefore'?: (data: string[], ctx: UpdateCtx) => Promise<any>;
  'updateAfter'?: (data: string[], ctx: UpdateCtx) => Promise<any>;

  'deleteBefore'?: (data: string[], ctx: DeleteCtx) => Promise<any>;
  'deleteAfter'?: (data: string[], ctx: DeleteCtx) => Promise<any>;

  constructor() { }

}
