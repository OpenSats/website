declare module 'crypto-js' {
  interface WordArray {
    words: number[];
    sigBytes: number;
    toString(encoder?: any): string;
    concat(wordArray: WordArray): WordArray;
    clamp(): void;
  }

  interface Encoder {
    parse(str: string): WordArray;
    stringify(wordArray: WordArray): string;
  }

  interface CipherParams {
    ciphertext: WordArray;
    key: WordArray;
    iv: WordArray;
    salt: WordArray;
    algorithm: any;
    mode: any;
    padding: any;
    blockSize: number;
    formatter: any;
  }

  interface CipherOption {
    iv?: WordArray | string;
    mode?: any;
    padding?: any;
    format?: any;
  }

  export const AES: {
    encrypt(message: string | WordArray, key: string | WordArray, option?: CipherOption): CipherParams;
    decrypt(ciphertext: CipherParams | string, key: string | WordArray, option?: CipherOption): WordArray;
  };

  export const HmacSHA256: (message: string | WordArray, key: string | WordArray) => WordArray;
  export const SHA256: (message: string | WordArray) => WordArray;

  export const enc: {
    Hex: Encoder;
    Latin1: Encoder;
    Utf8: Encoder;
    Utf16: Encoder;
    Utf16LE: Encoder;
    Base64: Encoder;
  };

  export default {
    AES,
    HmacSHA256,
    SHA256,
    enc
  };
}
