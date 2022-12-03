import WebSocket from 'ws';

export interface LogicResolver {
  resolve(messageFromServer: string): string;
}

export default class GameAPI {
  private host: string;
  private logicResolver: LogicResolver;

  constructor(host: string, logicResolver: LogicResolver) {
    this.host = host;
    this.logicResolver = logicResolver;
  }

  private getWSUrl = (url: string) => {
    return url.replace('https', 'wss').replace('board/player/', 'ws?user=').replace('?code=', '&code=');
  };

  public connect = () => {
    const url = this.getWSUrl(this.host);
    console.log(url);
    const socket = new WebSocket(url);
    console.log('Opening...');

    socket.on('open', () => {
      console.log('Web socket client opened ' + url);
    });

    socket.on('error', (e) => {
      console.log(e);
      console.log('Web socket client error');
    });

    socket.on('close', () => {
      console.log('Web socket client closed');
    });

    socket.on('message', (message) => {
      const command = this.logicResolver.resolve(message.toString());
      socket.send(command);
    });

    return socket;
  };
}
