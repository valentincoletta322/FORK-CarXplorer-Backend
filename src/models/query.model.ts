import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";

@modelOptions({
    schemaOptions: {"collection": "Queries"}
})
class Query {
    @prop({required: true})
    queryId!: number // Id de la consulta
    
    @prop({required: true})
    author!: string // Usuario de la consulta

    @prop({required: true})
    listingNumber!: number // Id del producto consultado

    @prop({required: true})
    content!: string // Consulta

    @prop({required: true})
    datetime!: Date // Fecha de creacion de la consulta

    @prop({required: true})
    wasAnswered!: Boolean // Si fue respondida o no

    @prop({required:false})
    answer!: string // Respuesta del vendedor

}

export const queryModel = getModelForClass(Query)
