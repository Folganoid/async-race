import { ICar, IConfig } from '../interfaces/Models';
import HTTPservice from '../services/HTTPservice';
import HtmlBuilder from '../view/HtmlBuilder';
import ErrorHandler from './ErrorHandler';
import GarageHandler from './GarageHandler';
import DriveController from './DriveController';
import WinnersHandler from './WinnersHandler';

const smokeBack = require('../../media/smoke10.gif');
const SmokeAbove = require('../../media/smoke6.gif');
const BoomAbove = require('../../media/boom2.gif');

type CarDriveParams = {
  velocity: number,
  distance: number
}

export default class CarHandler {
  private httpService: HTTPservice;

  private htmlBuilder = new HtmlBuilder();

  private errorHandler: ErrorHandler;

  public garageHandler: GarageHandler;

  private winnerHandler: WinnersHandler;

  private driveController: DriveController;

  private APP_CONFIG: IConfig;

  public constructor(json: IConfig) {
    this.APP_CONFIG = json;
    this.httpService = new HTTPservice(this.APP_CONFIG);
    this.winnerHandler = new WinnersHandler(this.APP_CONFIG);
    this.driveController = new DriveController(this.APP_CONFIG);
    this.errorHandler = new ErrorHandler(this.APP_CONFIG);
    this.garageHandler = new GarageHandler(this.APP_CONFIG);
  }

  public init(): void {
    this.createControl();
    this.updateControl();
    this.generate100Cars();
    this.selectControl();
    this.removeControl();
    this.carControl();
    this.startRaceControl();
    this.stopRaceControl();
  }

  private createControl(): void | never {
    const garageCreateTxt = <HTMLInputElement | null>document.getElementById('garage-create-txt');
    const garageCreateColor = <HTMLInputElement | null>document.getElementById('garage-create-color');
    const garageCreateBtn = <HTMLButtonElement | null>document.getElementById('garage-create-btn');
    if (!garageCreateTxt || !garageCreateColor || !garageCreateBtn) throw new Error('Something wrong with .garage__create-control elements');

    garageCreateTxt.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.value === '') {
        garageCreateBtn.disabled = true;
      } else {
        garageCreateBtn.disabled = false;
      }
      if (target.value.length > 20) target.value = target.value.slice(0, 20);
    });

    garageCreateBtn.addEventListener('click', () => {
      const color = garageCreateColor.value;
      const name = garageCreateTxt.value;

      this.httpService.addCar(name, color)
        .then((c) => {
          const car = c as ICar | string;
          if (typeof car === 'object') {
            this.errorHandler.addMessage(`Car ${car.id} added: ${car.name} / ${car.color}`, 'info');
            garageCreateColor.value = '#ffffff';
            garageCreateTxt.value = '';
            garageCreateBtn.disabled = true;
          } else {
            this.errorHandler.addMessage(`Can not add car. Error ${car}`, 'info');
          }
        })
        .then(() => this.httpService.getAll())
        .then((d) => {
          const data = d as ICar[] | string;
          if (typeof data === 'object') {
            this.htmlBuilder.buildCarList(data);
          } else {
            this.errorHandler.addMessage(`ERROR: ${data}`, 'error');
          }
        })
        .then(() => {
          this.garageHandler.setTotal();
          this.garageHandler.setCur();
          this.garageHandler.clearCarsFromPage();
        })
        .catch((e: Error) => {
          this.errorHandler.main(e);
        });
    });
  }

  private updateControl(): void | never {
    const garageUpdateBtn = document.getElementById('garage-update-btn') as HTMLButtonElement | null;
    const garageUpdateTxt = <HTMLInputElement | null>document.querySelector('#garage-update-txt');
    const garageUpdateId = <HTMLInputElement | null>document.querySelector('#garage-update-id');
    const garageUpdateColor = <HTMLInputElement | null>document.querySelector('#garage-update-color');
    if (!garageUpdateColor || !garageUpdateBtn || !garageUpdateTxt || !garageUpdateId) throw new Error('Something wrong with .garage-update-btn');

    garageUpdateTxt.addEventListener('input', () => {
      if (garageUpdateTxt.value.length === 0 || garageUpdateId.value.length === 0) {
        garageUpdateBtn.disabled = true;
      } else {
        garageUpdateBtn.disabled = false;
      }
      if (garageUpdateTxt.value.length > 20) {
        garageUpdateTxt.value = garageUpdateTxt.value.slice(0, 20);
      }
    });

    garageUpdateColor.addEventListener('input', () => {
      if (garageUpdateTxt.value.length === 0 || garageUpdateId.value.length === 0) {
        garageUpdateBtn.disabled = true;
      } else {
        garageUpdateBtn.disabled = false;
      }
    });
    this.updateBtnListener();
  }

  private updateBtnListener(): void | never {
    const garageUpdateBtn = document.getElementById('garage-update-btn') as HTMLButtonElement | null;
    const garageUpdateTxt = <HTMLInputElement | null>document.querySelector('#garage-update-txt');
    const garageUpdateId = <HTMLInputElement | null>document.querySelector('#garage-update-id');
    const garageUpdateColor = <HTMLInputElement | null>document.querySelector('#garage-update-color');
    if (!garageUpdateColor || !garageUpdateBtn || !garageUpdateTxt || !garageUpdateId) throw new Error('Something wrong with .garage-update-btn');

    garageUpdateBtn.addEventListener('click', (): void => {
      if (garageUpdateId.value !== '') {
        this.httpService.updateCar(
          +garageUpdateId.value,
          garageUpdateTxt.value,
          garageUpdateColor.value,
        )
          .then((c) => {
            const car = c as ICar | string;
            const carBlock: HTMLElement | null = document.querySelector(`.garage__car-block[data-id="${garageUpdateId.value}"]`);
            if (typeof car === 'object' && car.id && carBlock) {
              const p: HTMLElement | null = carBlock.querySelector('.garage__car-name');
              if (p) p.innerHTML = garageUpdateTxt.value;
              const name: HTMLElement | null = carBlock.querySelector('.garage__car-name');
              const svg: HTMLElement | null = carBlock.querySelector('.garage__car-container');
              if (name && svg) {
                name.innerHTML = garageUpdateTxt.value;
                svg.innerHTML = '';
                const carEl = this.htmlBuilder.buildCar(garageUpdateColor.value);
                if (carEl) svg.append(carEl);
                svg.append(
                  this.htmlBuilder.createElement('p', ['garage__car-number'], {}, garageUpdateId.value),
                  this.htmlBuilder.createElement('p', ['garage__car-phrase']),
                  this.htmlBuilder.createElement('img', ['garage__smoke_back'], { alt: 'exhaust', src: smokeBack }),
                  this.htmlBuilder.createElement('img', ['garage__smoke_above'], { alt: 'smoke', src: SmokeAbove }),
                  this.htmlBuilder.createElement('img', ['garage__boom_above'], { alt: 'boom', src: BoomAbove }),
                );
              }
              this.errorHandler.addMessage(`Car ${garageUpdateId.value} was updated to ${garageUpdateTxt.value} / ${garageUpdateColor.value}`, 'info');
              garageUpdateTxt.value = '';
              garageUpdateColor.value = '#ffffff';
              garageUpdateId.value = '';
              garageUpdateBtn.disabled = true;
              this.winnerHandler.fillList();
            } else { this.errorHandler.addMessage(`Can not update car ${garageUpdateId.value}`, 'error'); }
          }).catch((e: Error) => { this.errorHandler.main(e); });
      }
    });
  }

  private removeControl(): void | never {
    const garageList: HTMLElement | null = document.getElementById('garage-list');
    if (!garageList) throw new Error('Something wrong with #garage-list');

    garageList.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.garage__remove-car-btn')) return;

      if (target.dataset.id) {
        this.httpService.removeCarById(+target.dataset.id)
          .then((status) => {
            if (typeof status === 'object') {
              this.httpService.getAll()
                .then((d) => {
                  const data = d as ICar[] | string;
                  if (typeof data === 'object') {
                    this.htmlBuilder.buildCarList(data);
                  }
                })
                .then(() => {
                  this.errorHandler.addMessage(`Car ${target.dataset.id} was removed`, 'info');
                }).then(() => {
                  this.garageHandler.setTotal();
                  this.garageHandler.setCur();
                  this.garageHandler.clearCarsFromPage();
                  this.winnerHandler.fillList();
                })
                .catch((err: Error) => {
                  this.errorHandler.main(err);
                });
            } else {
              this.errorHandler.addMessage(`Car ${target.dataset.id} has error ${status}`, 'error');
            }
          })
          .then(() => {
            if (target.dataset.id) {
              this.httpService.deleteWinner(+target.dataset.id);
            }
          })
          .catch((err: Error) => {
            this.errorHandler.main(err);
          });
      }
    });
  }

  private selectControl(): void | never {
    const garageList: HTMLElement | null = document.getElementById('garage-list');
    if (!garageList) throw new Error('Something wrong with #garage-list');

    const garageUpdateTxt = document.getElementById('garage-update-txt') as HTMLInputElement | null;
    const garageUpdateColor = document.getElementById('garage-update-color') as HTMLInputElement | null;
    const garageUpdateId = document.getElementById('garage-update-id') as HTMLInputElement | null;
    const garageUpdateBtn: HTMLElement | null = document.getElementById('garage-update-btn');
    if (!garageUpdateTxt || !garageUpdateColor || !garageUpdateBtn || !garageUpdateId) throw new Error('Something wrong with .garage__update-control elements');

    garageList.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.garage__select-car-btn')) return;

      if (target.dataset.id) {
        this.httpService.getCarById(+target.dataset.id)
          .then((c) => {
            const car = c as ICar | string;
            if (typeof car === 'object') {
              garageUpdateTxt.value = car.name;
              garageUpdateColor.value = car.color;
              garageUpdateId.value = String(car.id);
            } else {
              this.errorHandler.addMessage(`Error ${target.dataset.id}`, 'error');
            }
          }).catch((err: Error) => {
            this.errorHandler.main(err);
          });
      } else {
        this.errorHandler.addMessage(`Car ${target.dataset.id} not found`, 'warning');
      }
    });
  }

  private generate100Cars(): void | never {
    const btn: HTMLElement | null = document.getElementById('garage-generate-btn');
    if (!btn) throw new Error('Something wrong with #garage-generate-btn');

    btn.addEventListener('click', () => {
      const promises: Promise<Response>[] = [];
      for (let i = 0; i < 100; i += 1) {
        const c = this.generateRandomCar();
        promises.push(this.httpService.addCar(c.name, c.color));
      }
      Promise.all(promises)
        .then(() => {
          this.errorHandler.addMessage('+100 cars was generated', 'info');
        })
        .then(() => this.httpService.getAll())
        .then((d) => {
          const data = d as ICar[] | string;
          if (typeof data === 'object') {
            this.htmlBuilder.buildCarList(data);
          } else {
            this.errorHandler.addMessage(`ERROR: ${data}`, 'error');
          }
        })
        .then(() => {
          this.garageHandler.setTotal();
          this.garageHandler.setCur();
          this.garageHandler.clearCarsFromPage();
        })
        .catch((e: Error) => {
          this.errorHandler.main(e);
        });
    });
  }

  private generateRandomCar(): {name: string, color: string} {
    const randomBrand = this.APP_CONFIG.cars.brands[
      Math.floor(Math.random() * this.APP_CONFIG.cars.brands.length)
    ];
    const randomModel = this.APP_CONFIG.cars.models[
      Math.floor(Math.random() * this.APP_CONFIG.cars.models.length)
    ];
    const randomColor = this.getRandomColor();

    return {
      name: `${randomBrand} ${randomModel}`,
      color: randomColor,
    };
  }

  private getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i += 1) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  private carControl(): void | never {
    const garageList: HTMLElement | null = document.getElementById('garage-list');
    if (!garageList) throw new Error('Something wrong with #garage-list');

    garageList.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.garage__start-car-btn') && !target.closest('.garage__stop-car-btn')) return;
      if (target.closest('.garage__start-car-btn') && target.dataset.id) {
        this.htmlBuilder.disableCarControlBtn(+target.dataset.id);
        this.htmlBuilder.disableCarControlBtn(+target.dataset.id, ['start', 'remove', 'select']);
        this.driveController.setMode('solo');
        this.htmlBuilder.disableRaceControlBtn();
        this.htmlBuilder.disableRaceControlBtn(['start']);
        this.httpService.setEngine(+target.dataset.id, 'started')
          .then((r) => {
            const res = r as CarDriveParams | string;
            if (typeof res === 'object' && (res.velocity || res.distance) && target.dataset.id) {
              this.driveController.startEngine(+target.dataset.id);
              this.driveController.driveCar(+target.dataset.id, res.velocity, res.distance);
              this.httpService.setEngine(+target.dataset.id, 'drive')
                .then((s) => {
                  const status = s as {success: boolean} | number | string;
                  if (typeof status === 'object' && status.success && target.dataset.id) {
                    this.driveController.goodCar(+target.dataset.id);
                  } else if (typeof status === 'number' && target.dataset.id && status === 500) {
                    this.driveController.brokenCar(+target.dataset.id);
                  } else {
                    this.errorHandler.addMessage(`Car ${target.dataset.id} has error ${status}`, 'error');
                  }
                }).catch((err: Error) => {
                  this.errorHandler.main(err);
                });
            } else {
              this.errorHandler.addMessage(`Car ${target.dataset.id} has error ${res}`, 'error');
            }
          })
          .catch((err: Error) => {
            this.errorHandler.main(err);
          });
      }

      if (target.closest('.garage__stop-car-btn') && target.dataset.id) {
        this.httpService.setEngine(+target.dataset.id, 'stopped')
          .then((r) => {
            const res = r as CarDriveParams | string;
            if (typeof res === 'object' && (res.velocity || res.distance) && target.dataset.id) {
              this.driveController.stopCar(+target.dataset.id);
            } else if (typeof res === 'string') {
              console.log('++');
              this.errorHandler.addMessage(`Car ${target.dataset.id} has error ${res}`, 'error');
            }
          }).catch((err: Error) => {
            console.log('++++');
            this.errorHandler.main(err);
          });
      }
    });
  }

  private startRaceControl(): void | never {
    const garageList: HTMLElement | null = document.getElementById('garage-list');
    if (!garageList) throw new Error('Something wrong with #garage-list');
    const startBtn: HTMLElement | null = document.getElementById('garage-start-btn');
    if (!startBtn) throw new Error('Something wrong with #garage-start-btn');

    startBtn.addEventListener('click', () => {
      const cars = garageList.querySelectorAll('.garage__car-block:not(.hidden)');
      const carsArray = [...cars];
      if (carsArray.length === 0) return;

      const promises: Promise<CarDriveParams>[] = [];
      const carIds: number[] = [];

      this.htmlBuilder.disableRaceControlBtn();
      this.driveController.setMode('race');
      this.htmlBuilder.disableRaceControlBtn(['start', 'generate']);
      this.htmlBuilder.middleMsg('Start your ENGINES !!!', 1);

      for (let i = 0; i < carsArray.length; i += 1) {
        const car = cars[i] as HTMLElement;
        if (car.dataset.id) {
          const id = +car.dataset.id;
          this.htmlBuilder.disableCarControlBtn(id);
          this.htmlBuilder.disableCarControlBtn(id, ['select', 'remove', 'start']);
          promises.push(this.httpService.setEngine(id, 'started'));
          carIds.push(id);
        }
      }

      Promise.all(promises).then((res) => {
        for (let i = 0; i < res.length; i += 1) {
          const r: CarDriveParams | string = res[i];
          if (typeof r === 'object' && carIds[i]) {
            this.driveController.startEngine(carIds[i]);
            this.driveController.driveCar(carIds[i], r.velocity, r.distance);
            this.htmlBuilder.middleMsg('GO!', 2);
            this.httpService.setEngine(carIds[i], 'drive')
              .then((s) => {
                const status = s as {success: boolean} | number | string;
                if (typeof status === 'object' && status.success) {
                  this.driveController.goodCar(carIds[i]);
                } else if (typeof status === 'number' && status === 500) {
                  this.driveController.brokenCar(carIds[i]);
                } else {
                  this.errorHandler.addMessage(`Car ${carIds[i]} has error ${s}`, 'error');
                }
              }).catch((err: Error) => {
                this.errorHandler.main(err);
              });
          } else {
            this.errorHandler.addMessage(`Car ${carIds[i]} has error ${r}`, 'error');
          }
        }
      }).catch((err: Error) => {
        this.errorHandler.main(err);
      });
    });
  }

  private stopRaceControl(): void | never {
    const garageList: HTMLElement | null = document.getElementById('garage-list');
    if (!garageList) throw new Error('Something wrong with #garage-list');
    const stopBtn: HTMLElement | null = document.getElementById('garage-stop-btn');
    if (!stopBtn) throw new Error('Something wrong with #garage-stop-btn');

    stopBtn.addEventListener('click', () => {
      const cars = garageList.querySelectorAll('.garage__car-block:not(.hidden)');
      const carsArray = [...cars];
      if (carsArray.length === 0) return;

      for (let i = 0; i < carsArray.length; i += 1) {
        const car = cars[i] as HTMLElement;
        if (car.dataset.id) {
          this.httpService.setEngine(+car.dataset.id, 'stopped')
            .then((r) => {
              const res = r as CarDriveParams | string;
              if (typeof res === 'object' && (res.velocity || res.distance) && car.dataset.id) {
                this.driveController.stopCar(+car.dataset.id);
              } else {
                this.errorHandler.addMessage(`Car ${car.dataset.id} has error ${res}`, 'error');
              }
            }).catch((err: Error) => {
              this.errorHandler.main(err);
            });
        }
      }
    });
  }
}
