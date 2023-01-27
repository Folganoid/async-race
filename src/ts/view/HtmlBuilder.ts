import { ICar, IWinner } from '../interfaces/Models';

const flagStat = require('../../media/flag16.gif');
const flagAnim = require('../../media/flag18.gif');
const SmokeBack = require('../../media/smoke10.gif');
const SmokeAbove = require('../../media/smoke6.gif');
const BoomAbove = require('../../media/boom2.gif');
const CarSVG = require('../../media/car.svg');

type AttrList = { [k: string]: string };
type ClassList = string[];

export default class HtmlBuilder {
  messageCounter = 1;

  private timerId = setTimeout(() => 1, 0);

  public timerResult = '';

  public init(): void {
    this.buildPage('root');
  }

  public createElement(tag: string, classes: ClassList = [], attrs: AttrList = {}, ctx = ''): HTMLElement {
    const elem = document.createElement(tag);

    if (classes.length > 0) {
      for (let i = 0; i < classes.length; i += 1) {
        elem.classList.add(classes[i]);
      }
    }

    if (Object.keys(attrs).length > 0) {
      for (let i = 0; i < Object.keys(attrs).length; i += 1) {
        elem.setAttribute(Object.keys(attrs)[i], attrs[Object.keys(attrs)[i]]);
      }
    }

    if (ctx !== '') elem.innerHTML = ctx;

    return elem;
  }

  public buildPage(id: string): void | never {
    const rootBody: HTMLElement | null = document.getElementById(id);
    if (!rootBody) throw new Error(`Something wrong with #${id}`);

    const nav = this.createElement('nav');
    const garageBtn = this.createElement('button', ['active'], { id: 'garage-btn' }, 'Garage');
    const winBtn2 = this.createElement('button', [], { id: 'winners-btn' }, 'Winners');
    nav.append(garageBtn, winBtn2);
    rootBody.append(nav);

    const garage = this.createElement('article', ['garage'], { id: 'garage' });
    const winners = this.createElement('article', ['winners', 'hidden'], { id: 'winners' });
    const messages = this.createElement('article', ['messages'], { id: 'messages' });
    const middleMsg = this.createElement('article', ['middle-msg', 'hidden'], { id: 'middle-msg' });
    const p = this.createElement('p', [], { id: 'middle-msg-txt' });
    middleMsg.append(p);
    const middleMsg2 = this.createElement('article', ['middle-msg2', 'hidden'], { id: 'middle-msg2' });
    const p2 = this.createElement('p', [], { id: 'middle-msg-txt2' });
    middleMsg2.append(p2);
    rootBody.append(garage, winners, messages, middleMsg, middleMsg2);

    this.buildGarage('garage');
    this.buildWinners('winners');
  }

  public buildGarage(id: string): void | never {
    const garage: HTMLElement | null = document.getElementById(id);
    if (!garage) throw new Error(`Something wrong with #${id}`);

    const garageTopic = this.createElement('h2', [], {}, 'Garage: <span id="garage-total">0</span> cars');
    const pages = this.createElement('div', ['garage__pages']);
    const prevBtn = this.createElement('button', [], { id: 'garage-page-prev-btn' }, '&lt;');
    const pageNum = this.createElement('p', [], {}, 'Page: <span id="garage-page-cur">1</span> of <span id="garage-page-total">1</span>');
    const nextBtn = this.createElement('button', [], { id: 'garage-page-next-btn' }, '&gt;');
    pages.append(prevBtn, pageNum, nextBtn);

    const create = this.createElement('div', ['garage__create-control']);
    const createcontainer = this.createElement('div');
    const createTxt = this.createElement('input', [], { type: 'text', id: 'garage-create-txt', placeholder: 'Car name...' });
    const createColor = this.createElement('input', [], { type: 'color', id: 'garage-create-color', value: '#ffffff' });
    const createBtn = this.createElement('button', [], { id: 'garage-create-btn', disabled: 'true' }, 'Create');
    createcontainer.append(createTxt, createColor, createBtn);
    create.append(createcontainer);

    const update = this.createElement('div', ['garage__update-control']);
    const updateContainer = this.createElement('div');
    const updateTxt = this.createElement('input', [], { type: 'text', id: 'garage-update-txt', placeholder: 'Car for update...' });
    const updateColor = this.createElement('input', [], { type: 'color', id: 'garage-update-color', value: '#ffffff' });
    const updateId = this.createElement('input', [], { type: 'hidden', id: 'garage-update-id' });
    const updateBtn = this.createElement('button', [], { id: 'garage-update-btn', disabled: 'true' }, 'Update');
    updateContainer.append(updateTxt, updateColor, updateId, updateBtn);
    update.append(updateContainer);

    const race = this.createElement('div', ['garage__race-control']);
    const raceStart = this.createElement('button', [], { id: 'garage-start-btn' }, 'RACE');
    const raceStop = this.createElement('button', [], { id: 'garage-stop-btn' }, 'RESET');
    const raceGen = this.createElement('button', [], { id: 'garage-generate-btn' }, '+100 Cars');
    race.append(raceStart, raceStop, raceGen);

    const timer = this.createElement('div', ['garage__race-timer']);
    const digits = this.createElement('h2', ['garage__timer', 'x-sign'], { id: 'timer-msec' }, '0.000');
    timer.append(digits);

    const list = this.createElement('div', [], { id: 'garage-list' });
    garage.append(garageTopic, pages, create, update, race, timer, list);
  }

  public buildWinners(id: string): void | never {
    const winners: HTMLElement | null = document.getElementById(id);
    if (!winners) throw new Error(`Something wrong with #${id}`);

    const winTopic = this.createElement('h2', [], {}, 'Winners: <span id="winners-total">0</span> crews');
    const winPages = this.createElement('div', ['winners__pages']);
    const prevBtn = this.createElement('button', [], { id: 'winners-page-prev-btn' }, '&lt;');
    const pageNum = this.createElement('p', [], {}, 'Page: <span id="winners-page-cur">1</span> of <span id="winners-page-total">1</span>');
    const nextBtn = this.createElement('button', [], { id: 'winners-page-next-btn' }, '&gt;');
    winPages.append(prevBtn, pageNum, nextBtn);

    const table = this.createElement('table', ['winners__table']);
    const tableHead = this.createElement('thead', ['winners__table-head']);
    const tableHeadTr = this.createElement('tr');
    const tableHeadThId = this.createElement('th');
    tableHeadThId.append(this.createElement('button', [], { id: 'sort-num' }, '№'));
    const tableHeadThCar = this.createElement('th');
    tableHeadThCar.append(this.createElement('button', [], { id: 'sort-car', disabled: 'true' }, 'Car'));
    const tableHeadThName = this.createElement('th');
    tableHeadThName.append(this.createElement('button', [], { id: 'sort-name', disabled: 'true' }, 'Name'));
    const tableHeadThWin = this.createElement('th');
    tableHeadThWin.append(this.createElement('button', [], { id: 'sort-win' }, 'Wins'));
    const tableHeadThTime = this.createElement('th');
    tableHeadThTime.append(this.createElement('button', [], { id: 'sort-time' }, 'Best time'));
    tableHeadTr.append(
      tableHeadThId,
      tableHeadThCar,
      tableHeadThName,
      tableHeadThWin,
      tableHeadThTime,
    );
    tableHead.append(tableHeadTr);
    const tableBody = this.createElement('tbody', ['winners__table-body'], { id: 'winner-list' });
    table.append(tableHead, tableBody);
    winners.append(winTopic, winPages, table);
  }

  public buildCarList(d: ICar[] |Response): void | never {
    const garageList: HTMLElement | null = document.getElementById('garage-list');
    if (!garageList) throw new Error('Something wrong with #garage-list');

    garageList.innerHTML = '';
    const data = d as ICar[];

    for (let i = 0; i < data.length; i += 1) {
      const carBlock = this.createElement('div', ['garage__car-block'], { 'data-id': String(data[i].id) });
      const control = this.createElement('div', ['garage__car-block-control']);
      const name = this.createElement('p', ['garage__car-name'], { 'data-id': String(data[i].id) }, data[i].name);
      const carControl = this.createElement('div', ['garage__car-control']);
      const select = this.createElement('button', ['garage__select-car-btn'], { 'data-id': String(data[i].id) }, 'Select');
      const remove = this.createElement('button', ['garage__remove-car-btn'], { 'data-id': String(data[i].id) }, 'Remove');
      carControl.append(select, remove);

      const driveControl = this.createElement('div', ['garage__car-drive-control']);
      const start = this.createElement('button', ['garage__start-car-btn'], { 'data-id': String(data[i].id) }, 'Go');
      const stop = this.createElement('button', ['garage__stop-car-btn'], { 'data-id': String(data[i].id), disabled: 'true' }, 'X');
      driveControl.append(start, stop);
      control.append(name, carControl, driveControl);

      const drive = this.createElement('div', ['garage__car-drive']);
      const road = this.createElement('div', ['garage__road']);
      const carContainer = this.createElement('div', ['garage__car-container']);
      const num = this.createElement('p', ['garage__car-number'], {}, String(data[i].id));
      const car = this.buildCar(data[i].color);
      const phrase = this.createElement('div', ['garage__car-phrase']);
      const smokeB = this.createElement('img', ['garage__smoke_back'], { alt: 'exhaust', src: SmokeBack });
      const smokeA = this.createElement('img', ['garage__smoke_above'], { alt: 'smoke', src: SmokeAbove });
      const boom = this.createElement('img', ['garage__boom_above'], { alt: 'boom', src: BoomAbove });
      if (car) carContainer.append(car);
      carContainer.append(num, smokeB, smokeA, boom, phrase);
      const surf = this.createElement('div', ['garage__surface']);
      const flag = this.createElement('img', ['garage__flag'], { alt: 'flag', src: flagStat });
      road.append(carContainer, surf, flag);
      drive.append(road);

      carBlock.append(control, drive);
      garageList.append(carBlock);
    }
  }

  public buildCar(color: string): SVGSVGElement | null {
    const car = document.createElement('div');
    car.innerHTML = CarSVG;
    const svg = car.querySelector('svg');
    if (svg) {
      svg.setAttribute('width', '95');
      svg.setAttribute('height', '45');
    }
    const g = car.querySelector('svg g');
    if (g) {
      g.setAttribute('fill', color);
    }
    const wheel1 = car.querySelector('path:nth-child(2)');
    const wheel2 = car.querySelector('path:nth-child(3)');
    if (wheel1 && wheel2) {
      wheel1.setAttribute('fill', 'grey');
      wheel2.setAttribute('fill', 'grey');
    }
    const carEl = car.querySelector('svg');
    return carEl;
  }

  public buildWinnerList(dataW: Response | IWinner[], dataC: Response | ICar[]): void | never {
    const dataWinners = dataW as IWinner[];
    const dataCars = dataC as ICar[];
    const tableBody: HTMLElement | null = document.getElementById('winner-list');
    if (!tableBody) throw new Error('Something wrong with #winner-list');

    tableBody.innerHTML = '';
    let carModel: ICar = { id: 0, name: '', color: '' };
    for (let i = 0; i < dataWinners.length; i += 1) {
      for (let z = 0; z < dataCars.length; z += 1) {
        if (dataCars[z].id === dataWinners[i].id) {
          carModel = dataCars[z];
          break;
        }
      }

      if (carModel.id) {
        const tr = this.createElement('tr');
        const tdId = this.createElement('td', [], {}, String(dataWinners[i].id));
        const tdCar = this.createElement('td');
        const carCont = this.createElement('div', ['winners__car-container']);
        const carEl = this.buildCar(carModel.color);
        if (carEl) carCont.append(carEl);
        tdCar.append(carCont);
        const tdName = this.createElement('td', [], {}, carModel.name);
        const tdWin = this.createElement('td', [], {}, String(dataWinners[i].wins));
        const tdTime = this.createElement('td', [], {}, String(dataWinners[i].time.toFixed(3)));
        tr.append(tdId, tdCar, tdName, tdWin, tdTime);
        tableBody.append(tr);
        carModel.id = 0;
      }
    }
  }

  public addMessage(text: string, type: 'warning' | 'error' | 'info'): void {
    const messageList: HTMLElement | null = document.getElementById('messages');
    if (!messageList) throw new Error('Something wrong with #messages');

    const container = this.createElement('div', [type], { 'data-id': String(this.messageCounter) });
    const p = this.createElement('p', [], {}, text);
    container.append(p);
    messageList.append(container);
    this.deleteMessage(this.messageCounter);
    this.messageCounter += 1;
  }

  public changeFlag(id: number, act: 'stat' | 'anim'): void {
    const flagEl: HTMLElement | null = document.querySelector(`.garage__car-block[data-id="${id}"] .garage__flag`);
    if (flagEl) {
      if (act === 'stat') flagEl.setAttribute('src', flagStat);
      if (act === 'anim') flagEl.setAttribute('src', flagAnim);
    }
  }

  public deleteMessage(index: number): void {
    const message: HTMLElement | null = document.querySelector(`.messages div[data-id="${index}"]`);
    setTimeout(() => {
      if (message) {
        message.style.opacity = '0';
      }
    }, 4500);
    setTimeout(() => {
      if (message) {
        message.style.height = '0px';
      }
    }, 4700);
    setTimeout(() => {
      if (message) {
        message.remove();
      }
    }, 5000);
  }

  public carPhrase(id: number, txt: string, delay = 3000): void {
    const car: HTMLElement | null = document.querySelector(`.garage__car-block[data-id="${id}"] .garage__car-phrase`);
    if (car) {
      const p = this.createElement('p', [], {}, txt);
      p.style.transition = `all ${delay}ms`;
      car.append(p);
      setTimeout(() => {
        p.style.margin = '0 30px 15px 0';
        p.style.transform = 'rotate(-3deg)';
      }, 100);
      setTimeout(() => {
        car.firstChild?.remove();
      }, delay);
    }
  }

  public carSmokeBack(id: number, act: 'start' | 'stop'): void {
    const carEl: HTMLElement | null = document.querySelector(`.garage__car-block[data-id="${id}"] .garage__smoke_back`);
    if (carEl) {
      if (act === 'start') carEl.style.opacity = '0.2';
      if (act === 'stop') carEl.style.opacity = '0';
    }
  }

  public carSmokeAbove(id: number, act: 'start' | 'stop'): void {
    const carEl: HTMLElement | null = document.querySelector(`.garage__car-block[data-id="${id}"] .garage__smoke_above`);
    if (carEl) {
      if (act === 'start') carEl.style.opacity = '.5';
      if (act === 'stop') carEl.style.opacity = '0';
    }
  }

  public boomAbove(id: number): void {
    const carEl: HTMLElement | null = document.querySelector(`.garage__car-block[data-id="${id}"] .garage__boom_above`);
    if (carEl) {
      carEl.style.opacity = '1';
      carEl.setAttribute('src', carEl.getAttribute('src') ?? '');
      setTimeout(() => {
        carEl.style.opacity = '0';
      }, 1000);
    }
  }

  public middleMsg(txt: string, num = 1): void {
    let msg: HTMLElement | null = document.getElementById('middle-msg');
    let msgEl: HTMLElement | null = document.getElementById('middle-msg-txt');

    if (num === 2) {
      msg = document.getElementById('middle-msg2');
      msgEl = document.getElementById('middle-msg-txt2');
    }

    setTimeout(() => {
      if (msgEl && msg) {
        msgEl.innerHTML = txt;
        msg.classList.remove('hidden');
        msgEl.style.opacity = '1';
        if (num === 3) msgEl.style.fontSize = '22px';
      }
    }, 0);

    setTimeout(() => {
      if (msgEl && msg) {
        msgEl.style.opacity = '0';
        if (num === 1) {
          msgEl.style.transform = 'rotate(25deg)';
          msgEl.style.fontSize = '150px';
        } else if (num === 2) {
          msgEl.style.transform = 'rotate(-25deg)';
          msgEl.style.fontSize = '300px';
        } else {
          msgEl.style.transform = 'rotate(-10deg)';
          msgEl.style.fontSize = '100px';
        }
      }
    }, (num === 3) ? 5500 : 1500);
    setTimeout(() => {
      if (msgEl && msg) {
        msgEl.style.transform = '';
        msg.classList.add('hidden');
        msgEl.style.fontSize = '';
        if (num === 3) msgEl.style.fontSize = '';
      }
    }, (num === 3) ? 6000 : 2000);
  }

  public disableCarControlBtn(id: number, arr: string[] = []): void {
    const car: HTMLElement | null = document.querySelector(`.garage__car-block[data-id="${id}"]`);
    if (car) {
      const removeBtn = car.querySelector('.garage__remove-car-btn') as HTMLButtonElement | null;
      const selectBtn = car.querySelector('.garage__select-car-btn') as HTMLButtonElement | null;
      const startBtn = car.querySelector('.garage__start-car-btn') as HTMLButtonElement | null;
      const stopBtn = car.querySelector('.garage__stop-car-btn') as HTMLButtonElement | null;

      if (arr.includes('start') && startBtn) startBtn.disabled = true;
      if (arr.includes('stop') && stopBtn) stopBtn.disabled = true;
      if (arr.includes('select') && selectBtn) selectBtn.disabled = true;
      if (arr.includes('remove') && removeBtn) removeBtn.disabled = true;

      if (arr.length === 0 && removeBtn && selectBtn && startBtn && stopBtn) {
        startBtn.disabled = false;
        stopBtn.disabled = false;
        selectBtn.disabled = false;
        removeBtn.disabled = false;
      }
    }
  }

  public disableRaceControlBtn(arr: string[] = []): void {
    const startBtn = document.getElementById('garage-start-btn') as HTMLButtonElement | null;
    const stopBtn = document.getElementById('garage-stop-btn') as HTMLButtonElement | null;
    const genBtn = document.getElementById('garage-generate-btn') as HTMLButtonElement | null;

    if (arr.length === 0 && startBtn && stopBtn && genBtn) {
      startBtn.disabled = false;
      stopBtn.disabled = false;
      genBtn.disabled = false;
    }

    if (startBtn && arr.includes('start')) startBtn.disabled = true;
    if (stopBtn && arr.includes('stop')) stopBtn.disabled = true;
    if (genBtn && arr.includes('generate')) genBtn.disabled = true;
  }

  public timerStart(): void {
    if (this.timerId) clearTimeout(this.timerId);

    const startTime = Date.now();
    const msec = document.getElementById('timer-msec');
    if (!msec) return;

    this.timerId = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      msec.innerHTML = (elapsedTime / 1000).toFixed(3);
      this.timerResult = String((elapsedTime / 1000).toFixed(3));
    }, 37);
  }

  public timerReset(): void {
    const msec = document.getElementById('timer-msec');
    if (msec) msec.innerHTML = '0.000';
    this.timerResult = '0.000';
  }

  public timerStop(): void {
    if (this.timerId) clearTimeout(this.timerId);
  }
}
