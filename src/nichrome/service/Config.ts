module Nicr.Service {
    export class Config {

        storage:Storage;

        constructor() {
            this.storage = window.localStorage;
        }

        setBBSContainerVisibility(visible:boolean) {
            this.storage.setItem('bbs-container-visibility', visible ? 'true' : 'false');
        }
        getBBSContainerVisibility():boolean {
            return this.storage.getItem('bbs-container-visibility') !== 'false';
        }

        setBoardContainerWidth(width:number) {
            this.storage.setItem('board-container-width', width + '');
        }
        getBoardContainerWidth():number {
            return +this.storage.getItem('board-container-width') || 325;
        }
    }
}