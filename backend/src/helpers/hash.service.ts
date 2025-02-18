import { Injectable } from "@nestjs/common";
import { compare, hash } from "bcrypt-ts";

@Injectable()
export class HashService {
    private saltRounds: number = 10

    async hash(data: string): Promise<string> {
        return hash(data, this.saltRounds)
    }

    async compare(data: string, hash: string): Promise<boolean> {
        return compare(data, hash)
    }
}
