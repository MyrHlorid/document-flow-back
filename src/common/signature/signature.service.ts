import { Injectable } from '@nestjs/common';
import { BinaryLike, createSign, createVerify } from 'crypto';
import * as process from "process";

@Injectable()
export class SignatureService {
  private privateKey: string = "process.env.PRIVATE_KEY";
  private publicKey: string = "process.env.PUBLIC_KEY";

  signDocument(fileBuffer: BinaryLike): string {
    const signer = createSign('sha256');
    signer.update(fileBuffer);
    signer.end();

    return signer.sign(this.privateKey, 'hex');
  }

  verifySignature(fileBuffer: BinaryLike, signature: string): boolean {
    const verifier = createVerify('sha256');
    verifier.update(fileBuffer);
    verifier.end();

    return verifier.verify(this.publicKey, signature, 'hex');
  }
}