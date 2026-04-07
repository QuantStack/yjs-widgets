import { Kernel, KernelMessage } from '@jupyterlab/services';
import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import {
  Awareness,
  applyAwarenessUpdate,
  encodeAwarenessUpdate
} from 'y-protocols/awareness';
import * as syncProtocol from 'y-protocols/sync';
import * as Y from 'yjs';
import { IDisposable } from '@lumino/disposable';

export enum YMessageType {
  SYNC = 0,
  AWARENESS = 1
}

export interface IYCommProviderOptions {
  comm: Kernel.IComm;
  ydoc: Y.Doc;
  /**
   * If omitted, a new Awareness is created for this doc.
   * When the UI is backed by a shared Y doc (e.g. @jupyter/ydoc), pass that
   * document’s Awareness so comm traffic matches the rest of the session.
   */
  awareness?: Awareness;
}

export class YCommProvider implements IDisposable {
  constructor(options: IYCommProviderOptions) {
    this._comm = options.comm;
    this._ydoc = options.ydoc;

    if (options.awareness) {
      this._awareness = options.awareness;
      this._ownsAwareness = false;
    } else {
      this._awareness = new Awareness(this._ydoc);
      this._ownsAwareness = true;
    }

    this._ydoc.on('update', this._updateHandler);
    this._awareness.on('update', this._awarenessUpdateHandler);

    this._connect();
  }

  get doc(): Y.Doc {
    return this._ydoc;
  }

  get awareness(): Awareness {
    return this._awareness;
  }

  get synced(): boolean {
    return this._synced;
  }

  set synced(state: boolean) {
    if (this._synced !== state) {
      this._synced = state;
    }
  }

  get isDisposed(): boolean {
    return this._isDisposed;
  }

  dispose(): void {
    if (this._isDisposed) {
      return;
    }
    this._ydoc.off('update', this._updateHandler);
    this._awareness.off('update', this._awarenessUpdateHandler);
    if (this._ownsAwareness) {
      this._awareness.destroy();
    }
    this._comm.close();
    this._isDisposed = true;
  }

  private _onMsg = (msg: KernelMessage.ICommMsgMsg<'iopub' | 'shell'>) => {
    if (msg.buffers) {
      const buffer = msg.buffers[0] as ArrayBuffer;
      const buffer_uint8 = new Uint8Array(
        ArrayBuffer.isView(buffer) ? buffer.buffer : buffer
      );
      const encoder = Private.readMessage(this, buffer_uint8, true);
      if (encoding.length(encoder) > 1) {
        this._sendOverComm(encoding.toUint8Array(encoder));
      }
    }
  };

  private _updateHandler = (update: Uint8Array, origin: unknown) => {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, YMessageType.SYNC);
    syncProtocol.writeUpdate(encoder, update);
    this._sendOverComm(encoding.toUint8Array(encoder));
  };

  private _awarenessUpdateHandler = (change: {
    added: number[];
    updated: number[];
    removed: number[];
  }) => {
    const { added, updated, removed } = change;
    const clients = added.concat(updated, removed);
    if (clients.length === 0) {
      return;
    }

    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, YMessageType.AWARENESS);
    const awarenessBody = encodeAwarenessUpdate(this._awareness, clients);
    encoding.writeVarUint8Array(encoder, awarenessBody);
    this._sendOverComm(encoding.toUint8Array(encoder));
  };

  private _connect() {
    this._sync();
    this._comm.onMsg = this._onMsg;
  }

  private _sync(): void {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, YMessageType.SYNC);
    syncProtocol.writeSyncStep1(encoder, this._ydoc);
    this._sendOverComm(encoding.toUint8Array(encoder));
  }

  private _sendOverComm(bufferArray: Uint8Array) {
    this._comm.send({}, undefined, [bufferArray.buffer]);
  }

  private _comm: Kernel.IComm;
  private _ydoc: Y.Doc;
  private _awareness: Awareness;
  private _ownsAwareness: boolean;
  private _synced: boolean;
  private _isDisposed = false;
}

namespace Private {
  export function syncMessageHandler(
    encoder: encoding.Encoder,
    decoder: decoding.Decoder,
    provider: YCommProvider,
    emitSynced: boolean
  ): void {
    encoding.writeVarUint(encoder, YMessageType.SYNC);
    const syncMessageType = syncProtocol.readSyncMessage(
      decoder,
      encoder,
      provider.doc,
      provider
    );
    if (
      emitSynced &&
      syncMessageType === syncProtocol.messageYjsSyncStep2 &&
      !provider.synced
    ) {
      syncProtocol.writeSyncStep2(encoder, provider.doc);
      provider.synced = true;
    }
  }

  export function readMessage(
    provider: YCommProvider,
    buf: Uint8Array,
    emitSynced: boolean
  ): encoding.Encoder {
    const decoder = decoding.createDecoder(buf);
    const encoder = encoding.createEncoder();
    const messageType = decoding.readVarUint(decoder);

    switch (messageType) {
      case YMessageType.SYNC:
        syncMessageHandler(encoder, decoder, provider, emitSynced);
        break;
      case YMessageType.AWARENESS: {
        const awarenessUpdate = decoding.readVarUint8Array(decoder);
        applyAwarenessUpdate(provider.awareness, awarenessUpdate, null);
        break;
      }
      default:
        console.error('Unable to compute message');
    }
    return encoder;
  }
}
