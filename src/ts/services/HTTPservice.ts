import { IConfig, IWinner } from '../interfaces/Models';
import HtmlBuilder from '../view/HtmlBuilder';

export default class HTTPservice {
  private APP_CONFIG: IConfig;

  private htmlBuilder = new HtmlBuilder();

  constructor(json: IConfig) {
    this.APP_CONFIG = json;
  }

  public getAll<T>(): Promise<T> | never {
    return fetch(`${this.APP_CONFIG.server.path}${this.APP_CONFIG.server.garage}`, { method: 'GET' })
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          return response.json();
        }
        return `${response.status}: ${response.statusText}`;
      })
      .catch((err) => { throw new Error(`504: ${err.message}`); });
  }

  public getCarById<T>(id: number): Promise<T> | never {
    return fetch(`${this.APP_CONFIG.server.path}${this.APP_CONFIG.server.garage}/${id}`, { method: 'GET' })
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          return response.json();
        }
        return `${response.status}: ${response.statusText}`;
      })
      .catch((err) => { throw new Error(`504: ${err.message}`); });
  }

  public removeCarById<T>(id: number): Promise<T> | never {
    return fetch(`${this.APP_CONFIG.server.path}${this.APP_CONFIG.server.garage}/${id}`, { method: 'DELETE' })
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          return response.json();
        }
        return `${response.status}: ${response.statusText}`;
      })
      .catch((err) => { throw new Error(`504: ${err.message}`); });
  }

  public addCar<T>(name: string, color: string): Promise<T> | never {
    return fetch(`${this.APP_CONFIG.server.path}${this.APP_CONFIG.server.garage}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, color }),
    })
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          const res = response.json();
          return res;
        }
        return `${response.status}: ${response.statusText}`;
      })
      .catch((err) => { throw new Error(`504: ${err.message}`); });
  }

  public updateCar<T>(id: number, name: string, color: string): Promise<T> | never {
    return fetch(`${this.APP_CONFIG.server.path}${this.APP_CONFIG.server.garage}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, color }),
    })
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          return response.json();
        }
        return `${response.status}: ${response.statusText}`;
      })
      .catch((err) => { throw new Error(`504: ${err.message}`); });
  }

  public setEngine<T>(id: number, act: 'started' | 'stopped' | 'drive'): Promise<T> | never {
    if (act === 'stopped') this.htmlBuilder.carPhrase(id, this.getRandom(this.APP_CONFIG.phrases.reset), 3000);
    return fetch(`${this.APP_CONFIG.server.path}${this.APP_CONFIG.server.engine}?id=${id}&status=${act}`, {
      method: 'PATCH',
    })
      .then((response) => {
        if ((act === 'started' || act === 'stopped') && (response.status >= 200 && response.status < 300)) {
          if (act === 'started') {
            this.htmlBuilder.carSmokeBack(id, 'start');
            this.htmlBuilder.carPhrase(id, this.getRandom(this.APP_CONFIG.phrases.start), 2000);
          }
          return response.json();
        }
        if (act === 'drive' && response.status >= 200 && response.status < 300) {
          return response.json();
        }
        if (act === 'drive' && response.status === 500) {
          return response.status;
        }
        if (response.status >= 300) {
          return `${response.status}: ${response.statusText}`;
        }
        throw new Error('504: Server ERROR...');
      })
      .catch((err) => {
        throw new Error(`504: ${err.message}`);
      });
  }

  public getAllWinners<T>(sortCol = 'id', sortDirect = 'ASC'): Promise<T> | never {
    return fetch(`${this.APP_CONFIG.server.path}${this.APP_CONFIG.server.winners}?_sort=${sortCol}&_order=${sortDirect}`, { method: 'GET' })
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          return response.json();
        }
        return `${response.status}: ${response.statusText}`;
      })
      .catch((err) => { throw new Error(`504: ${err.message}`); });
  }

  public getWinnerById<T>(id: number): Promise<T> | never {
    return fetch(`${this.APP_CONFIG.server.path}${this.APP_CONFIG.server.winners}/${id}`, { method: 'GET' })
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          return response.json();
        }
        return `${response.status}: ${response.statusText}`;
      })
      .catch((err) => { throw new Error(`504: ${err.message}`); });
  }

  public updateWinnerById<T>(id: number, wins: number, time: number): Promise<T> | never {
    return fetch(`${this.APP_CONFIG.server.path}${this.APP_CONFIG.server.winners}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ wins, time }),
    })
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          return response.json();
        }
        return `${response.status}: ${response.statusText}`;
      })
      .catch((err) => { throw new Error(`504: ${err.message}`); });
  }

  public createWinner<T>(id: number, wins: number, time: number): Promise<T> | never {
    return fetch(`${this.APP_CONFIG.server.path}${this.APP_CONFIG.server.winners}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, wins, time }),
    })
      .then((response: Response) => {
        const res = response.json();
        return res;
      })
      .catch((err) => { throw new Error(`504: ${err.message}`); });
  }

  public deleteWinner<T>(id: number): Promise<T> | never | void {
    this.getWinnerById(id).then((res): Promise<T> | undefined => {
      const winner = res as IWinner | string;
      if (typeof winner === 'object') {
        return fetch(`${this.APP_CONFIG.server.path}${this.APP_CONFIG.server.winners}/${id}`, {
          method: 'DELETE',
        })
          .then((response: Response) => {
            const result = response.json();
            return result;
          })
          .catch((err) => { throw new Error(`504: ${err.message}`); });
      }
      return undefined;
    });
  }

  public addWinner<T>(id: number, time: number): Promise<T> | never {
    return this.getWinnerById(id)
      .then((w) => {
        const winner = w as IWinner | string;
        let res: Promise<T>;
        if (typeof winner === 'object' && winner.id && winner.wins) {
          res = this.updateWinnerById(
            id,
            winner.wins + 1,
            (time < winner.time) ? time : winner.time,
          );
        } else {
          res = this.createWinner(id, 1, time);
        }
        return res;
      })
      .catch((err) => { throw new Error(`504: ${err.message}`); });
  }

  public getRandom(list: string[]): string {
    return list[Math.floor((Math.random() * list.length))];
  }
}
