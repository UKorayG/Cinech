declare module 'web3.storage' {
  export interface Web3Storage {
    put(files: File[], options?: PutOptions): Promise<string>;
    get(cid: string): Promise<Web3Response | null>;
    delete(cid: string): Promise<void>;
    status(cid: string): Promise<Status | undefined>;
  }

  export interface PutOptions {
    name?: string;
    maxRetries?: number;
    wrapWithDirectory?: boolean;
    onStoredChunk?: (size: number) => void;
  }

  export interface Web3Response {
    files(): Promise<Web3File[]>;
  }

  export interface Web3File {
    name: string;
    stream: () => ReadableStream<Uint8Array>;
    size: number;
    type: string;
  }

  export interface Status {
    cid: string;
    deals: Deal[];
    pin: Pin;
  }

  export interface Deal {
    dealId: number;
    storageProvider: string;
    status: string;
  }

  export interface Pin {
    cid: string;
    status: string;
  }

  export default function createClient(options: { token: string }): Web3Storage;
}
