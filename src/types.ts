import { DocumentRegistry } from '@jupyterlab/docregistry';

import { MapChange, YDocument, StateChange } from '@jupyter/ydoc';

import { ISignal } from '@lumino/signaling';
import { JSONObject } from '@lumino/coreutils';

export interface IDict<T = any> {
  [key: string]: T;
}

export type ValueOf<T> = T[keyof T];

export interface IJupyterYDocChange {
    attrsChange?: MapChange;
    stateChange?: StateChange<any>[];
}

export interface IJupyterYDoc extends YDocument<IJupyterYDocChange> {
  attrs: JSONObject;

  getAttr(key: string): string | undefined;
  setAttr(key: string, value: string): void;
  removeAttr(key: string): void;

  attrsChanged: ISignal<IJupyterYDoc, MapChange>;

  disposed: ISignal<any, void>;
}

export interface IJupyterYModel extends DocumentRegistry.IModel {
  yModelName: string;
  isDisposed: boolean;
  sharedModel: IJupyterYDoc;

  sharedAttrsChanged: ISignal<IJupyterYDoc, MapChange>;

  getClientId(): number;

  disposed: ISignal<any, void>;
}
