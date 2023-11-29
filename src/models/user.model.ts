import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";

@modelOptions({
    schemaOptions: {"collection": "users"}
})
class User {
    @prop({required: true})
    username!: string

    @prop({required: true})
    fullName!: string

    @prop({required: true})
    email!: string

    @prop({required: true})
    password!: string

    @prop({required: true})
    isVerified!: boolean

    @prop({required: true})
    isSeller!: boolean

    @prop({required: false})
    address!: string

    @prop({required: false})
    phone!: number
}

export const userModel = getModelForClass(User)
