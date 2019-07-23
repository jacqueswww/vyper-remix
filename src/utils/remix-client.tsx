import { createIframeClient, Api, Status, HighlightPosition, CompilationResult, RemixApi } from '@remixproject/plugin';
import { Contract } from './compiler';

export class RemixClient {
  private client = createIframeClient<Api, RemixApi>();

  loaded() {
    return this.client.onload()
  }

  /** Emit an event when file changed */
  async onFileChange(cb: (contract: string) => any) {
    this.client.on('fileManager', 'currentFileChanged', async (name) => {
      if (!name) return
      cb(name)
    })
  }

  /** Load Ballot contract example into the file manager */
  async loadContract({name, content}: Contract) {
    await this.client.call('fileManager', 'setFile', name, content)
    this.client.call('fileManager', 'switchFile', name)
  }

  /** Update the status of the plugin in remix */
  changeStatus(status: Status) {
    this.client.emit('statusChanged', status);
  }

  /** Highlight a part of the editor */
  highlight(lineColumnPos: HighlightPosition, name: string, color: string) {
    return this.client.call('editor', 'highlight', lineColumnPos, name, color)
  }

  /** Remove current Hightlight */
  discardHighlight() {
    return this.client.call('editor', 'discardHighlight')
  }

  /** Get the name of the current contract */
  async getContractName(): Promise<string> {
    await this.client.onload()
    return this.client.call('fileManager', 'getCurrentFile')
  }

  /** Get the current contract file */
  async getContract(): Promise<Contract> {
    const name = await this.getContractName()
    if (!name) throw new Error('No contract selected yet')
    const content = ''
    return {
      name,
      content,
    }
  }

  /** Emit an event to Remix with compilation result */
  compilationFinish(title: string, content: string, data: CompilationResult) {
    this.client.emit('compilationFinished', title, content, 'vyper', data);
  }
}

export const remixClient = new RemixClient()
// export const RemixClientContext = React.createContext(new RemixClient())