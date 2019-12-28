import { Command, inject } from "peng-ioc";


export default class StartCmd extends Command {
    @inject("jwt", "update")
    update: (token: string, expiresIn: number) => string;
    execute(token:string,expiresIn) {
        return this.update(token,expiresIn);
        console.log("[更新Token]");
    }
}