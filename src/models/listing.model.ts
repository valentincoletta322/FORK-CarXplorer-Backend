import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";

@modelOptions({
    schemaOptions: {"collection": "Listing"}
})
class Listing {
    @prop({required: true})
    listingNumber!: number // id
    
    @prop({required: true})
    title!: string // Titulo de la publicacion

    @prop({required: true})
    description!: string 

    @prop({required: true})
    price!: number // Precio (10000)

    @prop({required:true})
    currency!: string // Moneda (ARS/USD)

    @prop({required: true})
    state!: string // Estados de la publicacion (Disponible, Pausada, etc.)

    @prop({required:true})
    author!: string // Debería ser el username del vendedor

    @prop({required:false})
    listingPhoto!: string;
}

export const listingModel = getModelForClass(Listing)
