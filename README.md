# JupyterLab extension for widgets based on Yjs

## Requirements

- JupyterLab == 4.0.0b0

## Installation

You can install yjs-widgets using pip:

```bash
pip install yjs-widgets
```

## Usage

```typescript
import { IJupyterYModel } from './types';
import { JupyterYModel } from './model';
import { IJupyterYWidgetManager } from './notebookrenderer/types';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

class MyWidget {
  constructor(yModel: IJupyterYModel, node: HTMLElement) {
    this.yModel = yModel;
    this.node = node;
    yModel.sharedModel.attrsChanged.connect(() => {
      this._attrsChanged();
    });
    node.textContent = 'Hello world!';
  }

  _attrsChanged(): void {
    const foo: string = this.yModel.sharedModel.getAttr('foo') as string;
    const bar: string = this.yModel.sharedModel.getAttr('bar') as string;
    this.node.textContent = `foo=${foo}, bar=${bar}`;
  }

  yModel: IJupyterYModel;
  node: HTMLElement;
}

export const foo: JupyterFrontEndPlugin<void> = {
  id: 'foo:bar',
  autoStart: true,
  requires: [IJupyterYWidgetManager],
  activate: (app: JupyterFrontEnd, wm: IJupyterYWidgetManager): void => {
    wm.registerWidget('MyWidget', JupyterYModel, MyWidget);
  }
};
```

## Contributing

yjs-widgets is an open-source project, and contributions are always welcome. If you would like to contribute, please fork the repository and submit a pull request.

See [CONTRIBUTING](CONTRIBUTING.md) for dev installation instructions.

## License

yjs-widgets is licensed under the BSD 3-Clause License. See the LICENSE file for more information.
